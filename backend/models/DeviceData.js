import mongoose from "mongoose";

const deviceDataSchema = new mongoose.Schema(
  {
    deviceId: String,
    driverStatus: String,
    drowsinessRisk: String,
    bluetoothStatus: String,
    cameraStatus: String,
    latitude: Number,
    longitude: Number,
  },
  { timestamps: true }
);

export default mongoose.model("DeviceData", deviceDataSchema);