import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { UserPlus, Car } from "lucide-react";

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/signup", {
        name,
        email,
        password,
      });

      alert(res.data.message);
      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || "Signup failed");
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
            <p className="text-gray-400">Create your safety account</p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-6">Signup</h2>

        <input
          className="w-full mb-4 px-4 py-3 rounded-xl bg-black/30 border border-white/10 outline-none"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

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
          onClick={handleSignup}
          className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold flex items-center justify-center gap-2"
        >
          <UserPlus size={18} /> Create Account
        </button>

        <p className="text-center text-gray-400 mt-6">
          Already registered?{" "}
          <Link to="/" className="text-cyan-400">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;