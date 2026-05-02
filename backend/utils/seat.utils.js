import mongoose from "mongoose";
import { Parser } from "json2csv";
import Flight from "../models/Flight.model.js";
import Booking from "../models/Booking.model.js";
import User from "../models/User.model.js";
import Seat from "../models/Seat.model.js";
import Airline from "../models/Airline.model.js";
import Airport from "../models/Airport.model.js";
import { generateSeats } from "../utils/seat.utils.js";

// ─── Dashboard stats ───────────────────────────────────────────────────────────
export const getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalBookings,
      monthBookings,
      lastMonthBookings,
      totalRevenue,
      monthRevenue,
      lastMonthRevenue,
      activeFlights,
      cancellations,
      recentBookings,
    ] = await Promise.all([
      Booking.countDocuments({ bookingStatus: "CONFIRMED" }),
      Booking.countDocuments({
        bookingStatus: "CONFIRMED",
        createdAt: { $gte: monthStart },
      }),
      Booking.countDocuments({
        bookingStatus: "CONFIRMED",
        createdAt: { $gte: lastStart, $lt: monthStart },
      }),

      Booking.aggregate([
        { $match: { bookingStatus: "CONFIRMED" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Booking.aggregate([
        {
          $match: {
            bookingStatus: "CONFIRMED",
            createdAt: { $gte: monthStart },
          },
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Booking.aggregate([
        {
          $match: {
            bookingStatus: "CONFIRMED",
            createdAt: { $gte: lastStart, $lt: monthStart },
          },
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),

      Flight.countDocuments({
        status: "scheduled",
        departureTime: { $gte: now },
      }),
      Booking.countDocuments({
        bookingStatus: "CANCELLED",
        createdAt: { $gte: monthStart },
      }),

      Booking.find({
        bookingStatus: { $in: ["CONFIRMED", "CANCELLED", "HOLD"] },
      })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("userId", "name email")
        .populate({
          path: "flightId",
          populate: { path: "airlineId", select: "name" },
        }),
    ]);

    const pct = (a, b) => (b === 0 ? 0 : (((a - b) / b) * 100).toFixed(1));

    res.json({
      totalBookings,
      monthBookings,
      bookingGrowth: pct(monthBookings, lastMonthBookings),
      totalRevenue: totalRevenue[0]?.total || 0,
      monthRevenue: monthRevenue[0]?.total || 0,
      revenueGrowth: pct(
        monthRevenue[0]?.total || 0,
        lastMonthRevenue[0]?.total || 0,
      ),
      activeFlights,
      cancellations,
      recentBookings,
    });
  } catch (err) {
    next(err);
  }
};

// ─── Monthly revenue chart data (last 6 months) ────────────────────────────────
export const getRevenueChart = async (req, res, next) => {
  try {
    const data = await Booking.aggregate([
      { $match: { bookingStatus: "CONFIRMED" } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$totalAmount" },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 6 },
    ]);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// ─── Class-wise split ──────────────────────────────────────────────────────────
export const getClassSplit = async (req, res, next) => {
  try {
    const data = await Booking.aggregate([
      { $match: { bookingStatus: "CONFIRMED" } },
      {
        $group: {
          _id: "$cabinClass",
          count: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
    ]);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// ─── Flight CRUD ───────────────────────────────────────────────────────────────
export const getAllFlights = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search)
      query.$or = [
        { flightNumber: { $regex: search, $options: "i" } },
        { origin: { $regex: search, $options: "i" } },
        { destination: { $regex: search, $options: "i" } },
      ];

    const [flights, total] = await Promise.all([
      Flight.find(query)
        .populate("airlineId", "name code")
        .sort({ departureTime: 1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Flight.countDocuments(query),
    ]);
    res.json({ flights, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

export const createFlight = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { seatConfig, ...flightData } = req.body;
    // seatConfig: { economy: 24, business: 4, first: 3 }

    const total = {
      economy: seatConfig.economy * 6,
      business: seatConfig.business * 6,
      first: seatConfig.first * 4,
    };

    const flight = await Flight.create(
      [
        {
          ...flightData,
          totalSeats: total,
          availableSeats: total,
        },
      ],
      { session },
    );

    // Generate seat documents
    await generateSeats(flight[0]._id, seatConfig, session);

    await session.commitTransaction();
    res.status(201).json(flight[0]);
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

export const updateFlight = async (req, res, next) => {
  try {
    const flight = await Flight.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!flight) return res.status(404).json({ message: "Flight not found" });
    res.json(flight);
  } catch (err) {
    next(err);
  }
};

export const cancelFlight = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const flight = await Flight.findByIdAndUpdate(
      req.params.id,
      { status: "cancelled" },
      { new: true, session },
    );
    if (!flight)
      throw Object.assign(new Error("Flight not found"), { status: 404 });

    // Cancel all confirmed bookings for this flight
    const bookings = await Booking.find({
      flightId: req.params.id,
      bookingStatus: "CONFIRMED",
    }).session(session);
    const bookingIds = bookings.map((b) => b._id);

    await Booking.updateMany(
      { _id: { $in: bookingIds } },
      {
        $set: {
          bookingStatus: "CANCELLED",
          cancelledAt: new Date(),
          paymentStatus: "refunded",
        },
      },
      { session },
    );

    // Release all seats
    await Seat.updateMany(
      { flightId: req.params.id },
      { $set: { isAvailable: false, heldUntil: null, heldByUserId: null } },
      { session },
    );

    await session.commitTransaction();

    // TODO: send cancellation emails to affected passengers (async)
    setImmediate(async () => {
      for (const booking of bookings) {
        const user = await User.findById(booking.userId);
        if (user) {
          const { sendFlightCancelledEmail } =
            await import("../services/email.service.js");
          await sendFlightCancelledEmail(user.email, booking, flight).catch(
            console.error,
          );
        }
      }
    });

    res.json({
      message: `Flight cancelled. ${bookings.length} bookings affected.`,
    });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

export const deleteFlight = async (req, res, next) => {
  try {
    const hasBookings = await Booking.exists({
      flightId: req.params.id,
      bookingStatus: "CONFIRMED",
    });
    if (hasBookings)
      return res
        .status(400)
        .json({
          message:
            "Cannot delete flight with confirmed bookings. Cancel it instead.",
        });

    await Promise.all([
      Flight.findByIdAndDelete(req.params.id),
      Seat.deleteMany({ flightId: req.params.id }),
    ]);
    res.json({ message: "Flight deleted" });
  } catch (err) {
    next(err);
  }
};

// ─── Bookings (admin view) ─────────────────────────────────────────────────────
export const getAllBookings = async (req, res, next) => {
  try {
    const {
      search,
      status,
      route,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = req.query;
    const query = {};

    if (status) query.bookingStatus = status;
    if (search) query.$or = [{ PNR: { $regex: search, $options: "i" } }];
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate("userId", "name email")
        .populate({
          path: "flightId",
          populate: { path: "airlineId", select: "name" },
        })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Booking.countDocuments(query),
    ]);

    res.json({ bookings, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// ─── CSV export ────────────────────────────────────────────────────────────────
export const exportBookingsCSV = async (req, res, next) => {
  try {
    const { startDate, endDate, status } = req.query;
    const query = {};
    if (status) query.bookingStatus = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const bookings = await Booking.find(query)
      .populate("userId", "name email")
      .populate("flightId", "flightNumber origin destination departureTime")
      .lean();

    const fields = [
      { label: "PNR", value: "PNR" },
      { label: "Passenger", value: "userId.name" },
      { label: "Email", value: "userId.email" },
      { label: "Flight", value: "flightId.flightNumber" },
      { label: "Origin", value: "flightId.origin" },
      { label: "Destination", value: "flightId.destination" },
      {
        label: "Departure",
        value: (row) =>
          new Date(row.flightId?.departureTime).toLocaleString("en-IN"),
      },
      { label: "Class", value: "cabinClass" },
      { label: "Base fare", value: "baseFare" },
      { label: "Taxes", value: "taxes" },
      { label: "Total (INR)", value: "totalAmount" },
      { label: "Status", value: "bookingStatus" },
      {
        label: "Booked at",
        value: (row) => new Date(row.createdAt).toLocaleString("en-IN"),
      },
    ];

    const csv = new Parser({ fields }).parse(bookings);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="oats-bookings-${Date.now()}.csv"`,
    );
    res.send(csv);
  } catch (err) {
    next(err);
  }
};

// ─── User management ───────────────────────────────────────────────────────────
export const getAllUsers = async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search)
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];

    const [users, total] = await Promise.all([
      User.find(query)
        .select("-passwordHash -otp -otpExpiry")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      User.countDocuments(query),
    ]);

    // Booking count per user
    const ids = users.map((u) => u._id);
    const counts = await Booking.aggregate([
      { $match: { userId: { $in: ids }, bookingStatus: "CONFIRMED" } },
      { $group: { _id: "$userId", count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(
      counts.map((c) => [c._id.toString(), c.count]),
    );

    res.json({
      users: users.map((u) => ({
        ...u.toObject(),
        bookingCount: countMap[u._id.toString()] || 0,
      })),
      total,
    });
  } catch (err) {
    next(err);
  }
};

export const deactivateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin")
      return res.status(403).json({ message: "Cannot deactivate an admin" });
    user.isVerified = false; // Locks out login
    await user.save();
    res.json({ message: "User deactivated" });
  } catch (err) {
    next(err);
  }
};

// ─── Airport + Airline CRUD (abbreviated) ─────────────────────────────────────
export const getAirports = async (req, res, next) => {
  try {
    res.json(await Airport.find().sort({ code: 1 }));
  } catch (err) {
    next(err);
  }
};

export const createAirport = async (req, res, next) => {
  try {
    res.status(201).json(await Airport.create(req.body));
  } catch (err) {
    next(err);
  }
};

export const getAirlines = async (req, res, next) => {
  try {
    res.json(await Airline.find().sort({ name: 1 }));
  } catch (err) {
    next(err);
  }
};

export const createAirline = async (req, res, next) => {
  try {
    res.status(201).json(await Airline.create(req.body));
  } catch (err) {
    next(err);
  }
};
