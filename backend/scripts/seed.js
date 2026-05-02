import mongoose from "mongoose";
import "dotenv/config";
import Airport from "../models/Airport.model.js";
import Airline from "../models/Airline.model.js";
import Flight from "../models/Flight.model.js";
import Seat from "../models/Seat.model.js";

await mongoose.connect(process.env.MONGO_URI);
await Airport.deleteMany({});
await Airline.deleteMany({});
await Flight.deleteMany({});
await Seat.deleteMany({});
// ── Airports ──────────────────────────────────────────
const airports = await Airport.insertMany([
  {
    code: "DEL",
    name: "Indira Gandhi International",
    city: "Delhi",
    country: "India",
    timezone: "Asia/Kolkata",
  },
  {
    code: "BOM",
    name: "Chhatrapati Shivaji Maharaj",
    city: "Mumbai",
    country: "India",
    timezone: "Asia/Kolkata",
  },
  {
    code: "BLR",
    name: "Kempegowda International",
    city: "Bengaluru",
    country: "India",
    timezone: "Asia/Kolkata",
  },
  {
    code: "CCU",
    name: "Netaji Subhas Chandra Bose",
    city: "Kolkata",
    country: "India",
    timezone: "Asia/Kolkata",
  },
  {
    code: "GAU",
    name: "Lokpriya Gopinath Bordoloi",
    city: "Guwahati",
    country: "India",
    timezone: "Asia/Kolkata",
  },
  {
    code: "JFK",
    name: "John F. Kennedy International",
    city: "New York",
    country: "USA",
    timezone: "America/New_York",
  },
  {
    code: "DXB",
    name: "Dubai International",
    city: "Dubai",
    country: "UAE",
    timezone: "Asia/Dubai",
  },
]);

// ── Airlines ──────────────────────────────────────────
const airlines = await Airline.insertMany([
  {
    code: "AI",
    name: "Air India",
    logo: "https://tse3.mm.bing.net/th/id/OIP.S2eb0kizft-qAacUx38e8gHaEK?pid=Api&P=0&h=180",
  },
  {
    code: "6E",
    name: "IndiGo",
    logo: "https://tse1.mm.bing.net/th/id/OIP.lkuL0sjbkM_FHSc7YTk2egHaEK?pid=Api",
  },
  {
    code: "SG",
    name: "SpiceJet",
    logo: "https://tse1.mm.bing.net/th/id/OIP.---KjTlKsJ7iNaQRhUee6QHaCr?pid=Api&P=0&h=180",
  },
]);

// ── Helper: generate seats for a flight ───────────────
const generateSeats = async (flightId, config) => {
  const seats = [];
  const classes = [
    {
      cabin: "first",
      rows: config.first,
      cols: ["A", "B", "C", "D"],
      startRow: 1,
    },
    {
      cabin: "business",
      rows: config.business,
      cols: ["A", "B", "C", "D", "E", "F"],
      startRow: config.first + 1,
    },
    {
      cabin: "economy",
      rows: config.economy,
      cols: ["A", "B", "C", "D", "E", "F"],
      startRow: config.first + config.business + 1,
    },
  ];
  for (const cls of classes) {
    for (let r = 0; r < cls.rows; r++) {
      for (const col of cls.cols) {
        seats.push({
          flightId,
          seatNumber: `${cls.startRow + r}${col}`,
          cabinClass: cls.cabin,
        });
      }
    }
  }
  await Seat.insertMany(seats);
};

// ── Flights ───────────────────────────────────────────
const airlineMap = Object.fromEntries(airlines.map((a) => [a.code, a._id]));
const now = new Date();

const flightDefs = [
  // DEL → BOM
  {
    flightNumber: "AI-101",
    airline: "AI",
    origin: "DEL",
    destination: "BOM",
    depOffset: 2,
    dur: 130,
    fare: { economy: 4500, business: 12000, first: 22000 },
  },
  {
    flightNumber: "6E-201",
    airline: "6E",
    origin: "DEL",
    destination: "BOM",
    depOffset: 5,
    dur: 125,
    fare: { economy: 3800, business: 10500, first: 0 },
  },
  {
    flightNumber: "SG-301",
    airline: "SG",
    origin: "DEL",
    destination: "BOM",
    depOffset: 8,
    dur: 135,
    fare: { economy: 3500, business: 9800, first: 0 },
  },
  // DEL → BLR
  {
    flightNumber: "AI-102",
    airline: "AI",
    origin: "DEL",
    destination: "BLR",
    depOffset: 3,
    dur: 165,
    fare: { economy: 5200, business: 14000, first: 26000 },
  },
  {
    flightNumber: "6E-202",
    airline: "6E",
    origin: "DEL",
    destination: "BLR",
    depOffset: 7,
    dur: 160,
    fare: { economy: 4600, business: 12500, first: 0 },
  },
  // DEL → GAU
  {
    flightNumber: "AI-103",
    airline: "AI",
    origin: "DEL",
    destination: "GAU",
    depOffset: 6,
    dur: 180,
    fare: { economy: 5800, business: 15000, first: 28000 },
  },
  {
    flightNumber: "6E-203",
    airline: "6E",
    origin: "DEL",
    destination: "GAU",
    depOffset: 10,
    dur: 175,
    fare: { economy: 5100, business: 13000, first: 0 },
  },
  // BOM → BLR
  {
    flightNumber: "SG-302",
    airline: "SG",
    origin: "BOM",
    destination: "BLR",
    depOffset: 4,
    dur: 90,
    fare: { economy: 3200, business: 8500, first: 0 },
  },
  // International
  {
    flightNumber: "AI-910",
    airline: "AI",
    origin: "DEL",
    destination: "JFK",
    depOffset: 14,
    dur: 960,
    fare: { economy: 45000, business: 120000, first: 250000 },
  },
  {
    flightNumber: "AI-911",
    airline: "AI",
    origin: "DEL",
    destination: "DXB",
    depOffset: 9,
    dur: 240,
    fare: { economy: 18000, business: 48000, first: 95000 },
  },
];

for (const def of flightDefs) {
  const dep = new Date(
    now.getTime() + def.depOffset * 3600_000 + Math.random() * 86400_000,
  );
  const arr = new Date(dep.getTime() + def.dur * 60_000);
  const hasFirst = def.fare.first > 0;
  const config = { first: hasFirst ? 3 : 0, business: 4, economy: 24 };
  const total = {
    economy: config.economy * 6,
    business: config.business * 6,
    first: config.first * 4,
  };

  const flight = await Flight.create({
    flightNumber: def.flightNumber,
    airlineId: airlineMap[def.airline],
    origin: def.origin,
    destination: def.destination,
    departureTime: dep,
    arrivalTime: arr,
    duration: def.dur,
    stops: 0,
    totalSeats: total,
    availableSeats: total,
    baseFare: def.fare,
  });
  await generateSeats(flight._id, config);
}

console.log("✅ Seed complete");
await mongoose.disconnect();
