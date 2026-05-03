import express from "express";
import passport from "passport";

import {
  register,
  verifyOTP,
  login,
  logout,
  refresh,
  resendOTP,
  forgotPassword,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/verify-otp", verifyOTP);
router.post("/login", login);
router.post("/logout", logout);
router.get("/refresh", refresh);
router.post("/resend-otp", resendOTP);
router.post("/forgot-password", forgotPassword);


// Redirect user to Google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

// Google redirects back here
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth`,
  }),
  (req, res) => {
    const { accessToken, refreshToken, user } = req.user;
    // Set refresh token cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 86400 * 1000,
    });
    // Redirect to frontend with access token in URL param
    // Frontend picks it up and stores in memory
    res.redirect(
      `${process.env.CLIENT_URL}/auth/callback?token=${accessToken}`,
    );
  },
);

export default router;
