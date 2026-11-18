import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export default function AdminLayout({ title, children }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/auth", { replace: true });
  };

  const navLinks = [
    { name: "Dashboard", path: "/admin" },
    { name: "Destinations", path: "/admin/destinations" },
    // { name: "Trips", path: "/admin/trips" },
    { name: "Bookings", path: "/admin/bookings" },
    { name: "Payments", path: "/admin/payments" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden md:flex w-64 bg-gray-900 text-white flex-col sticky top-0 h-screen">
        <div className="p-6 flex-1">
          <h1 className="text-2xl font-bold text-center mb-8 border-b border-gray-700 pb-3">
            Trip-Planner
          </h1>

          <nav className="space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-4 py-2 rounded transition ${
                  location.pathname === link.path
                    ? "bg-gray-800 text-blue-400"
                    : "hover:bg-gray-700 hover:text-blue-400"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-6">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 transition px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* ================= MOBILE SIDEBAR ================= */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-64 bg-gray-900 text-white h-full flex flex-col">
            <div className="p-6 flex-1">
              <h1 className="text-2xl font-bold text-center mb-8 border-b border-gray-700 pb-3">
                Trip-Planner
              </h1>

              <nav className="space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-4 py-2 rounded transition ${
                      location.pathname === link.path
                        ? "bg-gray-800 text-blue-400"
                        : "hover:bg-gray-700 hover:text-blue-400"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="p-6">
              <button
                onClick={handleLogout}
                className="w-full bg-red-600 hover:bg-red-700 transition px-4 py-2 rounded"
              >
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Top Bar */}
        <div className="md:hidden bg-gray-900 text-white flex items-center justify-between p-4">
          <h2 className="font-bold text-lg">Trip-Planner</h2>
          <button onClick={() => setMobileOpen(true)} className="text-xl">
            ☰
          </button>
        </div>

        <main className="p-6 flex-1 overflow-auto">
          {title && <h2 className="text-2xl font-bold mb-6">{title}</h2>}
          {children}
        </main>
      </div>
    </div>
  );
}



