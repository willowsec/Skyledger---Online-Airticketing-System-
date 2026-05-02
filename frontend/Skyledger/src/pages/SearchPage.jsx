import { useState } from "react";
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

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 500, marginBottom: 24 }}>
        Find flights
      </h1>

      {/* Search form */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 12,
          background: "var(--color-background-secondary)",
          padding: 20,
          borderRadius: 12,
          marginBottom: 20,
        }}
      >
        {["origin", "destination"].map((field) => (
          <label
            key={field}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              fontSize: 13,
            }}
          >
            {field.charAt(0).toUpperCase() + field.slice(1)}
            <select
              value={form[field]}
              onChange={(e) =>
                setForm((p) => ({ ...p, [field]: e.target.value }))
              }
              style={{
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid var(--color-border-tertiary)",
                background: "var(--color-background-primary)",
                fontSize: 14,
              }}
            >
              {AIRPORTS.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </label>
        ))}
        <label
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            fontSize: 13,
          }}
        >
          Date
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
            min={new Date().toISOString().slice(0, 10)}
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid var(--color-border-tertiary)",
              background: "var(--color-background-primary)",
              fontSize: 14,
            }}
          />
        </label>
        <label
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            fontSize: 13,
          }}
        >
          Passengers
          <input
            type="number"
            min={1}
            max={9}
            value={form.passengers}
            onChange={(e) =>
              setForm((p) => ({ ...p, passengers: e.target.value }))
            }
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid var(--color-border-tertiary)",
              background: "var(--color-background-primary)",
              fontSize: 14,
            }}
          />
        </label>
        <label
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            fontSize: 13,
          }}
        >
          Class
          <select
            value={form.cabinClass}
            onChange={(e) =>
              setForm((p) => ({ ...p, cabinClass: e.target.value }))
            }
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid var(--color-border-tertiary)",
              background: "var(--color-background-primary)",
              fontSize: 14,
            }}
          >
            <option value="economy">Economy</option>
            <option value="business">Business</option>
            <option value="first">First</option>
          </select>
        </label>
        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <button
            onClick={search}
            disabled={loading}
            style={{
              width: "100%",
              padding: "10px 0",
              borderRadius: 8,
              background: "#185FA5",
              color: "#fff",
              border: "none",
              fontSize: 15,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {loading ? "Searching…" : "Search"}
          </button>
        </div>
      </div>

      {error && (
        <p style={{ color: "var(--color-text-danger)", marginBottom: 12 }}>
          {error}
        </p>
      )}

      {/* Sort + filter bar */}
      {flights.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 16,
            flexWrap: "wrap",
            alignItems: "center",
            fontSize: 13,
          }}
        >
          <span style={{ color: "var(--color-text-secondary)" }}>
            {flights.length} flights found
          </span>
          <span>Sort:</span>
          {["price", "duration", "departure"].map((s) => (
            <button
              key={s}
              onClick={() => {
                setSortBy(s);
                search();
              }}
              style={{
                padding: "4px 12px",
                borderRadius: 20,
                border: "1px solid var(--color-border-secondary)",
                background: sortBy === s ? "#185FA5" : "transparent",
                color: sortBy === s ? "#fff" : "inherit",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
          <input
            placeholder="Max price ₹"
            type="number"
            value={filters.maxPrice}
            onChange={(e) =>
              setFilters((p) => ({ ...p, maxPrice: e.target.value }))
            }
            style={{
              padding: "4px 10px",
              borderRadius: 8,
              border: "1px solid var(--color-border-tertiary)",
              background: "var(--color-background-primary)",
              width: 110,
              fontSize: 13,
            }}
          />
        </div>
      )}

      {/* Results */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
          <p
            style={{
              color: "var(--color-text-secondary)",
              textAlign: "center",
              marginTop: 40,
            }}
          >
            No flights found. Try a different date or route.
          </p>
        )}
      </div>
    </div>
  );
}
