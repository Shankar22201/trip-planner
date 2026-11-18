import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export default function UserLayout({ title, children }) {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Show loading while auth state initializes
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600 text-sm">Loading dashboard...</p>
      </div>
    );
  }

  // Force logout if user missing
  if (!user) {
    navigate("/auth", { replace: true });
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/auth", { replace: true });
  };

  // User navigation links
  const navLinks = [
    { name: "Dashboard", path: "/app" },
    { name: "Trips", path: "/app/trips" },
    { name: "My Bookings", path: "/app/my-bookings" },
    { name: "My Payments", path: "/app/payments" },
    { name: "My Profile", path: "/app/profile" },
  ];

  const linkClasses = (path) =>
    `block px-4 py-2 rounded transition ${
      location.pathname === path
        ? "bg-gray-800 text-blue-400 font-medium"
        : "hover:bg-gray-700 hover:text-blue-400"
    }`;

  const profileImage = user.image
    ? `http://localhost:5000/${user.image}`
    : "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff";

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden md:flex w-64 flex-col bg-gray-900 text-white sticky top-0 h-screen">
        <div className="p-6 flex-1">
          <h1 className="text-2xl font-bold text-center mb-8 border-b border-gray-700 pb-3">
            Trip Planner
          </h1>

          {/* Profile */}
          <div className="flex items-center gap-3 mb-6">
            <img
              src={profileImage}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="text-sm min-w-0">
              <p className="font-medium truncate">{user.name}</p>
              <p className="text-gray-400 text-xs truncate">{user.email}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} className={linkClasses(link.path)}>
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Logout */}
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
                Trip Planner
              </h1>

              <div className="flex items-center gap-3 mb-6">
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="text-sm min-w-0">
                  <p className="font-medium truncate">{user.name}</p>
                  <p className="text-gray-400 text-xs truncate">{user.email}</p>
                </div>
              </div>

              <nav className="space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    className={linkClasses(link.path)}
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
          <h2 className="font-bold text-lg">Trip Planner</h2>
          <button onClick={() => setMobileOpen(true)} className="text-xl">
            ☰
          </button>
        </div>

        <main className="p-6 flex-1 overflow-auto">
          {title && <h2 className="text-2xl font-bold mb-6">{title}</h2>}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
