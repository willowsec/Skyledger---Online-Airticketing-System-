import mongoose from "mongoose";

import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
      minLength: 6,
    },
    phone: {
      type: String,
      required: true,
    },
    passport: { type: String, required: true },
    role: { type: String, enum: ["passenger", "admin"], default: "passenger" }, // he is either a airport admin or a passenger
    isVerified: { type: Boolean, default: false }, // for email verification
    googleId: { type: String }, // for Google OAuth
    otp: { type: String },
    otpExpiry: { type: Date },
  },
  { timestamps: true },
);

//Hashing the password before saving the user
userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

//comparing passwords for non hashed and hashed passwords
userSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

export default mongoose.model("User", userSchema);
