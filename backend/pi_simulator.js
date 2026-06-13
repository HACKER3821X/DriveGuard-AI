import axios from "axios";

const states = [
  {
    deviceId: "PI-001",
    driverStatus: "Awake",
    drowsinessRisk: "Low",
    bluetoothStatus: "Connected",
    cameraStatus: "Active",
    latitude: 22.7196,
    longitude: 75.8577,
  },
  {
    deviceId: "PI-001",
    driverStatus: "Drowsy",
    drowsinessRisk: "High",
    bluetoothStatus: "Connected",
    cameraStatus: "Active",
    latitude: 22.7196,
    longitude: 75.8577,
  },
  {
    deviceId: "PI-001",
    driverStatus: "Sleeping",
    drowsinessRisk: "Critical",
    bluetoothStatus: "Connected",
    cameraStatus: "Active",
    latitude: 22.7196,
    longitude: 75.8577,
  },
];

let index = 0;

setInterval(async () => {
  try {
    const data = states[index];

    await axios.post("http://localhost:5000/api/data/device-data", data);

    console.log("Fake Raspberry Pi sent:", data.driverStatus);

    index = (index + 1) % states.length;
  } catch (error) {
    console.log("Simulator error:", error.message);
  }
}, 3000);