


import { useNavigate } from "react-router-dom";
import heroImage from "../assets/landing.jpg"; 
export default function Landing() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen bg-cover bg-center relative flex items-center justify-center"
      style={{
        backgroundImage: `url(${heroImage})`,
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-6">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-wide mb-6">
          Trip Planner
        </h1>

        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 text-gray-200">
          Plan smarter. Travel better.  
          Discover destinations, manage bookings, and create unforgettable journeys — all in one place.
        </p>

        <button
          onClick={() => navigate("/auth")}
          className="bg-white text-gray-900 font-semibold px-8 py-4 rounded-full shadow-lg hover:bg-gray-100 hover:scale-105 transition"
        >
          Get Started 🚀
        </button>
      </div>
    </div>
  );
}
