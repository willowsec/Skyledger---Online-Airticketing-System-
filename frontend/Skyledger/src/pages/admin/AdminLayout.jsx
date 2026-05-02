import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const NAV = [
  { to: "/admin", label: "📊 Dashboard", end: true },
  { to: "/admin/flights", label: "✈ Flights" },
  { to: "/admin/bookings", label: "🎫 Bookings" },
  { to: "/admin/users", label: "👥 Users" },
  { to: "/admin/reports", label: "📈 Reports" },
];

const sidebarStyle = {
  width: 210,
  background: "#0C447C",
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
  flexShrink: 0,
};

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside style={sidebarStyle}>
        <div
          style={{
            padding: "20px 16px 14px",
            borderBottom: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <div style={{ color: "#fff", fontWeight: 600, fontSize: 16 }}>
            ✈ OATS Admin
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: 11,
              marginTop: 3,
            }}
          >
            {user?.name}
          </div>
        </div>

        <nav style={{ flex: 1, padding: "8px 0" }}>
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                padding: "11px 16px",
                color: isActive ? "#fff" : "rgba(255,255,255,0.65)",
                background: isActive ? "rgba(255,255,255,0.12)" : "transparent",
                borderLeft: isActive
                  ? "3px solid #60C4F8"
                  : "3px solid transparent",
                textDecoration: "none",
                fontSize: 13,
                transition: "all 0.15s",
              })}
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          style={{
            margin: 12,
            padding: "8px 0",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 7,
            color: "rgba(255,255,255,0.7)",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </aside>

      <main style={{ flex: 1, padding: 28, overflow: "auto" }}>
        <Outlet />
      </main>
    </div>
  );
}
