// src/components/UserOnlyRoute.jsx
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

/**
 * Restricts access to users who:
 * - are logged in
 * - have NOT created a business (i.e., not owners)
 */
export default function UserOnlyRoute({ children }) {
  const { token, businessId } = useContext(AuthContext);

  // Not logged in → redirect to sign-in
  if (!token) return <Navigate to="/signin" replace />;

  // Already listed a business → redirect to dashboard
  if (businessId) return <Navigate to="/dashboard" replace />;

  // Plain user → allow access
  return children;
}
