import { useRef, useState } from "react";
import { useEffect } from "react";
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

    const [deviceData, setDeviceData] = useState(null);

   const navigate = useNavigate();

   useEffect(() => {
   const token = localStorage.getItem("token");

   if (!token) {
    navigate("/");
   }
  }, [navigate]);

   useEffect(() => {
  fetchDeviceData();
}, []);

   const fetchDeviceData = async () => {
   try {
   const res = await axios.get("http://localhost:5000/api/data/device-data");

    if (res.data.length > 0) {
      setDeviceData(res.data[0]);
    }
  } catch (error) {
    console.log(error);
  }
};

useEffect(() => {
  const socket = io("http://localhost:5000");

  socket.on("connect", () => {
    console.log("Connected to backend socket");
  });

  socket.on("deviceData", (newData) => {
    console.log("New device data received:", newData);
    setDeviceData(newData);
  });

  return () => {
    socket.disconnect();
  };
}, []);

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    }

  const videoRef = useRef(null);

  const [cameraStatus, setCameraStatus] = useState("Not Connected");
  const [locationStatus, setLocationStatus] = useState("Not Connected");
  const [bluetoothStatus, setBluetoothStatus] = useState("Not Connected");

  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    accuracy: null,
  });

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setCameraStatus("Camera Connected");
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
      optionalServices: ["battery_service"],
    });

    setBluetoothStatus(`Connected: ${device.name || "Unknown Device"}`);

    const dataToSend = {
      deviceId: device.id || "PI-001",
      driverStatus: "Awake",
      drowsinessRisk: "Low",
      bluetoothStatus: "Connected",
      cameraStatus,
      latitude: location.latitude,
      longitude: location.longitude,
    };

    await axios.post("http://localhost:5000/api/data/device-data", dataToSend);

    alert("Bluetooth device data sent to server");
  } catch (error) {
    setBluetoothStatus("Bluetooth Connection Cancelled");
    console.log(error);
  }
};

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
          <div className="bg-cyan-500/20 text-cyan-300 px-4 py-3 rounded-xl">
            Dashboard
          </div>
          <div className="px-4 py-3 rounded-xl hover:bg-white/10 cursor-pointer">
            Camera
          </div>
          <div className="px-4 py-3 rounded-xl hover:bg-white/10 cursor-pointer">
            Location
          </div>
          <div className="px-4 py-3 rounded-xl hover:bg-white/10 cursor-pointer">
            Bluetooth
          </div>
          <div className="px-4 py-3 rounded-xl hover:bg-white/10 cursor-pointer">
            Alert Logs
          </div>
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-green-500/10 border border-green-500/20 rounded-3xl p-6">
            <Activity className="text-green-400 mb-4" size={32} />
            <p className="text-gray-400">Driver Status</p>
            <h2 className="text-3xl font-bold text-green-400">{deviceData?.driverStatus || "No Data"}</h2>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-3xl p-6">
            <AlertTriangle className="text-yellow-400 mb-4" size={32} />
            <p className="text-gray-400">Drowsiness Risk</p>
            <h2 className="text-3xl font-bold text-yellow-400">{deviceData?.drowsinessRisk || "No Data"}</h2>
          </div>

          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-3xl p-6">
            <Car className="text-cyan-400 mb-4" size={32} />
            <p className="text-gray-400">Device Status</p>
            <h2 className="text-3xl font-bold text-cyan-400">{deviceData?.bluetoothStatus || "Offline"}</h2>
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

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/10 border border-white/10 rounded-3xl p-6">
            <h2 className="text-2xl font-bold mb-4">Live Camera Preview</h2>

            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-2xl border border-white/10 bg-black"
            />
          </div>

          <div className="bg-white/10 border border-white/10 rounded-3xl p-6">
            <h2 className="text-2xl font-bold mb-4">GPS Location Data</h2>

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
        </div>
      </main>
    </div>
  );
}

export default Dashboard;