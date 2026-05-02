import dotenv from "dotenv";

import express from "express";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import path from "path";

//for security purpose
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

//routes
import authRoutes from "./routes/auth.route.js";
import flightRoutes from "./routes/flight.route.js";
// import bookingRoutes from './routes/booking.routes.js';
// import adminRoutes from './routes/admin.routes.js';
dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
  debug: true,
  override: true,
});

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use(
  rateLimit({
    windowMs: 60 * 1000, // 1 minutes
    max: 60, // limit each IP to 60 requests per windowMs
  }),
);

//Routes
app.get("/", (req, res) => {
  res.send("API working");
});
app.use("/api/auth", authRoutes);
app.use("/api/flights", flightRoutes);
// app.use('/api/bookings', bookingRoutes);
// app.use('/api/admin', adminRoutes);
//Global error handler
const errorhandler = (err, req, res, next) => {
  console.error("❌ ERROR:", err); // ADD THIS

  const status_code = err.status_code || 500;

  const message = status_code === 500 ? "Internal Server Error" : err.message;

  res.status(status_code).json({
    success: false,
    message: message,
  });
};

app.use(errorhandler);

app.get("/error", (req, res, next) => {
  const err = new Error("Test error");
  err.status_code = 400;
  next(err);
});

//  Start server properly
const startServer = async () => {
  await connectDB();

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();
