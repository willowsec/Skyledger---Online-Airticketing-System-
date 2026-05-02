import { useEffect, useState, useCallback } from "react";
import api from "../api/axios";

const CABIN_CONFIG = {
  first: { cols: ["A", "B", "C", "D"], aisleAfter: 1, label: "First Class" },
  business: {
    cols: ["A", "B", "C", "D", "E", "F"],
    aisleAfter: 2,
    label: "Business",
  },
  economy: {
    cols: ["A", "B", "C", "D", "E", "F"],
    aisleAfter: 2,
    label: "Economy",
  },
};

const SEAT_COLORS = {
  available: { bg: "#E1F5EE", border: "#5DCAA5", color: "#085041" },
  selected: { bg: "#185FA5", border: "#0C447C", color: "#fff" },
  booked: {
    bg: "var(--color-background-tertiary)",
    border: "var(--color-border-tertiary)",
    color: "var(--color-text-tertiary)",
  },
  held: { bg: "#FAEEDA", border: "#EF9F27", color: "#633806" },
};

export default function SeatMap({
  flightId,
  maxSelect = 1,
  cabinClass = "economy",
  pricePerSeat,
  onSeatChange,
}) {
  const [seatMap, setSeatMap] = useState(null);
  const [selected, setSelected] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);

  // Poll seat availability every 30s to catch real-time changes
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await api.get(`/flights/${flightId}/seats`);
      setSeatMap(data);
      setLoading(false);
    };
    load();
    const poll = setInterval(load, 30_000);
    return () => clearInterval(poll);
  }, [flightId]);

  // 10-min hold countdown
  useEffect(() => {
    if (selected.length === 0) return;
    setTimeLeft(600);
    const t = setInterval(
      () =>
        setTimeLeft((s) => {
          if (s <= 1) {
            clearInterval(t);
            setSelected([]);
            onSeatChange?.([]);
            return null;
          }
          return s - 1;
        }),
      1000,
    );
    return () => clearInterval(t);
  }, [selected.length > 0 ? "active" : "idle"]); // restart timer only when first seat selected

  const toggle = useCallback(
    (seat) => {
      if (!seat.isAvailable || seat.isHeld) return;
      setSelected((prev) => {
        const exists = prev.find((s) => s.seatNumber === seat.seatNumber);
        const next = exists
          ? prev.filter((s) => s.seatNumber !== seat.seatNumber)
          : prev.length < maxSelect
            ? [...prev, seat]
            : prev;
        onSeatChange?.(next);
        return next;
      });
    },
    [maxSelect, onSeatChange],
  );

  const getState = (seat) => {
    if (selected.find((s) => s.seatNumber === seat.seatNumber))
      return "selected";
    if (seat.isHeld) return "held";
    if (!seat.isAvailable) return "booked";
    return "available";
  };

  if (loading)
    return (
      <div
        style={{
          textAlign: "center",
          padding: 40,
          color: "var(--color-text-secondary)",
        }}
      >
        Loading seat map…
      </div>
    );
  if (!seatMap) return null;

  const cabin = seatMap[cabinClass] || [];
  const cfg = CABIN_CONFIG[cabinClass];

  // Group seats by row
  const rows = {};
  for (const seat of cabin) {
    const row = seat.seatNumber.slice(0, -1);
    if (!rows[row]) rows[row] = [];
    rows[row].push(seat);
  }

  const fmtTime = (s) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      {/* Legend */}
      <div
        style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}
      >
        {Object.entries(SEAT_COLORS).map(([state, c]) => (
          <div
            key={state}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              color: "var(--color-text-secondary)",
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: 4,
                background: c.bg,
                border: `1.5px solid ${c.border}`,
              }}
            />
            {state.charAt(0).toUpperCase() + state.slice(1)}
          </div>
        ))}
      </div>

      {/* Cabin label */}
      <div
        style={{
          textAlign: "center",
          fontSize: 11,
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "var(--color-text-secondary)",
          marginBottom: 8,
        }}
      >
        {cfg.label}
      </div>

      {/* Column headers */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 4,
          marginBottom: 4,
        }}
      >
        <div style={{ width: 24 }} />
        {cfg.cols.map((col, i) => (
          <>
            {i === cfg.aisleAfter + 1 && (
              <div key="aisle" style={{ width: 20 }} />
            )}
            <div
              key={col}
              style={{
                width: 34,
                textAlign: "center",
                fontSize: 11,
                color: "var(--color-text-tertiary)",
              }}
            >
              {col}
            </div>
          </>
        ))}
      </div>

      {/* Seat rows */}
      {Object.entries(rows).map(([rowNum, seats]) => (
        <div
          key={rowNum}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            marginBottom: 4,
          }}
        >
          <div
            style={{
              width: 24,
              fontSize: 11,
              color: "var(--color-text-tertiary)",
              textAlign: "right",
            }}
          >
            {rowNum}
          </div>
          {cfg.cols.map((col, i) => {
            const seat = seats.find((s) => s.seatNumber.endsWith(col));
            if (!seat)
              return <div key={col} style={{ width: 34, height: 34 }} />;
            const state = getState(seat);
            const c = SEAT_COLORS[state];
            return (
              <>
                {i === cfg.aisleAfter + 1 && (
                  <div key="aisle" style={{ width: 20 }} />
                )}
                <button
                  key={seat.seatNumber}
                  onClick={() => toggle(seat)}
                  title={seat.seatNumber}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "6px 6px 4px 4px",
                    background: c.bg,
                    border: `1.5px solid ${c.border}`,
                    color: c.color,
                    fontSize: 11,
                    fontWeight: 500,
                    cursor:
                      state === "available" || state === "selected"
                        ? "pointer"
                        : "not-allowed",
                    transition: "transform 0.1s",
                  }}
                >
                  {state === "booked"
                    ? "✕"
                    : state === "held"
                      ? "⏱"
                      : state === "selected"
                        ? "✓"
                        : col}
                </button>
              </>
            );
          })}
        </div>
      ))}

      {/* Hold timer */}
      {timeLeft !== null && (
        <p
          style={{
            textAlign: "center",
            fontSize: 12,
            color: "#A32D2D",
            marginTop: 12,
          }}
        >
          ⏱ Seat hold expires in {fmtTime(timeLeft)} — complete booking to
          confirm
        </p>
      )}
    </div>
  );
}
