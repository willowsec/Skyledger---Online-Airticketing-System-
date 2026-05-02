import mongoose from "mongoose";

mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 3000,
  })
  .then(() => console.log("CONNECTED"))
  .catch((err) => console.error("FAILED:", err.message));
