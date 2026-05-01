import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/user.model.js";
import { sendOTPEmail } from "../services/email.service.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
