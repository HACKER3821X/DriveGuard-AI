import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    status: String,
    risk: String,
    message: String,
    location: {
      latitude: Number,
      longitude: Number,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Alert", alertSchema);