import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedAdminRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-6">Checking access...</div>;
  }

  //  Not logged in OR not admin
  if (!user || user.role !== "admin") {
    return <Navigate to="/auth" replace />;
  }

  //  Admin allowed
  return <Outlet />;
}
