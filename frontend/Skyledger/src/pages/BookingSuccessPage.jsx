import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

export default function BookingSuccessPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { PNR, bookingId } = state || {};
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!PNR) navigate("/");
  }, [PNR]);

  const downloadTicket = async () => {
    setDownloading(true);
    try {
      const { data } = await api.get(`/bookings/${bookingId}/ticket`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(
        new Blob([data], { type: "application/pdf" }),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = `${PNR}-eticket.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Download failed. Check your email for the e-ticket.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 480,
        margin: "80px auto",
        padding: "0 16px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
      <h1 style={{ fontSize: 26, fontWeight: 500, marginBottom: 8 }}>
        Booking confirmed!
      </h1>
      <p
        style={{
          fontSize: 15,
          color: "var(--color-text-secondary)",
          marginBottom: 24,
        }}
      >
        Your e-ticket has been sent to your email.
      </p>

      <div
        style={{
          background: "var(--color-background-secondary)",
          borderRadius: 12,
          padding: 24,
          border: "1px solid var(--color-border-tertiary)",
          marginBottom: 24,
        }}
      >
        <div
          style={{
            fontSize: 13,
            color: "var(--color-text-secondary)",
            marginBottom: 4,
          }}
        >
          Your PNR
        </div>
        <div
          style={{
            fontSize: 36,
            fontWeight: 500,
            letterSpacing: "0.12em",
            color: "#185FA5",
          }}
        >
          {PNR}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "var(--color-text-tertiary)",
            marginTop: 6,
          }}
        >
          Save this for check-in
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button
          onClick={downloadTicket}
          disabled={downloading}
          style={{
            padding: "12px 0",
            background: "#185FA5",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          {downloading ? "Generating PDF…" : "⬇ Download e-ticket"}
        </button>
        <Link
          to="/dashboard"
          style={{
            padding: "12px 0",
            background: "transparent",
            color: "#185FA5",
            border: "1px solid #185FA5",
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 500,
            textDecoration: "none",
            display: "block",
          }}
        >
          View my bookings
        </Link>
        <Link
          to="/"
          style={{
            fontSize: 13,
            color: "var(--color-text-secondary)",
            marginTop: 4,
          }}
        >
          Search more flights
        </Link>
      </div>
    </div>
  );
}
