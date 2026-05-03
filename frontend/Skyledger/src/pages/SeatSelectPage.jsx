import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import SeatMap from "../components/SeatMap";

export default function SeatSelectPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { flight, cabinClass, passengers } = state || {};
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!flight) return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <p className="text-body-base text-text-secondary bg-surface p-8 rounded-xl shadow-sm border border-slate-100">
        Flight not found. Go back and search again.
      </p>
    </div>
  );

  const pricePerSeat = flight.price;
  const base = selectedSeats.length * pricePerSeat;
  const tax = Math.round(base * 0.18);

  const handleContinue = async () => {
    if (selectedSeats.length !== Number(passengers)) return;
    setLoading(true);
    setError("");
    try {
      await api.post("/bookings/hold", {
        flightId: flight._id,
        seatIds: selectedSeats.map((s) => s._id),
        cabinClass,
      });
      navigate("/booking/confirm", {
        state: {
          flight,
          cabinClass,
          passengers,
          selectedSeats,
          totalAmount: base + tax,
        },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to hold seats. Try another seat.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 font-sans items-start">
      {/* Left: seat map */}
      <div>
        <div className="mb-6">
          <h2 className="text-h2-section text-text-primary mb-1">
            Select your seat{passengers > 1 ? "s" : ""}
          </h2>
          <p className="text-body-base text-text-secondary">
            {flight.flightNumber} · {flight.origin} &rarr; {flight.destination} · <span className="capitalize">{cabinClass}</span>
          </p>
        </div>
        <div className="bg-surface rounded-xl p-6 shadow-sm border border-slate-200">
          <SeatMap
            flightId={flight._id}
            cabinClass={cabinClass}
            maxSelect={Number(passengers)}
            pricePerSeat={pricePerSeat}
            onSeatChange={setSelectedSeats}
          />
        </div>
      </div>

      {/* Right: summary sticky */}
      <div className="sticky top-24 bg-surface rounded-xl p-6 shadow-soft border border-slate-200">
        <h3 className="text-h3-card text-text-primary mb-4 pb-4 border-b border-slate-100">
          Booking summary
        </h3>
        
        <div className="mb-6">
          <div className="font-semibold text-text-primary text-body-base mb-0.5">
            {flight.airline?.name} <span className="font-normal text-text-secondary">{flight.flightNumber}</span>
          </div>
          <div className="text-body-sm text-text-secondary">
            {new Date(flight.departureTime).toLocaleDateString("en-IN", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3 mb-6">
          {[
            [
              "Selected seats",
              selectedSeats.map((s) => s.seatNumber).join(", ") || "—",
            ],
            [
              "Base fare",
              selectedSeats.length ? `₹${base.toLocaleString("en-IN")}` : "—",
            ],
            [
              "Taxes & Fees",
              selectedSeats.length ? `₹${tax.toLocaleString("en-IN")}` : "—",
            ],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between items-center text-body-sm">
              <span className="text-text-secondary font-medium">{k}</span>
              <span className="font-semibold text-text-primary">{v}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center text-[20px] font-bold text-text-primary border-t border-slate-100 pt-4 mb-2">
          <span>Total</span>
          <span>
            {selectedSeats.length
              ? `₹${(base + tax).toLocaleString("en-IN")}`
              : "—"}
          </span>
        </div>

        {error && (
          <div className="bg-error/10 border border-error/20 text-error p-3 rounded-lg text-sm mb-4 font-medium mt-4">
            {error}
          </div>
        )}

        <button
          disabled={selectedSeats.length !== Number(passengers) || loading}
          onClick={handleContinue}
          className="w-full mt-6 bg-primary hover:bg-accent text-surface py-3.5 rounded-xl font-semibold transition-all shadow-soft hover:shadow-hover disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {loading ? "Holding seats..." : "Continue to details \u2192"}
        </button>

        {selectedSeats.length < Number(passengers) && (
          <p className="text-sm text-text-secondary text-center mt-4 font-medium">
            Select {Number(passengers) - selectedSeats.length} more seat{Number(passengers) - selectedSeats.length > 1 ? "s" : ""}
          </p>
        )}
      </div>
    </div>
  );
}
