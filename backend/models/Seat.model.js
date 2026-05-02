import mongoose from "mongoose";

const seatSchema = new mongoose.Schema(
  {
    flightId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flight",
      required: true,
    },

    seatNumber: { type: String, required: true }, // e.g. 12A

    cabinClass: {
      type: String,
      enum: ["economy", "business", "first"],
      required: true,
    },

    isAvailable: { type: Boolean, default: true },
    heldUntil: { type: Date, default: null }, // TTL for the 10-min seat lock

    heldByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

seatSchema.index({ flightId: 1, isAvailable: 1 });
seatSchema.index({ flightId: 1, seatNumber: 1 }, { unique: true });

export default mongoose.model("Seat", seatSchema);
