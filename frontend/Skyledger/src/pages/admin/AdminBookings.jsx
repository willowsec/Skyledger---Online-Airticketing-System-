import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    startDate: "",
    endDate: "",
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/bookings", {
        params: { ...filters, page },
      });
      setBookings(data.bookings || []);
      setTotal(data.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page]);

  const exportCSV = async () => {
    try {
      const res = await api.get("/admin/bookings/export", {
        params: filters,
        responseType: "blob",
      });
      const url = URL.createObjectURL(new Blob([res.data], { type: "text/csv" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `bookings-${Date.now()}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      window.alert("Failed to export CSV.");
    }
  };

  const STATUS_CLASSES = {
    CONFIRMED: "bg-success/10 text-success border-success/20",
    CANCELLED: "bg-error/10 text-error border-error/20",
    HOLD: "bg-warning/10 text-warning border-warning/20",
    FAILED: "bg-error/10 text-error border-error/20",
  };

  return (
    <div className="font-sans">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-h2-section text-text-primary">
          Bookings{" "}
          <span className="text-body-base font-normal text-text-secondary ml-2">
            ({total})
          </span>
        </h2>
        <button
          onClick={exportCSV}
          className="bg-surface text-primary border border-primary hover:bg-primary/5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm flex items-center gap-2"
        >
          <span>📥</span> Export CSV
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          placeholder="Search PNR or passenger..."
          value={filters.search}
          onChange={(e) =>
            setFilters((p) => ({ ...p, search: e.target.value }))
          }
          className="w-full sm:flex-1 sm:min-w-[180px] px-4 py-2 rounded-lg border border-slate-200 bg-surface text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-slate-400"
        />
        <select
          value={filters.status}
          onChange={(e) =>
            setFilters((p) => ({ ...p, status: e.target.value }))
          }
          className="w-full sm:w-auto px-4 py-2 rounded-lg border border-slate-200 bg-surface text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
        >
          <option value="">All status</option>
          {["CONFIRMED", "CANCELLED", "HOLD", "FAILED"].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) =>
              setFilters((p) => ({ ...p, startDate: e.target.value }))
            }
            className="w-full sm:w-auto px-4 py-2 rounded-lg border border-slate-200 bg-surface text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
          />
          <span className="text-slate-400 font-medium">to</span>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) =>
              setFilters((p) => ({ ...p, endDate: e.target.value }))
            }
            className="w-full sm:w-auto px-4 py-2 rounded-lg border border-slate-200 bg-surface text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
          />
        </div>
      </div>

      <div className="bg-surface border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="bg-bg/50">
              <tr>
                {[
                  "PNR",
                  "Passenger",
                  "Flight",
                  "Route",
                  "Class",
                  "Amount",
                  "Status",
                  "Booked at",
                ].map((h) => (
                  <th
                    key={h}
                    className="py-3 px-4 text-[11px] font-bold text-text-secondary uppercase tracking-wider border-b border-slate-200"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-text-secondary">
                    Loading...
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-text-secondary">
                    No bookings found.
                  </td>
                </tr>
              ) : (
                bookings.map((b) => {
                  const statusClass = STATUS_CLASSES[b.bookingStatus] || STATUS_CLASSES.FAILED;
                  return (
                    <tr key={b._id} className="hover:bg-bg/50 transition-colors">
                      <td className="py-3 px-4 text-sm font-semibold text-text-primary">
                        {b.PNR}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm font-medium text-text-primary">{b.userId?.name || "Guest"}</div>
                        <div className="text-xs text-text-secondary mt-0.5">{b.userId?.email || ""}</div>
                      </td>
                      <td className="py-3 px-4 text-xs text-text-secondary font-medium">
                        {b.flightId?.flightNumber || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium">
                        {b.flightId?.origin || "?"} &rarr; {b.flightId?.destination || "?"}
                      </td>
                      <td className="py-3 px-4 text-sm capitalize">
                        {b.cabinClass}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium">
                        ₹{b.totalAmount?.toLocaleString("en-IN") || 0}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${statusClass}`}>
                          {b.bookingStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-text-secondary">
                        {new Date(b.createdAt).toLocaleDateString("en-IN")}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {total > 0 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          {Array.from({ length: Math.ceil(total / 20) }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`min-w-[32px] h-8 px-2 rounded-md text-sm font-medium transition-colors border ${
                page === i + 1
                  ? "bg-primary text-surface border-primary"
                  : "bg-surface text-text-secondary border-slate-200 hover:border-primary/30 hover:text-primary"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
