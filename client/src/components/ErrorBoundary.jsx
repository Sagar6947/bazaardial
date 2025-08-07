// components/UserOnlyRoute.jsx  (or inline in App)
import { useContext } from "react";
import { Navigate }   from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function UserOnlyRoute({ children }) {
  const { token, businessId, ready } = useContext(AuthContext);

  if (!ready) return null;                    // wait for AuthContext to hydrate
  if (!token) return <Navigate to="/signin" replace />;      // guest
  if (businessId) return <Navigate to="/dashboard" replace />; // already owner

  return children;                           // user with NO business → allowed
}
