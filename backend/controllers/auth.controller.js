import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.model.js";
import { sendOTPEmail } from "../services/email.service.js";

const signTokens = (userId, role, name) => ({
  accessToken: jwt.sign({ id: userId, role, name }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  }),
  refreshToken: jwt.sign({ id: userId, role, name }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  }),
});

const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
};

//register a user

export const register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;
    if (await User.findOne({ email })) {
      return res
        .status(409)
        .json({ message: "Email already registered in SkyLedger" });
    }

    const otp = crypto.randomInt(100000, 999999).toString(); // creating a 6 digit OTP
    //Creating a user with the provided details and the generated OTP, and setting the OTP expiry to 10 minutes from now

    const user = await User.create({
      name,
      email,
      phone,
      passwordHash: password,
      otp,
      otpExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 min
    });

    await sendOTPEmail(email, otp);
    res.status(201).json({
      message: "OTP sent to email. Verify to activate account.",
      userId: user._id, // mongoose automatically creates an _id field for each document, which is a unique identifier for that document in the database. We can use this _id to reference the user when they attempt to verify their OTP.
    });
  } catch (err) {
    next(err);
  }
};

//Verifying the OTP entered by the user during registration. If the OTP is valid and not expired, we mark the user's email as verified and generate JWT tokens for authentication. We also set a refresh token in an HTTP-only cookie for secure storage on the client side. Finally, we return the access token and user details in the response.
export const verifyOTP = async (req, res, next) => {
  try {
    const { userId, otp } = req.body;
    const user = await User.findById(userId);
    if (!user || user.otp !== otp || user.otpExpiry < new Date())
      return res.status(400).json({ message: "Invalid or expired OTP" });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const { accessToken, refreshToken } = signTokens(user._id, user.role, user.name);
    res.cookie("refreshToken", refreshToken, {
      ...cookieOpts,
      maxAge: 7 * 86400 * 1000,
    });
    res.json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

//User login with email and password. We check if the user exists, if the password is correct, and if the email is verified. If all checks pass, we generate JWT tokens and return them in the response, along with setting a refresh token in an HTTP-only cookie for secure storage on the client side.
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.passwordHash)
      return res.status(401).json({ message: "Invalid credentials" });
    if (!(await user.comparePassword(password)))
      return res.status(401).json({ message: "Invalid credentials" });
    if (!user.isVerified)
      return res
        .status(403)
        .json({ message: "Please verify your email first" });

    const { accessToken, refreshToken } = signTokens(user._id, user.role, user.name);
    res.cookie("refreshToken", refreshToken, {
      ...cookieOpts,
      maxAge: 7 * 86400 * 1000,
    });
    res.json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

//logout by clearing the refresh token cookie
export const logout = (req, res) => {
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out" });
};

//Refreshing the access token using the refresh token stored in the HTTP-only cookie. We verify the refresh token, check if the user exists, and if valid, generate a new access token and return it in the response.
export const refresh = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: "No refresh token" });
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ message: "User not found" });
    const { accessToken } = signTokens(user._id, user.role, user.name);
    res.json({ accessToken });
  } catch (err) {
    next(err);
  }
};

export const resendOTP = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified)
      return res.status(400).json({ message: "Account already verified" });

    const otp = crypto.randomInt(100000, 999999).toString();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOTPEmail(user.email, otp);
    res.json({ message: "OTP resent successfully" });
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "No account with this email" });

    const otp = crypto.randomInt(100000, 999999).toString();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    user.isVerified = false; // re-verify to reset password
    await user.save();

    await sendOTPEmail(email, otp);
    res.json({ message: "OTP sent", userId: user._id });
  } catch (err) {
    next(err);
  }
};
