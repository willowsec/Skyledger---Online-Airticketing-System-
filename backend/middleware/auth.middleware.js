import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer "))
    return res.status(401).json({ message: "Not authenticated" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token found" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`✅ JWT verified for ID: ${payload.id}`);

    req.user = await User.findById(payload.id).select("-passwordHash");

    if (!req.user) {
      console.log(`❌ User not found in DB: ${payload.id}`);
      return res.status(401).json({ message: "User not found" });
    }

    console.log(`👤 Auth successful: ${req.user.email}`);
    next();
  } catch (err) {
    console.error("❌ JWT verification failed:", err.message);
    res.status(401).json({ message: "Token invalid or expired" });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin")
    return res.status(403).json({ message: "Admin access only" });
  next();
};
