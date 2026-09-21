import { Navigate, Outlet, useLocation } from "react-router-dom";
import rolePermissions from "../config/rolePermissions";

function RoleProtectedRoute() {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const allowedRoutes = rolePermissions[user?.role] || [];

  if (!allowedRoutes.includes(location.pathname)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default RoleProtectedRoute;