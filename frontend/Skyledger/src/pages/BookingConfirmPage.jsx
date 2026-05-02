import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid var(--color-border-tertiary)",
  background: "var(--color-background-primary)",
  fontSize: 14,
  boxSizing: "border-box",
};
const labelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  fontSize: 13,
};

export default function BookingConfirmPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const {
    flight,
    cabinClass,
    passengers: passengerCount,
    selectedSeats,
    totalAmount,
  } = state || {};

  const [passengers, setPassengers] = useState(
    Array.from({ length: passengerCount || 1 }, () => ({
      name: "",
      dob: "",
      idType: "aadhaar",
      idNumber: "",
    })),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updatePassenger = (i, field, val) =>
    setPassengers((prev) =>
      prev.map((p, idx) => (idx === i ? { ...p, [field]: val } : p)),
    );

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (document.getElementById("rzp-script")) return resolve(true);
      const s = document.createElement("script");
      s.id = "rzp-script";
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });

  const handlePayment = async () => {
    // Basic validation
    for (const p of passengers) {
      if (!p.name || !p.dob || !p.idNumber)
        return setError("Please fill in all passenger details");
    }
    setError("");
    setLoading(true);

    try {
      // Step 1: Initiate booking → get Razorpay order
      const { data } = await api.post("/bookings/initiate", {
        flightId: flight._id,
        seatIds: selectedSeats.map((s) => s._id),
        cabinClass,
        passengers,
      });

      const loaded = await loadRazorpayScript();
      if (!loaded)
        return setError("Failed to load payment gateway. Check connection.");

      // Step 2: Open Razorpay checkout modal
      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount * 100,
        currency: data.currency,
        order_id: data.razorpayOrderId,
        name: "OATS Air",
        description: `Flight ${flight.flightNumber} — PNR ${data.PNR}`,
        prefill: data.prefill,
        theme: { color: "#185FA5" },

        // Step 3: On success, verify with backend
        handler: async (response) => {
          try {
            const verify = await api.post("/bookings/verify-payment", {
              bookingId: data.bookingId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            navigate("/booking/success", {
              state: { PNR: verify.data.PNR, bookingId: verify.data.bookingId },
            });
          } catch {
            setError(
              "Payment verification failed. Contact support with your PNR.",
            );
            setLoading(false);
          }
        },

        // On modal dismiss or failure
        modal: {
          ondismiss: async () => {
            await api
              .post("/bookings/payment-failed", { bookingId: data.bookingId })
              .catch(() => {});
            setError("Payment cancelled. Your seat hold has been released.");
            setLoading(false);
          },
        },
      });

      rzp.open();
    } catch (e) {
      setError(e.response?.data?.message || "Something went wrong");
      setLoading(false);
    }
  };

  if (!flight)
    return (
      <p style={{ padding: 40 }}>No booking data. Please start from search.</p>
    );

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 16px" }}>
      <h2 style={{ fontSize: 22, fontWeight: 500, marginBottom: 4 }}>
        Passenger details
      </h2>
      <p
        style={{
          fontSize: 13,
          color: "var(--color-text-secondary)",
          marginBottom: 24,
        }}
      >
        {flight.flightNumber} · {flight.origin} → {flight.destination} ·{" "}
        {cabinClass}
      </p>

      {passengers.map((p, i) => (
        <div
          key={i}
          style={{
            background: "var(--color-background-secondary)",
            borderRadius: 12,
            padding: 20,
            marginBottom: 16,
            border: "1px solid var(--color-border-tertiary)",
          }}
        >
          <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 16 }}>
            Passenger {i + 1} — Seat {selectedSeats[i]?.seatNumber}
          </h3>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <label style={labelStyle}>
              Full name (as on ID)
              <input
                value={p.name}
                onChange={(e) => updatePassenger(i, "name", e.target.value)}
                placeholder="e.g. Soumyadeep Dutta"
                style={inputStyle}
              />
            </label>
            <label style={labelStyle}>
              Date of birth
              <input
                type="date"
                value={p.dob}
                onChange={(e) => updatePassenger(i, "dob", e.target.value)}
                max={new Date().toISOString().slice(0, 10)}
                style={inputStyle}
              />
            </label>
            <label style={labelStyle}>
              ID type
              <select
                value={p.idType}
                onChange={(e) => updatePassenger(i, "idType", e.target.value)}
                style={inputStyle}
              >
                <option value="aadhaar">Aadhaar</option>
                <option value="passport">Passport</option>
                <option value="pan">PAN card</option>
              </select>
            </label>
            <label style={labelStyle}>
              ID number
              <input
                value={p.idNumber}
                onChange={(e) => updatePassenger(i, "idNumber", e.target.value)}
                placeholder="Enter ID number"
                style={inputStyle}
              />
            </label>
          </div>
        </div>
      ))}

      {/* Price summary */}
      <div
        style={{
          background: "var(--color-background-secondary)",
          borderRadius: 12,
          padding: 20,
          border: "1px solid var(--color-border-tertiary)",
          marginBottom: 16,
        }}
      >
        <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 12 }}>
          Price summary
        </h3>
        {[
          ["Seats", selectedSeats.map((s) => s.seatNumber).join(", ")],
          [
            "Base fare",
            `₹${(totalAmount / 1.18).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
          ],
          [
            "Taxes (18%)",
            `₹${(totalAmount - totalAmount / 1.18).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
          ],
          ["Total", `₹${totalAmount.toLocaleString("en-IN")}`],
        ].map(([k, v], idx) => (
          <div
            key={k}
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: idx === 3 ? 15 : 13,
              fontWeight: idx === 3 ? 500 : 400,
              borderTop:
                idx === 3 ? "1px solid var(--color-border-tertiary)" : "none",
              paddingTop: idx === 3 ? 10 : 0,
              marginTop: idx === 3 ? 8 : 0,
              marginBottom: 8,
            }}
          >
            <span
              style={{
                color: idx === 3 ? "inherit" : "var(--color-text-secondary)",
              }}
            >
              {k}
            </span>
            <span>{v}</span>
          </div>
        ))}
      </div>

      {error && (
        <p
          style={{
            color: "var(--color-text-danger, #A32D2D)",
            marginBottom: 12,
            fontSize: 13,
          }}
        >
          {error}
        </p>
      )}

      <button
        onClick={handlePayment}
        disabled={loading}
        style={{
          width: "100%",
          padding: 14,
          background: loading ? "#999" : "#185FA5",
          color: "#fff",
          border: "none",
          borderRadius: 10,
          fontSize: 16,
          fontWeight: 500,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading
          ? "Processing…"
          : `Pay ₹${totalAmount.toLocaleString("en-IN")}`}
      </button>
      <p
        style={{
          fontSize: 11,
          color: "var(--color-text-tertiary)",
          textAlign: "center",
          marginTop: 10,
        }}
      >
        Secured by Razorpay · Card / UPI / Net Banking
      </p>
    </div>
  );
}
