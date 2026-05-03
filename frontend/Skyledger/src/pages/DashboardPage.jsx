import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const STATUS_CLASSES = {
  CONFIRMED: "bg-success/10 text-success border-success/20",
  CANCELLED: "bg-error/10 text-error border-error/20",
  HOLD: "bg-warning/10 text-warning border-warning/20",
  FAILED: "bg-error/10 text-error border-error/20",
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
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    api.get("/bookings/my").then((r) => {
      setBookings(r.data);
      setLoading(false);
    });
  }, []);

  const cancel = async (id) => {
    if (!window.confirm("Cancel this booking? A 20% cancellation fee applies."))
      return;
    setCancelling(id);
    try {
      const { data } = await api.delete(`/bookings/${id}`);
      window.alert(
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
      window.alert(e.response?.data?.message || "Cancellation failed");
    } finally {
      setCancelling(null);
    }
  };

  const downloadTicket = async (id, pnr) => {
    setDownloading(id);
    try {
      const { data } = await api.get(`/bookings/${id}/ticket`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(
        new Blob([data], { type: "application/pdf" }),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = `${pnr}-eticket.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.alert("Download failed. Please try again later.");
    } finally {
      setDownloading(null);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center py-20 min-h-[50vh]">
        <p className="text-body-base text-text-secondary animate-pulse">Loading bookings...</p>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 min-h-[80vh]">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-h2-section text-text-primary">My bookings</h2>
        {/* Simple tabs UI as suggested by brand guidelines */}
        <div className="hidden sm:flex bg-surface rounded-lg p-1 border border-slate-200 shadow-sm">
          <button className="px-4 py-1.5 rounded-md text-sm font-medium bg-bg text-primary shadow-sm">All</button>
          <button className="px-4 py-1.5 rounded-md text-sm font-medium text-text-secondary hover:text-text-primary">Upcoming</button>
          <button className="px-4 py-1.5 rounded-md text-sm font-medium text-text-secondary hover:text-text-primary">Past</button>
        </div>
      </div>

      {bookings.length === 0 && (
        <div className="text-center py-20 bg-surface rounded-xl border border-slate-200 shadow-sm">
          <div className="text-5xl mb-4 opacity-50">🎫</div>
          <p className="text-body-base text-text-secondary mb-6">You have no bookings yet.</p>
          <Link to="/" className="inline-block bg-primary hover:bg-accent text-surface px-6 py-2.5 rounded-lg text-button-text transition-colors shadow-sm">
            Search for flights &rarr;
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-5">
        {bookings.map((b) => {
          const statusClass = STATUS_CLASSES[b.bookingStatus] || STATUS_CLASSES.FAILED;
          const flight = b.flightId;
          const upcoming = flight && new Date(flight.departureTime) > new Date();
          
          return (
            <div
              key={b._id}
              className="bg-surface rounded-xl p-5 sm:p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="w-full sm:w-auto">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xl font-bold tracking-tight text-text-primary">
                      {b.PNR}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border tracking-wide uppercase ${statusClass}`}
                    >
                      {b.bookingStatus}
                    </span>
                  </div>
                  
                  {flight && (
                    <div className="text-body-sm text-text-secondary mb-1 flex items-center gap-2">
                      <span className="font-medium text-text-primary">{flight.airlineId?.name} {flight.flightNumber}</span>
                      <span className="opacity-50">•</span>
                      <span>{flight.origin} &rarr; {flight.destination}</span>
                    </div>
                  )}
                  
                  {flight && (
                    <div className="text-body-sm text-text-secondary font-medium mb-3 text-primary/80">
                      📅 {fmt(flight.departureTime)}
                    </div>
                  )}
                  
                  <div className="text-body-sm bg-bg inline-block px-3 py-1.5 rounded-md border border-slate-100">
                    <span className="text-text-secondary mr-2">Passengers:</span>
                    <span className="font-medium text-text-primary">
                      {b.passengers.map((p) => `${p.name} (${p.seatNumber})`).join(", ")}
                    </span>
                  </div>
                </div>

                <div className="w-full sm:w-auto text-left sm:text-right flex flex-row sm:flex-col justify-between sm:justify-start items-center sm:items-end mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-slate-100">
                  <div className="text-[22px] font-bold text-text-primary">
                    ₹{b.totalAmount.toLocaleString("en-IN")}
                  </div>
                  {b.refundAmount && (
                    <div className="text-label text-success font-medium mt-1">
                      Refund: ₹{b.refundAmount.toLocaleString("en-IN")}
                    </div>
                  )}
                  
                  <div className="flex gap-2 sm:mt-4">
                    {b.bookingStatus === "CONFIRMED" && (
                      <button
                        onClick={() => downloadTicket(b._id, b.PNR)}
                        disabled={downloading === b._id}
                        className="px-4 py-2 bg-primary hover:bg-accent text-surface rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
                      >
                        {downloading === b._id ? "..." : (
                          <><span>📄</span> Ticket</>
                        )}
                      </button>
                    )}
                    {b.bookingStatus === "CONFIRMED" && upcoming && (
                      <button
                        onClick={() => cancel(b._id)}
                        disabled={cancelling === b._id}
                        className="px-4 py-2 bg-transparent hover:bg-error/5 text-error border border-error/30 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                      >
                        {cancelling === b._id ? "Cancelling..." : "Cancel"}
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
