import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedAdminRoute from "./routes/ProtectedAdminRoute";

/* Public */
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";

/* Admin */
import AdminDashboard from "./pages/admin/AdminDashboard";
import Destinations from "./pages/admin/Destinations";
import Trips from "./pages/admin/Trips";
import TripEdit from "./pages/admin/TripEdit";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminItinerary from "./pages/admin/AdminItinerary";

/* User */
import UserLayout from "./layouts/UserLayout";
import UserTrips from "./pages/user/UserTrips";
import TripDetails from "./pages/user/TripDetails";
import UserItinerary from "./pages/user/UserItinerary";
import UserBookings from "./pages/user/UserBookings";
import PaymentPage from "./pages/user/PaymentPage";
import Profile from "./pages/user/Profile";
import UserPayments from "./pages/user/UserPayments"; 
import UserDashboard from "./pages/user/UserDashboard"; 

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <BrowserRouter>
      <Routes>
        {/* ================= PUBLIC ================= */}
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />

        {/* ================= ADMIN (PROTECTED) ================= */}
        <Route element={<ProtectedAdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/destinations" element={<Destinations />} />
          <Route path="/admin/trips" element={<Trips />} />
          <Route path="/admin/trips/:tripId/edit" element={<TripEdit />} />
          <Route path="/admin/bookings" element={<AdminBookings />} />
          <Route path="/admin/payments" element={<AdminPayments />} />
          <Route
            path="/admin/trips/:tripId/itinerary"
            element={<AdminItinerary />}
          />
        </Route>

        {/* ================= USER DASHBOARD ================= */}
        <Route
          path="/app"
          element={user ? <UserLayout /> : <Navigate to="/auth" replace />}
        >
          {/* Default: dashboard/welcome page */}
          <Route index element={<UserDashboard />} />

          {/* User Pages */}
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="trips" element={<UserTrips />} />
          <Route path="trips/:id" element={<TripDetails />} />
          <Route path="trips/:id/itinerary" element={<UserItinerary />} />
          <Route path="my-bookings" element={<UserBookings />} />
          <Route path="payment/:bookingId" element={<PaymentPage />} />
          <Route path="payments" element={<UserPayments />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
