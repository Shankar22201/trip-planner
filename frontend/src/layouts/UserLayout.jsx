
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import "./UserLayout.css";

export default function UserLayout({ title }) {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600 text-sm">Loading dashboard...</p>
      </div>
    );
  }

  if (!user) {
    navigate("/auth", { replace: true });
    return null;
  }

  const handleLogout = () => {
    setMobileOpen(false);
    logout();
    navigate("/auth", { replace: true });
  };

  const navLinks = [
    { name: "Dashboard", path: "/app" },
    { name: "Trips", path: "/app/trips" },
    { name: "My Bookings", path: "/app/my-bookings" },
    { name: "My Payments", path: "/app/payments" },
    { name: "My Profile", path: "/app/profile" },
  ];

  const linkClasses = (path) =>
    `block px-4 py-3 rounded transition ${
      location.pathname === path
        ? "bg-gray-800 text-blue-400 font-medium"
        : "hover:bg-gray-700 hover:text-blue-400"
    }`;

  const profileImage = user.image
    ? user.image
    : "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff";

  return (
    <div className="user-layout min-h-screen flex bg-gray-100">

      {/* DESKTOP SIDEBAR */}
      <aside className="user-desktop-sidebar w-64 flex-col bg-gray-900 text-white sticky top-0 h-screen">
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

      {/* MOBILE AND TABLET TOP NAVIGATION */}
      <div className="user-layout-content flex-1 flex flex-col min-w-0">

        <header className="user-mobile-header bg-gray-900 text-white">
          <div className="user-mobile-topbar flex items-center justify-between p-4">
            <h2 className="font-bold text-lg">Trip Planner</h2>

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="user-menu-toggle"
              aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? "✕" : "☰"}
            </button>
          </div>

          {mobileOpen && (
            <div className="user-mobile-menu">
              <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-700">
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

              <nav className="user-mobile-nav">
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

              <div className="p-4 border-t border-gray-700">
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-600 hover:bg-red-700 transition px-4 py-3 rounded"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </header>

        {/* MAIN PAGE CONTENT */}
        <main className="p-6 flex-1 min-w-0">
          {title && (
            <h2 className="text-2xl font-bold mb-6">{title}</h2>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
