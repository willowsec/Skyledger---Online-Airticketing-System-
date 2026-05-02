import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    gatewayOrderId: { type: String }, // Razorpay order_id
    gatewayPaymentId: { type: String }, // Razorpay payment_id
    status: {
      type: String,
      enum: ["created", "paid", "failed", "refunded"],
      default: "created",
    },
    method: { type: String }, // card / upi / netbanking
    refundId: { type: String },
  },
  { timestamps: true },
);

// NEVER store card numbers / CVV — only gateway IDs
export default mongoose.model("Payment", paymentSchema);
