// src/context/AuthContext.jsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api, { setToken } from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while checking existing session

  // On app load — try to refresh session from cookie
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { data } = await api.get("/auth/refresh");
        setToken(data.accessToken);
        // Decode user from token payload
        const payload = JSON.parse(atob(data.accessToken.split(".")[1]));
        setUser({ id: payload.id, role: payload.role });
      } catch {
        // No valid session — user stays null
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = useCallback((accessToken, userData) => {
    setToken(accessToken);
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
