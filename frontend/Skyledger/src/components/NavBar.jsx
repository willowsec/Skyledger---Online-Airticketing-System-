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
    <nav className="bg-primary border-b border-white/10 px-6 h-16 flex items-center justify-between sticky top-0 z-50 shadow-sm backdrop-blur-md bg-primary/95">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 no-underline group">
        <span className="text-2xl transition-transform group-hover:-translate-y-0.5 group-hover:scale-110">✈️</span>
        <span className="text-white font-bold text-lg tracking-tight">SkyLedger</span>
      </Link>

      {/* Nav links */}
      <div className="flex items-center gap-2 sm:gap-4">
        {user ? (
          <>
            {user.role === "admin" ? (
              <Link to="/admin" className="text-white/80 text-sm no-underline px-3 py-2 rounded-md hover:text-white hover:bg-white/10 transition-all">
                Admin Panel
              </Link>
            ) : (
              <Link to="/dashboard" className="text-white/80 text-sm no-underline px-3 py-2 rounded-md hover:text-white hover:bg-white/10 transition-all">
                My Bookings
              </Link>
            )}
            <div className="w-[1px] h-5 bg-white/20 mx-1 hidden sm:block" />
            <div className="text-white/70 text-sm hidden sm:block font-medium">
              Hi, {user.name?.split(" ")[0] || "User"}
            </div>
            <button 
              onClick={handleLogout} 
              className="px-4 py-2 bg-white/10 text-white border border-white/20 rounded-lg text-sm font-medium hover:bg-white/20 transition-all ml-1 sm:ml-2"
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-white/80 text-sm no-underline px-3 py-2 rounded-md hover:text-white hover:bg-white/10 transition-all">
              Sign in
            </Link>
            <Link
              to="/register"
              className="px-5 py-2 bg-accent text-white border-none rounded-lg text-sm font-semibold hover:bg-blue-500 shadow-md hover:shadow-lg transition-all no-underline inline-block"
            >
              Get started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
