import mongoose from "mongoose";
import "dotenv/config";
import User from "../models/User.model.js";

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const email = "admin@skyledger.com";
    const password = "AdminPassword@123";

    // Remove existing admin to re-create with correct hash
    await User.deleteOne({ email });

    // Pass the PLAIN password as passwordHash.
    // The User model's pre-save hook will hash it automatically.
    // Do NOT manually hash here — that causes double-hashing!
    await User.create({
      name: "System Admin",
      email,
      phone: "9999999999",
      passwordHash: password,
      role: "admin",
      isVerified: true,
    });

    console.log("-----------------------------------------");
    console.log("Admin account created successfully!");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log("-----------------------------------------");

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createAdmin();
