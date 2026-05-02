import mongoose from "mongoose";

const airportSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true }, // IATA e.g. DEL
  name: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  timezone: { type: String, required: true }, // e.g. Asia/Kolkata/Tokyo
});

export default mongoose.model("Airport", airportSchema); //export the model to use in other files
