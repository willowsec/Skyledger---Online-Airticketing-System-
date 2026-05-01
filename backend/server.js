import express from "express";
import mongoose from "mongoose";

//for security purpose
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

//for keeping the API keys and other secrets safe
import dotenv from "dotenv";
dotenv.config();

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

//Global error handler
const errorhandler = (err, req, res, next) => {
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

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`),
    );
  })
  .catch((err) => console.error(err));
