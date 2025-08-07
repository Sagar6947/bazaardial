import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  /* ------------------------------------------------------------ */
  /* shape: { token, role: "guest"|"user"|"owner", businessId }   */
  /* ------------------------------------------------------------ */
  const [auth, setAuth] = useState({
    token: null,
    role: "guest",
    businessId: null,
  });

  const [ready, setReady] = useState(false);

  /* ---------- helper: decode token & update state ------------ */
  const decodeAndSetAuth = (token) => {
    try {
      const { role, businessId } = jwtDecode(token);
      setAuth({ token, role, businessId: businessId ?? null });
      return true;
    } catch (err) {
      /* corrupted / expired token — purge storage & reset state */
      localStorage.removeItem("token");
      setAuth({ token: null, role: "guest", businessId: null });
      return false;
    }
  };

  /* ---------- run once on mount: load token from storage ------ */
  useEffect(() => {
    const stored = localStorage.getItem("token");
    if (stored) decodeAndSetAuth(stored);
    else setAuth({ token: null, role: "guest", businessId: null });
    setReady(true);
  }, []);

  /* ---------- public helpers ---------------------------------- */
  const login = (token) => {
    if (!token) return; // guard: ignore empty / undefined
    localStorage.setItem("token", token);
    decodeAndSetAuth(token);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setAuth({ token: null, role: "guest", businessId: null });
  };

  const updateBusinessId = (businessId) =>
    setAuth((p) => ({ ...p, businessId }));

  const refreshAuth = () => {
    const token = localStorage.getItem("token");
    if (token) decodeAndSetAuth(token);
    else logout();
  };

  /* ---------- provider ---------------------------------------- */
  return (
    <AuthContext.Provider
      value={{
        ...auth,
        ready,
        login,
        logout,
        updateBusinessId,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
