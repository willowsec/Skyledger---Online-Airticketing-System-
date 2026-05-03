import Flight from "../models/Flight.model.js";
import Seat from "../models/Seat.model.js";

export const searchFlights = async (req, res, next) => {
  try {
    const {
      origin,
      destination,
      date,
      passengers = 1,
      cabinClass = "economy",
      minPrice,
      maxPrice,
      stops,
      airlines,
      sortBy = "price",
      sortOrder = "asc",
      page = 1,
      limit = 20,
    } = req.query;

    if (!origin || !destination || !date)
      return res
        .status(400)
        .json({ message: "origin, destination, date are required" });

    // Date range: full day in IST
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const query = {
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      departureTime: { $gte: start, $lte: end },
      status: "scheduled",
      [`availableSeats.${cabinClass}`]: { $gte: Number(passengers) },
    };

    if (stops !== undefined) query.stops = Number(stops);
    if (airlines) query["airlineId"] = { $in: airlines.split(",") };
    if (minPrice || maxPrice) {
      query[`baseFare.${cabinClass}`] = {};
      if (minPrice) query[`baseFare.${cabinClass}`].$gte = Number(minPrice);
      if (maxPrice) query[`baseFare.${cabinClass}`].$lte = Number(maxPrice);
    }

    // Sort mapping
    const sortMap = {
      price: `baseFare.${cabinClass}`,
      duration: "duration",
      departure: "departureTime",
    };
    const sort = {
      [sortMap[sortBy] || sortMap.price]: sortOrder === "desc" ? -1 : 1,
    };

    const [flights, total] = await Promise.all([
      Flight.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate("airlineId", "name logo code"),
      Flight.countDocuments(query),
    ]);

    // Shape response
    const results = flights.map((f) => ({
      _id: f._id,
      flightNumber: f.flightNumber,
      airline: f.airlineId,
      origin: f.origin,
      destination: f.destination,
      departureTime: f.departureTime,
      arrivalTime: f.arrivalTime,
      duration: f.duration,
      stops: f.stops,
      availableSeats: f.availableSeats[cabinClass],
      price: f.baseFare[cabinClass],
      status: f.status,
    }));

    res.json({
      results,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
};

export const getFlightById = async (req, res, next) => {
  try {
    const flight = await Flight.findById(req.params.id).populate(
      "airlineId",
      "name logo code",
    );
    if (!flight) return res.status(404).json({ message: "Flight not found" });
    res.json(flight);
  } catch (err) {
    next(err);
  }
};

export const getSeatMap = async (req, res, next) => {
  try {
    const { flightId } = req.params;
    const now = new Date();

    const seats = await Seat.find({ flightId })
      .select("seatNumber cabinClass isAvailable heldUntil heldByUserId")
      .lean();

    // Expire stale holds server-side before returning
    const processed = seats.map((s) => {
      const holdExpired = s.heldUntil && s.heldUntil < now;
      return {
        _id: s._id,
        seatNumber: s.seatNumber,
        cabinClass: s.cabinClass,
        isAvailable: holdExpired ? true : s.isAvailable,
        isHeld: !holdExpired && !!s.heldUntil && s.isAvailable,
      };
    });

    // Group by cabin
    const grouped = {
      first: processed.filter((s) => s.cabinClass === "first"),
      business: processed.filter((s) => s.cabinClass === "business"),
      economy: processed.filter((s) => s.cabinClass === "economy"),
    };

    res.json(grouped);
  } catch (err) {
    next(err);
  }
};
