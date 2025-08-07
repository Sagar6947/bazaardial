// src/components/ProtectedRoute.jsx
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

/**
 * Usage:
 * <ProtectedRoute roles={["owner"]}>   // only for owners
 * <ProtectedRoute roles={["user"]}>    // only for basic users
 * <ProtectedRoute>                     // any logged-in user
 */
export default function ProtectedRoute({ roles = [], children }) {
  const { token, role, ready } = useContext(AuthContext);

  // Wait until AuthContext finishes hydrating
  if (!ready) return null; // or return <LoadingSpinner />

  // Not logged in → redirect to sign-in
  if (!token) return <Navigate to="/signin" replace />;

  // Logged in but role mismatch → redirect to home
  if (roles.length > 0 && !roles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  // Authorized → render child route
  return children;
}
