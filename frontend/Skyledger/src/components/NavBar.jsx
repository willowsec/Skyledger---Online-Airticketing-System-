// src/components/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav
      style={{
        background: "#0C1F3D",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "0 24px",
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Logo */}
      <Link
        to="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          textDecoration: "none",
        }}
      >
        <span style={{ fontSize: 20 }}>✈</span>
        <span style={{ color: "#fff", fontWeight: 600, fontSize: 16 }}>
          OATS
        </span>
        <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>
          Air
        </span>
      </Link>

      {/* Nav links */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {user ? (
          <>
            {user.role === "admin" ? (
              <Link to="/admin" style={linkStyle}>
                Admin Panel
              </Link>
            ) : (
              <Link to="/dashboard" style={linkStyle}>
                My Bookings
              </Link>
            )}
            <div
              style={{
                width: 1,
                height: 20,
                background: "rgba(255,255,255,0.1)",
                margin: "0 4px",
              }}
            />
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
              Hi, {user.name?.split(" ")[0] || "User"}
            </div>
            <button onClick={handleLogout} style={btnStyle}>
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={linkStyle}>
              Sign in
            </Link>
            <Link
              to="/register"
              style={{
                ...btnStyle,
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Get started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

const linkStyle = {
  color: "rgba(255,255,255,0.6)",
  fontSize: 14,
  textDecoration: "none",
  padding: "6px 12px",
  borderRadius: 6,
  transition: "color 0.15s",
};
const btnStyle = {
  padding: "7px 16px",
  background: "#185FA5",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 500,
  cursor: "pointer",
  fontFamily: "'DM Sans', sans-serif",
};
