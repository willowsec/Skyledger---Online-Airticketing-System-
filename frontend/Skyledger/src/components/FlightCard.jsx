const fmt = (d) =>
  new Date(d).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
const fmtDur = (mins) => `${Math.floor(mins / 60)}h ${mins % 60}m`;

export default function FlightCard({ flight, cabinClass, onSelect }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr auto auto",
        alignItems: "center",
        gap: 16,
        padding: "18px 20px",
        background: "var(--color-background-secondary)",
        borderRadius: 12,
        border: "1px solid var(--color-border-tertiary)",
      }}
    >
      {/* Airline */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {flight.airline?.logo && (
          <img
            src={flight.airline.logo}
            alt={flight.airline.name}
            style={{ height: 28, objectFit: "contain" }}
          />
        )}
        <div>
          <div style={{ fontWeight: 500, fontSize: 14 }}>
            {flight.airline?.name}
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
            {flight.flightNumber}
          </div>
        </div>
      </div>

      {/* Departure */}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 22, fontWeight: 500 }}>
          {fmt(flight.departureTime)}
        </div>
        <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
          {flight.origin}
        </div>
      </div>

      {/* Duration + stops */}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
          {fmtDur(flight.duration)}
        </div>
        <div
          style={{
            borderTop: "1px solid var(--color-border-secondary)",
            margin: "4px 0",
          }}
        />
        <div
          style={{
            fontSize: 12,
            color: flight.stops === 0 ? "#0F6E56" : "#854F0B",
          }}
        >
          {flight.stops === 0 ? "Non-stop" : `${flight.stops} stop`}
        </div>
      </div>

      {/* Arrival */}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 22, fontWeight: 500 }}>
          {fmt(flight.arrivalTime)}
        </div>
        <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
          {flight.destination}
        </div>
      </div>

      {/* Price + select */}
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 20, fontWeight: 500 }}>
          ₹{flight.price?.toLocaleString("en-IN")}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "var(--color-text-secondary)",
            marginBottom: 8,
          }}
        >
          {cabinClass} · {flight.availableSeats} seats left
        </div>
        <button
          onClick={onSelect}
          style={{
            padding: "8px 18px",
            background: "#185FA5",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          Select
        </button>
      </div>
    </div>
  );
}
