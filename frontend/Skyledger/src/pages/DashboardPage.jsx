import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const STATUS_COLORS = {
  CONFIRMED: { bg: "#E1F5EE", color: "#085041", border: "#5DCAA5" },
  CANCELLED: { bg: "#FCEBEB", color: "#501313", border: "#F09595" },
  HOLD: { bg: "#FAEEDA", color: "#412402", border: "#EF9F27" },
  FAILED: { bg: "#FCEBEB", color: "#501313", border: "#F09595" },
};

const fmt = (d) =>
  new Date(d).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default function DashboardPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    api.get("/bookings/my").then((r) => {
      setBookings(r.data);
      setLoading(false);
    });
  }, []);

  const cancel = async (id) => {
    if (!confirm("Cancel this booking? A 20% cancellation fee applies."))
      return;
    setCancelling(id);
    try {
      const { data } = await api.delete(`/bookings/${id}`);
      alert(
        `Booking cancelled. Refund of ₹${data.refundAmount.toLocaleString("en-IN")} within 5–7 days.`,
      );
      setBookings((prev) =>
        prev.map((b) =>
          b._id === id
            ? {
                ...b,
                bookingStatus: "CANCELLED",
                refundAmount: data.refundAmount,
              }
            : b,
        ),
      );
    } catch (e) {
      alert(e.response?.data?.message || "Cancellation failed");
    } finally {
      setCancelling(null);
    }
  };

  if (loading)
    return (
      <p style={{ padding: 40, color: "var(--color-text-secondary)" }}>
        Loading bookings…
      </p>
    );

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 16px" }}>
      <h2 style={{ fontSize: 22, fontWeight: 500, marginBottom: 24 }}>
        My bookings
      </h2>

      {bookings.length === 0 && (
        <div style={{ textAlign: "center", padding: 60 }}>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: 16 }}>
            No bookings yet.
          </p>
          <Link to="/" style={{ color: "#185FA5" }}>
            Search for flights →
          </Link>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {bookings.map((b) => {
          const sc = STATUS_COLORS[b.bookingStatus] || STATUS_COLORS.FAILED;
          const flight = b.flightId;
          const upcoming =
            flight && new Date(flight.departureTime) > new Date();
          return (
            <div
              key={b._id}
              style={{
                background: "var(--color-background-secondary)",
                borderRadius: 12,
                padding: 20,
                border: "1px solid var(--color-border-tertiary)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 6,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 20,
                        fontWeight: 500,
                        letterSpacing: "0.08em",
                      }}
                    >
                      {b.PNR}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 500,
                        padding: "2px 8px",
                        borderRadius: 20,
                        background: sc.bg,
                        color: sc.color,
                        border: `1px solid ${sc.border}`,
                      }}
                    >
                      {b.bookingStatus}
                    </span>
                  </div>
                  {flight && (
                    <div
                      style={{
                        fontSize: 13,
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {flight.airlineId?.name} {flight.flightNumber} ·{" "}
                      {flight.origin} → {flight.destination}
                    </div>
                  )}
                  {flight && (
                    <div
                      style={{
                        fontSize: 13,
                        color: "var(--color-text-secondary)",
                        marginTop: 2,
                      }}
                    >
                      {fmt(flight.departureTime)}
                    </div>
                  )}
                  <div style={{ fontSize: 13, marginTop: 6 }}>
                    {b.passengers
                      .map((p) => `${p.name} (${p.seatNumber})`)
                      .join(" · ")}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 18, fontWeight: 500 }}>
                    ₹{b.totalAmount.toLocaleString("en-IN")}
                  </div>
                  {b.refundAmount && (
                    <div style={{ fontSize: 12, color: "#0F6E56" }}>
                      Refund: ₹{b.refundAmount.toLocaleString("en-IN")}
                    </div>
                  )}
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      marginTop: 10,
                      justifyContent: "flex-end",
                    }}
                  >
                    {b.bookingStatus === "CONFIRMED" && (
                      <a
                        href={`/api/bookings/${b._id}/ticket`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          padding: "6px 14px",
                          background: "#185FA5",
                          color: "#fff",
                          borderRadius: 6,
                          fontSize: 12,
                          textDecoration: "none",
                        }}
                      >
                        Download ticket
                      </a>
                    )}
                    {b.bookingStatus === "CONFIRMED" && upcoming && (
                      <button
                        onClick={() => cancel(b._id)}
                        disabled={cancelling === b._id}
                        style={{
                          padding: "6px 14px",
                          background: "transparent",
                          color: "#A32D2D",
                          border: "1px solid #F09595",
                          borderRadius: 6,
                          fontSize: 12,
                          cursor: "pointer",
                        }}
                      >
                        {cancelling === b._id ? "Cancelling…" : "Cancel"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
