import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { UserContext } from "../context/UserContext";

const ProtectedRoute = ({ children, requiredRoles = [], requireAuth = true }) => {
  const { user, loading, getUserRole } = useContext(UserContext);
  const location = useLocation();
  const userRole = getUserRole();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-700" />
      </div>
    );
  }

  // Redirect to login if authentication is required and user is not logged in
  if (requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRoles.length > 0) {
    const userRoleStr = String(userRole || "").toLowerCase();
    const hasRequiredRole = requiredRoles.some(
      (role) => String(role).toLowerCase() === userRoleStr
    );
    if (!hasRequiredRole) {
      return <Navigate to="/404" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
