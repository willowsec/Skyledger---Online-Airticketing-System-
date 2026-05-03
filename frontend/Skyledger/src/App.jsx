// src/App.jsx — complete final version
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import {
  GuestRoute,
  PrivateRoute,
  AdminRoute,
} from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

// Pages
import SearchPage from "./pages/SearchPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SeatSelectPage from "./pages/SeatSelectPage";
import BookingConfirmPage from "./pages/BookingConfirmPage";
import BookingSuccessPage from "./pages/BookingSuccessPage";
import DashboardPage from "./pages/DashboardPage";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminFlights from "./pages/admin/AdminFlights";
import AdminBookings from "./pages/admin/AdminBookings";
import OAuthCallback from "./pages/OAuthCallback";
import VerifyTicketPage from "./pages/VerifyTicketPage";
// Pages that should show the Navbar
function WithNav({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1a2744",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.1)",
            },
          }}
        />
        <Routes>
          {/* Public pages — with Navbar */}
          <Route
            path="/"
            element={
              <WithNav>
                <SearchPage />
              </WithNav>
            }
          />

          {/* Auth pages — NO Navbar (full screen) */}
          <Route
            path="/login"
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <RegisterPage />
              </GuestRoute>
            }
          />

          {/* Passenger protected — with Navbar */}
          <Route
            path="/flights/:id/seats"
            element={
              <PrivateRoute>
                <WithNav>
                  <SeatSelectPage />
                </WithNav>
              </PrivateRoute>
            }
          />
          <Route path="/auth/callback" element={<OAuthCallback />} />
          <Route
            path="/booking/confirm"
            element={
              <PrivateRoute>
                <WithNav>
                  <BookingConfirmPage />
                </WithNav>
              </PrivateRoute>
            }
          />
          <Route
            path="/booking/success"
            element={
              <PrivateRoute>
                <WithNav>
                  <BookingSuccessPage />
                </WithNav>
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <WithNav>
                  <DashboardPage />
                </WithNav>
              </PrivateRoute>
            }
          />

          {/* Admin — NO Navbar (has its own sidebar) */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="flights" element={<AdminFlights />} />
            <Route path="bookings" element={<AdminBookings />} />
          </Route>

          {/* Public Ticket Verification (no navbar) */}
          <Route path="/verify-ticket/:id" element={<VerifyTicketPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
