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
  }, [PNR, navigate]);

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
    <div className="min-h-[80vh] flex items-center justify-center font-sans py-12 px-4">
      <div className="max-w-[480px] w-full bg-surface rounded-2xl p-8 sm:p-10 shadow-soft border border-slate-200 text-center">
        <div className="text-[72px] leading-none mb-6 drop-shadow-md transform hover:scale-110 transition-transform duration-300">
          🎉
        </div>
        
        <h1 className="text-[28px] font-bold text-text-primary mb-2 tracking-tight">
          Booking confirmed!
        </h1>
        <p className="text-body-base text-text-secondary mb-8">
          Your e-ticket has been sent to your email.
        </p>

        <div className="bg-bg rounded-xl p-6 border border-slate-200 mb-8 relative overflow-hidden">
          {/* Decorative dashes simulating ticket edges */}
          <div className="absolute top-1/2 -left-3 w-6 h-6 bg-surface rounded-full border border-slate-200 -translate-y-1/2"></div>
          <div className="absolute top-1/2 -right-3 w-6 h-6 bg-surface rounded-full border border-slate-200 -translate-y-1/2"></div>
          
          <div className="text-label text-text-secondary uppercase tracking-widest mb-1">
            Your PNR
          </div>
          <div className="text-4xl font-bold tracking-[0.15em] text-primary">
            {PNR}
          </div>
          <div className="text-xs font-medium text-text-tertiary mt-2">
            Save this for check-in
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={downloadTicket}
            disabled={downloading}
            className="w-full bg-primary hover:bg-accent text-surface py-3.5 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {downloading ? "Generating PDF..." : (
              <><span>📄</span> Download e-ticket</>
            )}
          </button>
          
          <Link
            to="/dashboard"
            className="w-full bg-transparent text-primary border-2 border-primary hover:bg-primary/5 py-3 rounded-xl font-semibold transition-all flex justify-center items-center"
          >
            View my bookings
          </Link>
          
          <Link
            to="/"
            className="text-sm font-medium text-text-secondary hover:text-primary mt-2 transition-colors"
          >
            Search more flights
          </Link>
        </div>
      </div>
    </div>
  );
}
