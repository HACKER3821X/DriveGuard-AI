import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import {
  Camera,
  MapPin,
  Bluetooth,
  Car,
  AlertTriangle,
  Activity,
} from "lucide-react";

function Dashboard() {
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const [activeSection, setActiveSection] = useState("dashboard");
  const [deviceData, setDeviceData] = useState(null);

  const [cameraStatus, setCameraStatus] = useState("Not Connected");
  const [locationStatus, setLocationStatus] = useState("Not Connected");
  const [bluetoothStatus, setBluetoothStatus] = useState("Not Connected");

  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    accuracy: null,
  });

  const SERVICE_UUID = "12345678-1234-5678-1234-56789abcdef0";
  const CHARACTERISTIC_UUID = "abcdef12-3456-7890-abcd-ef1234567890";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/");
  }, [navigate]);

  useEffect(() => {
    fetchDeviceData();
  }, []);

  useEffect(() => {
    const socket = io("http://localhost:5000");

    socket.on("connect", () => {
      console.log("Connected to backend socket");
    });

    socket.on("deviceData", (newData) => {
      console.log("New device data received:", newData);
      setDeviceData(newData);
    });

    return () => socket.disconnect();
  }, []);

  const fetchDeviceData = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/data/device-data");
      if (res.data.length > 0) setDeviceData(res.data[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraStatus("Camera Connected");
      setActiveSection("camera");
    } catch (error) {
      setCameraStatus("Camera Permission Denied");
      console.log(error);
    }
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("Location Not Supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });

        setLocationStatus("Location Connected");
        setActiveSection("location");
      },
      (error) => {
        setLocationStatus("Location Permission Denied");
        console.log(error);
      }
    );
  };

  const connectBluetooth = async () => {
    try {
      if (!navigator.bluetooth) {
        setBluetoothStatus("Bluetooth Not Supported");
        return;
      }

      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [SERVICE_UUID],
      });

      setBluetoothStatus(`Connecting: ${device.name || "Raspberry Pi"}`);
      setActiveSection("bluetooth");

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(SERVICE_UUID);
      const characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);
      await characteristic.startNotifications();

      characteristic.addEventListener(
        "characteristicvaluechanged",
        async (event) => {
          const value = event.target.value;
          const text = new TextDecoder().decode(value);

          console.log("Bluetooth data:", text);

          const piData = JSON.parse(text);

          setDeviceData(piData);
          setBluetoothStatus("Receiving Live Data");

          await axios.post("http://localhost:5000/api/data/device-data", piData);
        }
      );
    } catch (error) {
      setBluetoothStatus("Bluetooth Failed");
      console.log(error);
    }
  };

  const menuButton = (section, label) => (
    <button
      onClick={() => setActiveSection(section)}
      className={`w-full text-left px-4 py-3 rounded-xl ${
        activeSection === section
          ? "bg-cyan-500/20 text-cyan-300"
          : "hover:bg-white/10 text-gray-300"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#050816] text-white flex">
      <aside className="w-72 bg-black/30 border-r border-white/10 p-6 hidden md:block">
        <div className="flex items-center gap-3 mb-10">
          <Car className="text-cyan-400" size={34} />
          <div>
            <h1 className="text-2xl font-bold">DriveGuard</h1>
            <p className="text-sm text-gray-400">AI Safety Panel</p>
          </div>
        </div>

        <nav className="space-y-4">
          {menuButton("dashboard", "Dashboard")}
          {menuButton("camera", "Camera")}
          {menuButton("location", "Location")}
          {menuButton("bluetooth", "Bluetooth")}
          {menuButton("alerts", "Alert Logs")}
          {menuButton("emergency", "Emergency Contacts")}
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Driver Monitoring Dashboard
            </h1>
            <p className="text-gray-400">
              Live monitoring system connected with Raspberry Pi
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="px-5 py-2 bg-red-500 hover:bg-red-600 rounded-xl font-bold"
          >
            Logout
          </button>
        </div>

        {activeSection === "dashboard" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-green-500/10 border border-green-500/20 rounded-3xl p-6">
                <Activity className="text-green-400 mb-4" size={32} />
                <p className="text-gray-400">Driver Status</p>
                <h2 className="text-3xl font-bold text-green-400">
                  {deviceData?.driverStatus || "No Data"}
                </h2>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-3xl p-6">
                <AlertTriangle className="text-yellow-400 mb-4" size={32} />
                <p className="text-gray-400">Drowsiness Risk</p>
                <h2 className="text-3xl font-bold text-yellow-400">
                  {deviceData?.drowsinessRisk || "No Data"}
                </h2>
              </div>

              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-3xl p-6">
                <Car className="text-cyan-400 mb-4" size={32} />
                <p className="text-gray-400">Device Status</p>
                <h2 className="text-3xl font-bold text-cyan-400">
                  {deviceData?.bluetoothStatus || "Offline"}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={startCamera}
                className="bg-white/10 border border-white/10 rounded-3xl p-8 hover:bg-white/20 transition text-center"
              >
                <Camera className="text-cyan-400 mb-4 mx-auto" size={40} />
                <h3 className="text-2xl font-bold mb-2">Camera Permission</h3>
                <p className="text-gray-400">{cameraStatus}</p>
              </button>

              <button
                onClick={getLocation}
                className="bg-white/10 border border-white/10 rounded-3xl p-8 hover:bg-white/20 transition text-center"
              >
                <MapPin className="text-cyan-400 mb-4 mx-auto" size={40} />
                <h3 className="text-2xl font-bold mb-2">Location Access</h3>
                <p className="text-gray-400">{locationStatus}</p>
              </button>

              <button
                onClick={connectBluetooth}
                className="bg-white/10 border border-white/10 rounded-3xl p-8 hover:bg-white/20 transition text-center"
              >
                <Bluetooth className="text-cyan-400 mb-4 mx-auto" size={40} />
                <h3 className="text-2xl font-bold mb-2">Bluetooth Connect</h3>
                <p className="text-gray-400">{bluetoothStatus}</p>
              </button>
            </div>
          </>
        )}

        {activeSection === "camera" && (
          <div className="bg-white/10 border border-white/10 rounded-3xl p-6">
            <h2 className="text-2xl font-bold mb-4">Live Camera Preview</h2>

            <button
              onClick={startCamera}
              className="mb-5 px-5 py-3 bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl font-bold"
            >
              Start Camera
            </button>

            <p className="text-gray-400 mb-4">{cameraStatus}</p>

            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full max-w-4xl rounded-2xl border border-white/10 bg-black"
            />
          </div>
        )}

        {activeSection === "location" && (
          <div className="bg-white/10 border border-white/10 rounded-3xl p-6">
            <h2 className="text-2xl font-bold mb-4">GPS Location Data</h2>

            <button
              onClick={getLocation}
              className="mb-5 px-5 py-3 bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl font-bold"
            >
              Get Location
            </button>

            <p className="text-gray-400 mb-3">Status: {locationStatus}</p>
            <p className="text-gray-400 mb-2">
              Latitude:{" "}
              <span className="text-white">
                {location.latitude || "Not available"}
              </span>
            </p>
            <p className="text-gray-400 mb-2">
              Longitude:{" "}
              <span className="text-white">
                {location.longitude || "Not available"}
              </span>
            </p>
            <p className="text-gray-400">
              Accuracy:{" "}
              <span className="text-white">
                {location.accuracy
                  ? `${Math.round(location.accuracy)} meters`
                  : "Not available"}
              </span>
            </p>
          </div>
        )}

        {activeSection === "bluetooth" && (
          <div className="bg-white/10 border border-white/10 rounded-3xl p-6">
            <h2 className="text-2xl font-bold mb-4">Bluetooth Communication</h2>

            <button
              onClick={connectBluetooth}
              className="mb-5 px-5 py-3 bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl font-bold"
            >
              Connect Raspberry Pi Bluetooth
            </button>

            <p className="text-gray-400 mb-4">Status: {bluetoothStatus}</p>

            <div className="bg-black/30 rounded-2xl p-5 border border-white/10">
              <h3 className="text-xl font-bold mb-3">Latest Bluetooth / Pi Data</h3>
              <pre className="text-sm text-cyan-300 whitespace-pre-wrap">
                {deviceData
                  ? JSON.stringify(deviceData, null, 2)
                  : "No Raspberry Pi data received yet"}
              </pre>
            </div>
          </div>
        )}

        {activeSection === "alerts" && (
          <div className="bg-white/10 border border-white/10 rounded-3xl p-6">
            <h2 className="text-2xl font-bold mb-4">Alert Logs</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-gray-400 border-b border-white/10">
                  <tr>
                    <th className="py-3">Driver Status</th>
                    <th className="py-3">Risk</th>
                    <th className="py-3">Bluetooth</th>
                    <th className="py-3">Camera</th>
                    <th className="py-3">Location</th>
                  </tr>
                </thead>

                <tbody>
                  <tr className="border-b border-white/10">
                    <td className="py-3">
                      {deviceData?.driverStatus || "No Data"}
                    </td>
                    <td className="py-3">
                      {deviceData?.drowsinessRisk || "No Data"}
                    </td>
                    <td className="py-3">
                      {deviceData?.bluetoothStatus || "Offline"}
                    </td>
                    <td className="py-3">
                      {deviceData?.cameraStatus || cameraStatus}
                    </td>
                    <td className="py-3">
                      {deviceData?.latitude && deviceData?.longitude
                        ? `${deviceData.latitude}, ${deviceData.longitude}`
                        : "Not available"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeSection === "emergency" && (
  <div className="bg-white/10 border border-white/10 rounded-3xl p-6">
    <h2 className="text-3xl font-bold mb-6 text-red-400">
      Emergency Contacts
    </h2>

    <div className="grid gap-4 max-w-2xl">

      <input
        type="text"
        placeholder="Driver Name"
        className="bg-black/30 p-3 rounded-xl border border-white/10"
      />

      <input
        type="text"
        placeholder="Your Mobile Number"
        className="bg-black/30 p-3 rounded-xl border border-white/10"
      />

      <button className="bg-red-500 hover:bg-red-600 p-3 rounded-xl font-bold">
        Save Emergency Contacts
      </button>
    </div>

    <div className="mt-8 bg-black/20 p-5 rounded-2xl">
      <h3 className="text-xl font-bold mb-4">
        Emergency Services
      </h3>

      <div className="space-y-3">
        <p>🚔 Police : 112</p>
        <p>🚑 Ambulance : 108</p>
        <p>🔥 Fire Brigade : 101</p>
      </div>
    </div>
  </div>
)}
      </main>
    </div>
  );
}

export default Dashboard;