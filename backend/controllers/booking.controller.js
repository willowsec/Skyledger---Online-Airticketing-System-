import mongoose from "mongoose";
import Razorpay from "razorpay";
import crypto from "crypto";
import Booking from "../models/Booking.model.js";
import Payment from "../models/Payment.model.js";
import Flight from "../models/Flight.model.js";
import Seat from "../models/Seat.model.js";
import { generatePNR, calcFare } from "../utils/booking.utils.js";
import { generateETicketPDF } from "../services/pdf.service.js";
import { sendBookingConfirmation } from "../services/email.service.js";

const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID?.trim();
  const key_secret = process.env.RAZORPAY_KEY_SECRET?.trim();
  console.log(`🔑 Using Razorpay Key: ${key_id?.slice(0, 10)}...`);
  return new Razorpay({ key_id, key_secret });
};

// ─── STEP 1: Hold seats (atomic) ──────────────────────────────────────────────
// Called when user clicks "Continue to passenger details"
export const holdSeats = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { flightId, seatIds, cabinClass } = req.body;
    const userId = req.user.id;
    const holdExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Atomically check + lock all requested seats
    const seats = await Seat.find({ _id: { $in: seatIds }, flightId }).session(
      session,
    );

    if (seats.length !== seatIds.length)
      throw Object.assign(new Error("One or more seats not found"), {
        status: 404,
      });

    for (const seat of seats) {
      const holdExpired = seat.heldUntil && seat.heldUntil < new Date();
      if (!seat.isAvailable && !holdExpired)
        throw Object.assign(
          new Error(`Seat ${seat.seatNumber} is no longer available`),
          { status: 409 },
        );
    }

    // Lock them
    await Seat.updateMany(
      { _id: { $in: seatIds } },
      {
        $set: {
          isAvailable: false,
          heldUntil: holdExpiry,
          heldByUserId: userId,
        },
      },
      { session },
    );

    await session.commitTransaction();
    res.json({
      success: true,
      holdExpiry,
      message: "Seats held for 10 minutes",
    });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

// ─── STEP 2: Initiate booking + create Razorpay order ─────────────────────────
// Called when user submits passenger details form
export const initiateBooking = async (req, res, next) => {
  const razorpay = getRazorpayInstance();
  try {
    const { flightId, seatIds, cabinClass, passengers } = req.body;
    const userId = req.user.id;

    // Verify seats are still held by this user
    const seats = await Seat.find({
      _id: { $in: seatIds },
      heldByUserId: userId,
      heldUntil: { $gt: new Date() },
    });
    if (seats.length !== seatIds.length)
      return res
        .status(409)
        .json({ message: "Seat hold expired. Please re-select seats." });

    const flight = await Flight.findById(flightId).populate("airlineId");
    if (!flight) return res.status(404).json({ message: "Flight not found" });

    const { baseFare, taxes, totalAmount } = calcFare(
      flight.baseFare[cabinClass],
      passengers.length,
    );
    const PNR = generatePNR();

    // Create Razorpay order (amount in paise)
    let order;
    const isMock = process.env.RAZORPAY_KEY_ID === "rzp_test_simulator";

    if (isMock) {
      console.log("🛠️ Using Mock Payment Gateway (Simulator Mode)");
      order = {
        id: `order_mock_${Date.now()}`,
        amount: totalAmount * 100,
        currency: "INR",
        receipt: PNR,
      };
    } else {
      try {
        order = await razorpay.orders.create({
          amount: totalAmount * 100,
          currency: "INR",
          receipt: PNR,
        });
      } catch (rzpErr) {
        console.error("❌ Razorpay Order Creation Failed:", rzpErr);
        if (rzpErr.statusCode === 401) {
          throw Object.assign(
            new Error(
              "Payment Gateway Authentication Failed. Please check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend .env",
            ),
            { status: 500 },
          );
        }
        throw rzpErr;
      }
    }

    // Create booking in HOLD state
    const booking = await Booking.create({
      PNR,
      userId,
      flightId,
      passengers: passengers.map((p, i) => ({
        ...p,
        seatNumber: seats[i].seatNumber,
      })),
      seatIds,
      cabinClass,
      baseFare,
      taxes,
      totalAmount,
      razorpayOrderId: order.id,
      holdExpiry: new Date(Date.now() + 10 * 60 * 1000),
    });

    // Create payment record
    await Payment.create({
      bookingId: booking._id,
      userId,
      amount: totalAmount,
      gatewayOrderId: order.id,
    });

    res.json({
      bookingId: booking._id,
      PNR,
      razorpayOrderId: order.id,
      amount: totalAmount,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID,
      isMock,
      prefill: {
        // Pre-fill Razorpay modal for UX
        name: passengers[0].name,
        email: req.user.email,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── STEP 3: Verify payment + confirm booking ──────────────────────────────────
// Called after Razorpay checkout succeeds (frontend posts the payment IDs back)
export const verifyPayment = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      bookingId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      isMock,
    } = req.body;

    // ── HMAC signature verification — critical security step ──
    if (!isMock) {
      const expectedSig = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");

      if (expectedSig !== razorpaySignature) {
        return res.status(400).json({
          message: "Payment verification failed. Possible tampering.",
        });
      }
    } else {
      console.log("🛠️ Skipping Signature Verification (Simulator Mode)");
    }

    const booking = await Booking.findById(bookingId)
      .session(session)
      .populate("flightId");
    if (!booking)
      throw Object.assign(new Error("Booking not found"), { status: 404 });
    if (booking.bookingStatus !== "HOLD")
      return res.status(409).json({ message: "Booking already processed" });

    // ── Confirm booking in a single transaction ──
    booking.razorpayPaymentId = razorpayPaymentId;
    booking.paymentStatus = "paid";
    booking.bookingStatus = "CONFIRMED";
    booking.holdExpiry = null;
    await booking.save({ session });

    // Permanently lock seats (remove hold TTL)
    await Seat.updateMany(
      { _id: { $in: booking.seatIds } },
      { $set: { isAvailable: false, heldUntil: null } },
      { session },
    );

    // Decrement availableSeats on the flight
    await Flight.findByIdAndUpdate(
      booking.flightId,
      {
        $inc: {
          [`availableSeats.${booking.cabinClass}`]: -booking.passengers.length,
        },
      },
      { session },
    );

    // Update payment record
    await Payment.findOneAndUpdate(
      { gatewayOrderId: razorpayOrderId },
      { $set: { gatewayPaymentId: razorpayPaymentId, status: "paid" } },
      { session },
    );

    await session.commitTransaction();

    // ── Post-confirm: generate PDF + send email (async, don't block response) ──
    const populatedBooking = await Booking.findById(bookingId)
      .populate("flightId")
      .populate({ path: "flightId", populate: { path: "airlineId" } });

    setImmediate(async () => {
      try {
        const pdfBuffer = await generateETicketPDF(populatedBooking);
        await sendBookingConfirmation(
          req.user.email,
          populatedBooking,
          pdfBuffer,
        );
      } catch (e) {
        console.error("Post-booking email/PDF error:", e);
      }
    });

    res.json({ success: true, PNR: booking.PNR, bookingId: booking._id });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

// ─── Payment failure handler ───────────────────────────────────────────────────
export const handlePaymentFailure = async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.bookingStatus = "FAILED";
    booking.paymentStatus = "failed";
    await booking.save();

    // Release seat hold
    await Seat.updateMany(
      { _id: { $in: booking.seatIds } },
      { $set: { isAvailable: true, heldUntil: null, heldByUserId: null } },
    );

    res.json({ message: "Seat hold released" });
  } catch (err) {
    next(err);
  }
};

// ─── Passenger dashboard: list my bookings ────────────────────────────────────
export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({
      userId: req.user.id,
      bookingStatus: { $ne: "FAILED" },
    })
      .populate({
        path: "flightId",
        populate: { path: "airlineId", select: "name logo" },
      })
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

// ─── Get single booking ───────────────────────────────────────────────────────
export const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user.id,
    }).populate({ path: "flightId", populate: { path: "airlineId" } });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(booking);
  } catch (err) {
    next(err);
  }
};

// ─── Cancel booking ───────────────────────────────────────────────────────────
export const cancelBooking = async (req, res, next) => {
  const session = await mongoose.startSession();
  const razorpay = getRazorpayInstance();
  session.startTransaction();
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user.id,
    })
      .session(session)
      .populate("flightId");
    if (!booking)
      throw Object.assign(new Error("Booking not found"), { status: 404 });
    if (booking.bookingStatus !== "CONFIRMED")
      throw Object.assign(
        new Error("Only confirmed bookings can be cancelled"),
        { status: 400 },
      );

    // Must be > 24h before departure
    const departure = new Date(booking.flightId.departureTime);
    if (departure - new Date() < 24 * 3600 * 1000)
      throw Object.assign(
        new Error("Cancellation not allowed within 24 hours of departure"),
        { status: 400 },
      );

    // Razorpay refund (80% of totalAmount — standard policy)
    const refundAmount = Math.round(booking.totalAmount * 0.8);
    const payment = await Payment.findOne({ bookingId: booking._id });
    if (payment?.gatewayPaymentId) {
      const refund = await razorpay.payments.refund(payment.gatewayPaymentId, {
        amount: refundAmount * 100,
        notes: { reason: "Passenger cancellation" },
      });
      payment.refundId = refund.id;
      payment.status = "refunded";
      await payment.save({ session });
    }

    // Update booking
    booking.bookingStatus = "CANCELLED";
    booking.paymentStatus = "refunded";
    booking.cancelledAt = new Date();
    booking.refundAmount = refundAmount;
    await booking.save({ session });

    // Restore seat availability
    await Seat.updateMany(
      { _id: { $in: booking.seatIds } },
      { $set: { isAvailable: true, heldUntil: null, heldByUserId: null } },
      { session },
    );

    // Restore flight seat count
    await Flight.findByIdAndUpdate(
      booking.flightId._id,
      {
        $inc: {
          [`availableSeats.${booking.cabinClass}`]: booking.passengers.length,
        },
      },
      { session },
    );

    await session.commitTransaction();
    res.json({ message: "Booking cancelled", refundAmount, PNR: booking.PNR });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};
export const downloadTicket = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user.id,
    }).populate({ path: "flightId", populate: { path: "airlineId" } });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.bookingStatus !== "CONFIRMED")
      return res
        .status(400)
        .json({ message: "Ticket only available for confirmed bookings" });

    const pdfBuffer = await generateETicketPDF(booking);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${booking.PNR}-eticket.pdf"`,
    );
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
};

// ─── Public verification (for QR scanning) ───────────────────────────────────
export const getPublicBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({ path: "flightId", populate: { path: "airlineId" } })
      .select("PNR passengers cabinClass bookingStatus flightId createdAt");

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    res.json(booking);
  } catch (err) {
    next(err);
  }
};
