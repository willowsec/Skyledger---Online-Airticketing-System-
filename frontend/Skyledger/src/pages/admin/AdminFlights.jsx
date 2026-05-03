import { useEffect, useState } from "react";
import api from "../../api/axios";

const fmt = (d) =>
  new Date(d).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

export default function AdminFlights() {
  const [flights, setFlights] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [airlines, setAirlines] = useState([]);
  const [form, setForm] = useState({
    flightNumber: "",
    airlineId: "",
    origin: "",
    destination: "",
    departureTime: "",
    arrivalTime: "",
    stops: 0,
    baseFare: { economy: "", business: "", first: "" },
    seatConfig: { economy: 24, business: 4, first: 3 },
  });

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/flights", {
        params: { search, status, page },
      });
      setFlights(data.flights || []);
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
  }, [search, status, page]);

  useEffect(() => {
    api.get("/admin/airlines").then((r) => setAirlines(r.data)).catch(e => console.error(e));
  }, []);

  const cancelFlight = async (id) => {
    if (
      !window.confirm("Cancel this flight? All confirmed bookings will be cancelled.")
    )
      return;
    await api.patch(`/admin/flights/${id}/cancel`);
    load();
  };

  const deleteFlight = async (id) => {
    if (!window.confirm("Permanently delete this flight?")) return;
    await api.delete(`/admin/flights/${id}`);
    load();
  };

  const submitForm = async () => {
    try {
      await api.post("/admin/flights", form);
      setShowForm(false);
      load();
    } catch (e) {
      window.alert(e.response?.data?.message || "Failed to create flight");
    }
  };

  const STATUS_CLASSES = {
    scheduled: "bg-info/10 text-info border-info/20",
    delayed: "bg-warning/10 text-warning border-warning/20",
    cancelled: "bg-error/10 text-error border-error/20",
    completed: "bg-success/10 text-success border-success/20",
  };

  return (
    <div className="font-sans">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-h2-section text-text-primary">
          Flights{" "}
          <span className="text-body-base font-normal text-text-secondary ml-2">
            ({total})
          </span>
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary hover:bg-accent text-surface px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm flex items-center gap-2"
        >
          <span>+</span> Add flight
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          placeholder="Search flight no. or route..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-64 px-4 py-2 rounded-lg border border-slate-200 bg-surface text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-slate-400"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full sm:w-40 px-4 py-2 rounded-lg border border-slate-200 bg-surface text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
        >
          <option value="">All status</option>
          <option value="scheduled">Scheduled</option>
          <option value="delayed">Delayed</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-surface border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-bg/50">
              <tr>
                {[
                  "Flight",
                  "Airline",
                  "Route",
                  "Departure",
                  "Avail. seats",
                  "Base fare (Eco)",
                  "Status",
                  "Actions",
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
              ) : flights.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-text-secondary">
                    No flights found.
                  </td>
                </tr>
              ) : (
                flights.map((f) => {
                  const statusClass = STATUS_CLASSES[f.status] || STATUS_CLASSES.scheduled;
                  return (
                    <tr key={f._id} className="hover:bg-bg/50 transition-colors">
                      <td className="py-3 px-4 text-sm font-semibold text-text-primary">
                        {f.flightNumber}
                      </td>
                      <td className="py-3 px-4 text-sm text-text-secondary">
                        {f.airlineId?.name || "Unknown"}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium">
                        {f.origin} &rarr; {f.destination}
                      </td>
                      <td className="py-3 px-4 text-xs text-text-secondary">
                        {fmt(f.departureTime)}
                      </td>
                      <td className="py-3 px-4 text-xs text-text-secondary font-medium">
                        <span className="text-info">E:{f.availableSeats?.economy || 0}</span> /{" "}
                        <span className="text-primary">B:{f.availableSeats?.business || 0}</span> /{" "}
                        <span className="text-warning">F:{f.availableSeats?.first || 0}</span>
                      </td>
                      <td className="py-3 px-4 text-sm font-medium">
                        ₹{f.baseFare?.economy?.toLocaleString("en-IN") || 0}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${statusClass}`}>
                          {f.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          {f.status === "scheduled" && (
                            <button
                              onClick={() => cancelFlight(f._id)}
                              className="px-2.5 py-1 rounded text-xs font-semibold text-error bg-transparent border border-error/30 hover:bg-error/5 transition-colors"
                            >
                              Cancel
                            </button>
                          )}
                          <button
                            onClick={() => deleteFlight(f._id)}
                            className="px-2.5 py-1 rounded text-xs font-semibold text-text-secondary bg-transparent border border-slate-200 hover:bg-slate-100 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
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

      {/* Add flight modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-100">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-h3-card text-text-primary">Add new flight</h3>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {[
                  ["Flight number", "flightNumber", "text", "e.g. AI-201"],
                  ["Origin (IATA)", "origin", "text", "e.g. DEL"],
                  ["Destination", "destination", "text", "e.g. BOM"],
                  ["Stops", "stops", "number", "0"],
                ].map(([label, key, type, ph]) => (
                  <label key={key} className="flex flex-col gap-1.5">
                    <span className="text-label text-text-secondary uppercase tracking-wider">{label}</span>
                    <input
                      type={type}
                      placeholder={ph}
                      value={form[key]}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, [key]: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-surface text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                    />
                  </label>
                ))}

                <label className="flex flex-col gap-1.5">
                  <span className="text-label text-text-secondary uppercase tracking-wider">Airline</span>
                  <select
                    value={form.airlineId}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, airlineId: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-surface text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                  >
                    <option value="">Select airline</option>
                    {airlines.map((a) => (
                      <option key={a._id} value={a._id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="hidden sm:block"></div> {/* Spacer */}

                <label className="flex flex-col gap-1.5">
                  <span className="text-label text-text-secondary uppercase tracking-wider">Departure time</span>
                  <input
                    type="datetime-local"
                    value={form.departureTime}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, departureTime: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-surface text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-label text-text-secondary uppercase tracking-wider">Arrival time</span>
                  <input
                    type="datetime-local"
                    value={form.arrivalTime}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, arrivalTime: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-surface text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                  />
                </label>
              </div>

              <div className="mb-6">
                <div className="text-sm font-semibold text-text-primary mb-3">
                  Base fare (₹)
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {["economy", "business", "first"].map((cls) => (
                    <label key={cls} className="flex flex-col gap-1.5">
                      <span className="text-xs text-text-secondary capitalize">{cls}</span>
                      <input
                        type="number"
                        placeholder="0"
                        value={form.baseFare[cls]}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            baseFare: { ...p.baseFare, [cls]: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-surface text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold text-text-primary mb-3">
                  Seat rows per class
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {["economy", "business", "first"].map((cls) => (
                    <label key={cls} className="flex flex-col gap-1.5">
                      <span className="text-xs text-text-secondary capitalize">{cls} rows</span>
                      <input
                        type="number"
                        min={0}
                        value={form.seatConfig[cls]}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            seatConfig: {
                              ...p.seatConfig,
                              [cls]: Number(e.target.value),
                            },
                          }))
                        }
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-surface text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-bg/50 rounded-b-2xl">
              <button
                onClick={() => setShowForm(false)}
                className="px-6 py-2.5 rounded-xl border border-slate-200 text-text-secondary hover:text-text-primary hover:bg-slate-100 font-medium transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={submitForm}
                className="px-6 py-2.5 rounded-xl bg-primary hover:bg-accent text-surface font-semibold shadow-sm transition-colors text-sm"
              >
                Create flight
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
