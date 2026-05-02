import express from "express";
import {
  register,
  verifyOTP,
  login,
  logout,
  refresh,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/verify-otp", verifyOTP);
router.post("/login", login);
router.post("/logout", logout);
router.get("/refresh", refresh);

export default router;
