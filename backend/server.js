import dotenv from "dotenv";
import path from "path";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";

//for security purpose
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

//routes
import authRoutes from "./routes/auth.route.js";
import flightRoutes from "./routes/flight.route.js";
import bookingRoutes from "./routes/booking.route.js";
import adminRoutes from "./routes/admin.route.js";

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
    windowMs: 60 * 1000, // 1 minute
    max: 120, // limit each IP to 120 requests per windowMs
  }),
);

// Request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.url}`);
  next();
});

//Routes
app.get("/", (req, res) => {
  res.send("API working");
});
app.use("/api/auth", authRoutes);
app.use("/api/flights", flightRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);

//Global error handler
const errorHandler = (err, req, res, next) => {
  console.error("❌ ERROR:", err.message || err);

  // Support both err.status and err.statusCode conventions
  const statusCode = err.status || err.statusCode || err.status_code || 500;

  // Only use generic "Internal Server Error" if it's a 500 AND no specific message was provided
  // (though in Node most errors have a .message, we want to prioritize our custom ones)
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message: message,
  });
};

app.use(errorHandler);

//  Start server properly
const startServer = async () => {
  await connectDB();

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();
