import mongoose from "mongoose";

const passengerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    dob: { type: Date, required: true },
    idType: {
      type: String,
      enum: ["passport", "aadhaar", "pan"],
      required: true,
    },
    idNumber: { type: String, required: true },
    seatNumber: { type: String, required: true },
  },
  { _id: false },
);

const bookingSchema = new mongoose.Schema(
  {
    PNR: { type: String, required: true, unique: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    flightId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flight",
      required: true,
    },
    passengers: [passengerSchema],
    seatIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Seat" }],
    cabinClass: { type: String, enum: ["economy", "business", "first"] },
    totalAmount: { type: Number, required: true },
    baseFare: { type: Number, required: true },
    taxes: { type: Number, required: true },

    // Payment
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    // Booking lifecycle
    bookingStatus: {
      type: String,
      enum: ["HOLD", "CONFIRMED", "CANCELLED", "FAILED"],
      default: "HOLD",
    },
    holdExpiry: { type: Date }, // 10 min from creation
    cancelledAt: { type: Date },
    refundAmount: { type: Number },
  },
  { timestamps: true },
);

bookingSchema.index({ userId: 1 });
bookingSchema.index({ PNR: 1 });
bookingSchema.index({ flightId: 1 });

export default mongoose.model("Booking", bookingSchema);
