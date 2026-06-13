import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Car, ShieldCheck } from "lucide-react";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      alert(res.data.message);
      navigate("/dashboard");
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white/10 border border-white/10 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
          <Car className="text-cyan-400" size={36} />
          <div>
            <h1 className="text-3xl font-bold">DriveGuard AI</h1>
            <p className="text-gray-400">Smart Driver Safety System</p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-6">Login</h2>

        <input
          className="w-full mb-4 px-4 py-3 rounded-xl bg-black/30 border border-white/10 outline-none"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full mb-6 px-4 py-3 rounded-xl bg-black/30 border border-white/10 outline-none"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold"
        >
          Login
        </button>

        <p className="text-center text-gray-400 mt-6">
          New user?{" "}
          <Link to="/signup" className="text-cyan-400">
            Create account
          </Link>
        </p>

        <div className="flex items-center justify-center gap-2 mt-6 text-sm text-gray-500">
          <ShieldCheck size={16} />
          Secure access enabled
        </div>
      </div>
    </div>
  );
}

export default Login;