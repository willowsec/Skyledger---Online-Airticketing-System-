import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import FlightCard from "../components/FlightCard";

const AIRPORTS = ["DEL", "BOM", "BLR", "CCU", "GAU", "JFK", "DXB"];

export default function SearchPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    origin: "DEL",
    destination: "BOM",
    date: new Date().toISOString().slice(0, 10),
    passengers: 1,
    cabinClass: "economy",
  });
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("price");
  const [filters, setFilters] = useState({
    stops: "",
    minPrice: "",
    maxPrice: "",
  });

  const search = async () => {
    if (form.origin === form.destination)
      return setError("Origin and destination cannot be same");
    setError("");
    setLoading(true);
    try {
      const { data } = await api.get("/flights/search", {
        params: { ...form, ...filters, sortBy },
      });
      setFlights(data.results);
    } catch (e) {
      setError(e.response?.data?.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    search();
  }, [sortBy]);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Hero Section */}
      <div className="bg-gradient-hero w-full py-20 px-4 text-center">
        <h1 className="text-h1-hero text-surface mb-4">Where to next?</h1>
        <p className="text-body-base text-surface/90 max-w-2xl mx-auto">
          Book flights smarter with transparent pricing and zero friction.
        </p>
      </div>

      <div className="max-w-[900px] w-full px-4 -mt-12 relative z-10 mb-12">
        {/* Search form */}
        <div className="bg-surface/95 backdrop-blur-md shadow-soft rounded-xl p-6 border border-bg/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {["origin", "destination"].map((field) => (
              <label key={field} className="flex flex-col gap-1.5">
                <span className="text-label text-text-secondary uppercase tracking-wider">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </span>
                <select
                  value={form[field]}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, [field]: e.target.value }))
                  }
                  className="px-3 py-2.5 rounded-lg border border-slate-200 bg-surface text-body-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                >
                  {AIRPORTS.map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </select>
              </label>
            ))}
            
            <label className="flex flex-col gap-1.5">
              <span className="text-label text-text-secondary uppercase tracking-wider">Date</span>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                min={new Date().toISOString().slice(0, 10)}
                className="px-3 py-2.5 rounded-lg border border-slate-200 bg-surface text-body-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
              />
            </label>
            
            <label className="flex flex-col gap-1.5">
              <span className="text-label text-text-secondary uppercase tracking-wider">Passengers</span>
              <input
                type="number"
                min={1}
                max={9}
                value={form.passengers}
                onChange={(e) =>
                  setForm((p) => ({ ...p, passengers: e.target.value }))
                }
                className="px-3 py-2.5 rounded-lg border border-slate-200 bg-surface text-body-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
              />
            </label>
            
            <label className="flex flex-col gap-1.5">
              <span className="text-label text-text-secondary uppercase tracking-wider">Class</span>
              <select
                value={form.cabinClass}
                onChange={(e) =>
                  setForm((p) => ({ ...p, cabinClass: e.target.value }))
                }
                className="px-3 py-2.5 rounded-lg border border-slate-200 bg-surface text-body-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
              >
                <option value="economy">Economy</option>
                <option value="business">Business</option>
                <option value="first">First</option>
              </select>
            </label>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={search}
              disabled={loading}
              className="bg-primary hover:bg-accent text-surface px-8 py-3 rounded-lg text-button-text shadow-md hover:shadow-hover transition-all disabled:opacity-70 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              {loading ? "Searching..." : "Search Flights"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-error/10 border border-error/20 text-error rounded-lg text-body-sm flex items-center">
            <span className="mr-2">⚠️</span> {error}
          </div>
        )}

        {/* Sort + filter bar */}
        {flights.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 mt-8">
            <span className="text-body-sm text-text-secondary font-medium">
              {flights.length} flight{flights.length !== 1 ? 's' : ''} found
            </span>
            
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-body-sm text-text-secondary">Sort by:</span>
              <div className="flex bg-surface rounded-lg border border-slate-200 p-1 shadow-sm">
                {["price", "duration", "departure"].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setSortBy(s);
                      search();
                    }}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      sortBy === s
                        ? "bg-bg text-primary shadow-sm"
                        : "text-text-secondary hover:text-text-primary hover:bg-slate-50"
                    }`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
              
              <input
                placeholder="Max price ₹"
                type="number"
                value={filters.maxPrice}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, maxPrice: e.target.value }))
                }
                className="w-32 px-3 py-2 rounded-lg border border-slate-200 bg-surface text-body-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all shadow-sm"
              />
            </div>
          </div>
        )}

        {/* Results */}
        <div className="flex flex-col gap-4">
          {flights.map((f) => (
            <FlightCard
              key={f._id}
              flight={f}
              cabinClass={form.cabinClass}
              onSelect={() =>
                navigate(`/flights/${f._id}/seats`, {
                  state: {
                    flight: f,
                    cabinClass: form.cabinClass,
                    passengers: form.passengers,
                  },
                })
              }
            />
          ))}
          {!loading && flights.length === 0 && (
            <div className="text-center py-12 px-4 bg-surface rounded-xl border border-slate-100 shadow-sm mt-4">
              <span className="text-4xl mb-4 block">🛫</span>
              <h3 className="text-h3-card text-text-primary mb-2">No flights found</h3>
              <p className="text-body-base text-text-secondary">Try adjusting your search criteria or trying a different date.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
