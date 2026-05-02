import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in .env");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // fail fast
    });

    console.log(`Yes. MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("X MongoDB Connection Failed:");
    console.error(error.message);

    // Exit process (important for production)
    process.exit(1);
  }
};
