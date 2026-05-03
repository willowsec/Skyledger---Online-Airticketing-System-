import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";

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

      // Step 2: Open Razorpay checkout modal or simulate success
      if (data.isMock) {
        console.log("🛠️ Simulating payment success (Simulator Mode)");
        // Add a small delay for realistic UX
        setTimeout(async () => {
          try {
            const verify = await api.post("/bookings/verify-payment", {
              bookingId: data.bookingId,
              razorpayOrderId: data.razorpayOrderId,
              razorpayPaymentId: "pay_mock_" + Date.now(),
              razorpaySignature: "sig_mock",
              isMock: true,
            });
            navigate("/booking/success", {
              state: { PNR: verify.data.PNR, bookingId: verify.data.bookingId },
            });
          } catch (e) {
            setError(e.response?.data?.message || "Simulation failed");
            setLoading(false);
          }
        }, 1500);
        return;
      }

      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount * 100,
        currency: data.currency,
        order_id: data.razorpayOrderId,
        name: "SkyLedger",
        description: `Flight ${flight.flightNumber} — PNR ${data.PNR}`,
        prefill: data.prefill,
        theme: { color: "#1E3A8A" },

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
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-body-base text-text-secondary bg-surface p-8 rounded-xl shadow-sm border border-slate-100">
          No booking data. Please start from search.
        </p>
      </div>
    );

  const baseFare = totalAmount / 1.18;
  const taxes = totalAmount - baseFare;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 font-sans items-start">
      {/* Left Column: Passenger Details */}
      <div>
        <div className="mb-6">
          <h2 className="text-h2-section text-text-primary mb-1">
            Passenger details
          </h2>
          <p className="text-body-base text-text-secondary">
            {flight.flightNumber} · {flight.origin} &rarr; {flight.destination} · <span className="capitalize">{cabinClass}</span>
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {passengers.map((p, i) => (
            <div
              key={i}
              className="bg-surface rounded-xl p-6 shadow-sm border border-slate-200"
            >
              <h3 className="text-h3-card text-text-primary mb-5 flex items-center gap-2">
                <span className="bg-primary/10 text-primary w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold">
                  {i + 1}
                </span>
                Passenger {i + 1}
                <span className="text-body-sm font-normal text-text-secondary ml-auto bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                  Seat {selectedSeats[i]?.seatNumber}
                </span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className="text-label text-text-secondary uppercase tracking-wider">Full name (as on ID)</span>
                  <input
                    value={p.name}
                    onChange={(e) => updatePassenger(i, "name", e.target.value)}
                    placeholder="e.g. Jane Doe"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-surface text-body-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-slate-400"
                  />
                </label>
                
                <label className="flex flex-col gap-1.5">
                  <span className="text-label text-text-secondary uppercase tracking-wider">Date of birth</span>
                  <input
                    type="date"
                    value={p.dob}
                    onChange={(e) => updatePassenger(i, "dob", e.target.value)}
                    max={new Date().toISOString().slice(0, 10)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-surface text-body-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                  />
                </label>
                
                <label className="flex flex-col gap-1.5">
                  <span className="text-label text-text-secondary uppercase tracking-wider">ID type</span>
                  <select
                    value={p.idType}
                    onChange={(e) => updatePassenger(i, "idType", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-surface text-body-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                  >
                    <option value="aadhaar">Aadhaar</option>
                    <option value="passport">Passport</option>
                    <option value="pan">PAN card</option>
                  </select>
                </label>
                
                <label className="flex flex-col gap-1.5">
                  <span className="text-label text-text-secondary uppercase tracking-wider">ID number</span>
                  <input
                    value={p.idNumber}
                    onChange={(e) => updatePassenger(i, "idNumber", e.target.value)}
                    placeholder="Enter ID number"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-surface text-body-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-slate-400"
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Summary & Payment (Sticky) */}
      <div className="sticky top-24">
        <div className="bg-surface rounded-xl p-6 shadow-soft border border-slate-200 mb-6">
          <h3 className="text-h3-card text-text-primary mb-4 pb-4 border-b border-slate-100">
            Price summary
          </h3>
          
          <div className="flex flex-col gap-3 mb-6">
            <div className="flex justify-between items-center text-body-sm">
              <span className="text-text-secondary font-medium">Seats</span>
              <span className="font-semibold text-text-primary">{selectedSeats.map((s) => s.seatNumber).join(", ")}</span>
            </div>
            
            <div className="flex justify-between items-center text-body-sm">
              <span className="text-text-secondary font-medium">Base fare</span>
              <span className="font-semibold text-text-primary">
                ₹{baseFare.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-body-sm">
              <span className="text-text-secondary font-medium">Taxes (18%)</span>
              <span className="font-semibold text-text-primary">
                ₹{taxes.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center text-[20px] font-bold text-text-primary border-t border-slate-100 pt-4">
            <span>Total</span>
            <span>₹{totalAmount.toLocaleString("en-IN")}</span>
          </div>
        </div>

        {error && (
          <div className="bg-error/10 border border-error/20 text-error p-3 rounded-lg text-sm mb-4 font-medium">
            {error}
          </div>
        )}

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-primary hover:bg-accent text-surface py-3.5 rounded-xl font-semibold text-lg transition-all shadow-soft hover:shadow-hover disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none flex justify-center items-center gap-2"
        >
          {loading ? "Processing..." : (
            <>Pay ₹{totalAmount.toLocaleString("en-IN")} &rarr;</>
          )}
        </button>
        
        <div className="flex items-center justify-center gap-2 text-[11px] text-text-secondary uppercase tracking-wider font-medium mt-4">
          <span>🔒 Secured by Razorpay</span>
          <span>•</span>
          <span>Card / UPI / Net Banking</span>
        </div>
      </div>
    </div>
  );
}
