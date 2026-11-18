
import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import api from "../utils/axios";
import { useAuth } from "../context/AuthContext";
import authImage from "../assets/beach.jfif"; 

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    mobile: "",
  });

  const { login, user } = useAuth();
  const navigate = useNavigate();

  //  AUTO REDIRECT IF LOGGED IN
  if (user) {
    return user.role === "admin"
      ? <Navigate to="/admin" replace />
      : <Navigate to="/app" replace />;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isLogin) {
        /* ================= LOGIN ================= */
        const res = await api.post("/login", {
          email: form.email,
          password: form.password,
        });

        const fullUser = await login(res.data.token);

        navigate(
          fullUser.role === "admin" ? "/admin" : "/app",
          { replace: true }
        );
      } else {
        /* ================= REGISTER ================= */
        if (form.mobile.length !== 10) {
          return setError("Mobile number must be exactly 10 digits");
        }

        const res = await api.post("/register", form);

        const fullUser = await login(res.data.token);

        navigate(
          fullUser.role === "admin" ? "/admin" : "/app",
          { replace: true }
        );
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center relative"
      style={{ backgroundImage: `url(${authImage})` }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Glass card */}
      <div className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-8 text-white">
        <h2 className="text-3xl font-bold text-center mb-2">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>

        <p className="text-center text-gray-300 mb-6">
          {isLogin
            ? "Login to continue your journey"
            : "Start planning your trips with us"}
        </p>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <input
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-white/20 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white"
                required
              />

              <input
                name="mobile"
                placeholder="Mobile Number"
                value={form.mobile}
                onChange={handleChange}
                maxLength={10}
                className="w-full px-4 py-3 rounded-lg bg-white/20 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white"
                required
              />
            </>
          )}

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-white/20 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white"
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-white/20 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white"
            required
          />

          <button
            type="submit"
            className={`w-full py-3 rounded-lg text-gray-900 font-semibold ${
              isLogin ? "bg-white hover:bg-gray-100" : "bg-green-500 hover:bg-green-600"
            } transition`}
          >
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-300 mt-6">
          {isLogin ? "Don’t have an account?" : "Already have an account?"}{" "}
          <button
            className="text-white font-semibold hover:underline"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Register" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}
