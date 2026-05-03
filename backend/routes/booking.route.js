import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  holdSeats,
  initiateBooking,
  verifyPayment,
  handlePaymentFailure,
  getMyBookings,
  getBookingById,
  cancelBooking,
  downloadTicket,
  getPublicBooking,
} from "../controllers/booking.controller.js";

const router = Router();

// Public route for QR scanning (must be BEFORE protect middleware)
router.get("/public/:id", getPublicBooking);

router.use(protect); // all subsequent booking routes require login

router.post("/hold", holdSeats);
router.post("/initiate", initiateBooking);
router.post("/verify-payment", verifyPayment);
router.post("/payment-failed", handlePaymentFailure);
router.get("/my", getMyBookings);
router.get("/:id", getBookingById);
router.delete("/:id", cancelBooking);
router.get("/:id/ticket", downloadTicket);

export default router;
