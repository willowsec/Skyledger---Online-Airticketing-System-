// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Spinner shown while checking session
const Spinner = () => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "#0A1628",
    }}
  >
    <div
      style={{
        width: 40,
        height: 40,
        border: "3px solid rgba(255,255,255,0.1)",
        borderTop: "3px solid #185FA5",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }}
    />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// For passenger-only pages (Dashboard, Booking, etc.)
export function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

// For admin-only pages
export function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

// Redirect already-logged-in users away from login/register
export function GuestRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;
  if (user)
    return <Navigate to={user.role === "admin" ? "/admin" : "/"} replace />;
  return children;
}
