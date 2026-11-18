import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import heroImage from "../../assets/tower.jpg"; 

export default function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="w-full h-full overflow-hidden">
      {/* ================= HERO IMAGE + WELCOME ================= */}
      <div
        className="relative w-full h-full flex items-center justify-center"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50"></div>

        {/* Content */}
        <div className="relative z-50 flex flex-col items-center text-center px-6">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4">
            Welcome, {user?.name || "Traveler"}!
          </h1>
          <p className="text-xl md:text-2xl italic text-gray-200 mb-6 max-w-3xl">
            "Travel far, travel wide, and collect memories that last a lifetime."
          </p>
          <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-3xl">
            Ready to explore and plan your next adventure?
          </p>

          {/* Explore Trips Button */}
          <button
            onClick={() => navigate("/app/trips")}
            className="bg-blue-600 text-white font-bold text-lg md:text-xl px-10 py-5 rounded-full shadow-lg hover:bg-blue-700 hover:scale-105 transform transition"
          >
            Explore Trips
          </button>
        </div>
        
      </div>
      
    </div>
  );
}
