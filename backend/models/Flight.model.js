import mongoose from "mongoose";

const flightSchema = new mongoose.Schema(
  {
    flightNumber: { type: String, required: true }, // e.g. AI-202
    airlineId: {
      type: mongoose.Schema.Types.ObjectId, // Reference to Airline model in Airline.model.js
      ref: "Airline",
      required: true,
    },
    origin: { type: String, required: true, uppercase: true, trim: true }, // IATA code
    destination: { type: String, required: true, uppercase: true, trim: true }, // IATA code
    departureTime: { type: Date, required: true },
    arrivalTime: { type: Date, required: true },
    duration: { type: Number, required: true }, // minutes
    stops: { type: Number, default: 0 },
    totalSeats: {
      economy: { type: Number, default: 0 },
      business: { type: Number, default: 0 },
      first: { type: Number, default: 0 },
    },
    availableSeats: {
      economy: { type: Number, default: 0 },
      business: { type: Number, default: 0 },
      first: { type: Number, default: 0 },
    },
    baseFare: {
      economy: { type: Number, required: true },
      business: { type: Number, required: true },
      first: { type: Number, required: true },
    },
    status: {
      type: String,
      enum: ["scheduled", "delayed", "cancelled", "completed"],
      default: "scheduled",
    },
  },
  { timestamps: true },
);

// Indexes for fast search
flightSchema.index({ origin: 1, destination: 1, departureTime: 1 });
flightSchema.index({ status: 1 });
flightSchema.index({ airlineId: 1, flightNumber: 1 }, { unique: true });

flightSchema.pre("save", function () {
  if (this.arrivalTime <= this.departureTime) {
    throw new Error("Arrival time must be after departure time");
  }
});

export default mongoose.model("Flight", flightSchema);
