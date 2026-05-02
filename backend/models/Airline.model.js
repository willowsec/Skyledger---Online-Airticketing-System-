import mongoose from "mongoose";

const airlineSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true }, // ICAO e.g. AI
  name: { type: String, required: true }, // Air India
  logo: { type: String },
  contactEmail: { type: String },
});

export default mongoose.model("Airline", airlineSchema); //export the model to use in other files
