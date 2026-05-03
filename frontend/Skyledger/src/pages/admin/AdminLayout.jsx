import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const NAV = [
  { to: "/admin", label: "📊 Dashboard", end: true },
  { to: "/admin/flights", label: "✈️ Flights" },
  { to: "/admin/bookings", label: "🎫 Bookings" },
  { to: "/admin/users", label: "👥 Users" },
  { to: "/admin/reports", label: "📈 Reports" },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-bg font-sans">
      <aside className="w-64 bg-[#0F172A] flex flex-col min-h-screen shrink-0 text-surface">
        <div className="p-6 border-b border-white/10">
          <Link to="/" className="flex items-center gap-2 no-underline group mb-1">
            <span className="text-xl transition-transform group-hover:-translate-y-0.5 group-hover:scale-110">✈️</span>
            <span className="text-white font-bold tracking-tight">SkyLedger Admin</span>
          </Link>
          <div className="text-white/50 text-xs font-medium uppercase tracking-wider mt-2">
            Logged in as {user?.name?.split(" ")[0] || "Admin"}
          </div>
        </div>

        <nav className="flex-1 py-4">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex items-center px-6 py-3 text-sm transition-all border-l-4 ${
                  isActive
                    ? "text-white bg-white/10 border-accent font-medium"
                    : "text-white/60 border-transparent hover:text-white hover:bg-white/5"
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4">
          <button
            onClick={handleLogout}
            className="w-full py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 rounded-lg text-white/80 hover:text-white text-sm font-medium transition-all shadow-sm"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
