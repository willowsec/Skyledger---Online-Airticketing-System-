import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

export default function VerifyTicketPage() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/bookings/public/${id}`);
        setBooking(data);
      } catch (e) {
        setError("Invalid ticket or verification failed.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-10">
        <div className="text-text-secondary text-body-base animate-pulse">
          Verifying ticket...
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-h2-section text-error mb-2">Verification Failed</h2>
          <p className="text-body-base text-text-secondary">{error}</p>
        </div>
      </div>
    );
  }

  const isConfirmed = booking.bookingStatus === "CONFIRMED";

  return (
    <div className="min-h-screen bg-bg p-5 flex items-center justify-center font-sans py-12">
      <div className="max-w-md w-full bg-surface rounded-2xl overflow-hidden shadow-soft border border-slate-200">
        <div
          className={`${
            isConfirmed ? "bg-success" : "bg-error"
          } p-6 text-center text-surface`}
        >
          <div className="text-4xl mb-2">
            {isConfirmed ? "✅" : "⚠️"}
          </div>
          <h2 className="text-h3-card mb-1">
            {isConfirmed ? "Verified Ticket" : "Invalid Status"}
          </h2>
          <p className="text-label opacity-80 uppercase tracking-wider">
            SkyLedger Digital Verification
          </p>
        </div>

        <div className="p-6">
          <div className="mb-5">
            <label className="text-label text-text-secondary uppercase">
              PNR Number
            </label>
            <div className="text-[28px] font-bold text-text-primary tracking-tight">
              {booking.PNR}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5 mb-5">
            <div>
              <label className="text-label text-text-secondary uppercase">
                Flight
              </label>
              <div className="font-semibold text-text-primary">
                {booking.flightId?.flightNumber}
              </div>
            </div>
            <div>
              <label className="text-label text-text-secondary uppercase">
                Class
              </label>
              <div className="font-semibold text-text-primary capitalize">
                {booking.cabinClass}
              </div>
            </div>
          </div>

          <div className="mb-5">
            <label className="text-label text-text-secondary uppercase block mb-1">
              Passengers
            </label>
            {booking.passengers.map((p, i) => (
              <div
                key={i}
                className={`py-2.5 flex justify-between items-center ${
                  i < booking.passengers.length - 1 ? "border-b border-slate-100" : ""
                }`}
              >
                <span className="font-medium text-body-sm text-text-primary">{p.name}</span>
                <span className="text-label bg-slate-100 text-text-secondary px-2.5 py-1 rounded-md font-medium">
                  {p.seatNumber}
                </span>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-50 rounded-lg text-label text-text-secondary text-center leading-relaxed mt-4 border border-slate-100">
            Generated on {new Date(booking.createdAt).toLocaleString()}
            <br />
            Official SkyLedger Digital Record
          </div>
        </div>
      </div>
    </div>
  );
}
