import express from "express";
import Alert from "../models/Alert.js";
import DeviceData from "../models/DeviceData.js";

const router = express.Router();

router.post("/device-data", async (req, res) => {
  try {
    const data = await DeviceData.create(req.body);

    req.io.emit("deviceData", data);

    res.status(201).json({
      message: "Device data saved",
      data,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to save device data",
      error: error.message,
    });
  }
});

router.get("/device-data", async (req, res) => {
  try {
    const data = await DeviceData.find().sort({ createdAt: -1 }).limit(20);
    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch device data",
      error: error.message,
    });
  }
});

router.post("/alerts", async (req, res) => {
  try {
    const alert = await Alert.create(req.body);

    req.io.emit("alert", alert);

    res.status(201).json({
      message: "Alert saved",
      alert,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to save alert",
      error: error.message,
    });
  }
});

router.get("/alerts", async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 }).limit(20);
    res.json(alerts);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch alerts",
      error: error.message,
    });
  }
});

export default router;