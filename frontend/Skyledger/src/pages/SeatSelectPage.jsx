import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SeatMap from "../components/SeatMap";

export default function SeatSelectPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { flight, cabinClass, passengers } = state || {};
  const [selectedSeats, setSelectedSeats] = useState([]);

  if (!flight) return <p>Flight not found. Go back and search again.</p>;

  const pricePerSeat = flight.price;
  const base = selectedSeats.length * pricePerSeat;
  const tax = Math.round(base * 0.18);

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "24px 16px",
        display: "grid",
        gridTemplateColumns: "1fr 320px",
        gap: 32,
      }}
    >
      {/* Left: seat map */}
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 500, marginBottom: 4 }}>
          Select your seat{passengers > 1 ? "s" : ""}
        </h2>
        <p
          style={{
            fontSize: 13,
            color: "var(--color-text-secondary)",
            marginBottom: 20,
          }}
        >
          {flight.flightNumber} · {flight.origin} → {flight.destination} ·{" "}
          {cabinClass}
        </p>
        <SeatMap
          flightId={flight._id}
          cabinClass={cabinClass}
          maxSelect={Number(passengers)}
          pricePerSeat={pricePerSeat}
          onSeatChange={setSelectedSeats}
        />
      </div>

      {/* Right: summary sticky */}
      <div style={{ position: "sticky", top: 20, alignSelf: "start" }}>
        <div
          style={{
            background: "var(--color-background-secondary)",
            borderRadius: 12,
            padding: 20,
            border: "1px solid var(--color-border-tertiary)",
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 16 }}>
            Booking summary
          </h3>
          <div style={{ fontSize: 13, marginBottom: 8 }}>
            <strong>{flight.airline?.name}</strong> {flight.flightNumber}
          </div>
          <div
            style={{
              fontSize: 13,
              color: "var(--color-text-secondary)",
              marginBottom: 16,
            }}
          >
            {new Date(flight.departureTime).toLocaleDateString("en-IN", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
          </div>

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
              "Taxes (18%)",
              selectedSeats.length ? `₹${tax.toLocaleString("en-IN")}` : "—",
            ],
          ].map(([k, v]) => (
            <div
              key={k}
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 13,
                marginBottom: 8,
              }}
            >
              <span style={{ color: "var(--color-text-secondary)" }}>{k}</span>
              <span>{v}</span>
            </div>
          ))}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 16,
              fontWeight: 500,
              borderTop: "1px solid var(--color-border-tertiary)",
              paddingTop: 12,
              marginTop: 8,
            }}
          >
            <span>Total</span>
            <span>
              {selectedSeats.length
                ? `₹${(base + tax).toLocaleString("en-IN")}`
                : "—"}
            </span>
          </div>

          <button
            disabled={selectedSeats.length !== Number(passengers)}
            onClick={() =>
              navigate("/booking/confirm", {
                state: {
                  flight,
                  cabinClass,
                  passengers,
                  selectedSeats,
                  totalAmount: base + tax,
                },
              })
            }
            style={{
              width: "100%",
              padding: 12,
              marginTop: 16,
              background: "#185FA5",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 500,
              cursor: "pointer",
              opacity: selectedSeats.length !== Number(passengers) ? 0.4 : 1,
            }}
          >
            Continue to passenger details
          </button>
          {selectedSeats.length < Number(passengers) && (
            <p
              style={{
                fontSize: 12,
                color: "var(--color-text-secondary)",
                textAlign: "center",
                marginTop: 8,
              }}
            >
              Select {Number(passengers) - selectedSeats.length} more seat
              {Number(passengers) - selectedSeats.length > 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
