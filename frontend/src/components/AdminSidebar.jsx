import { Link } from "react-router-dom";

export default function AdminSidebar() {
  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen p-4">
      <h2 className="text-xl font-bold mb-6">Admin Panel</h2>

      <nav className="space-y-5">
        <Link to="/admin" className="block hover:text-blue-400">
          Dashboard
        </Link>
        <Link to="/admin/destinations" className="block hover:text-blue-400">
          Destinations
        </Link>
        {/* <Link to="/admin/trips" className="block hover:text-blue-400">
          Trips
        </Link> */}
        <Link to="/admin/bookings" className="block hover:text-blue-400">
          Bookings
        </Link>
      </nav>
    </div>
  );
}
