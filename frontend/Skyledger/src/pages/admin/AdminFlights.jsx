import { useEffect, useState } from "react";
import api from "../../api/axios";

const fmt = (d) =>
  new Date(d).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

const inputStyle = {
  padding: "8px 11px",
  borderRadius: 7,
  border: "1px solid var(--color-border-tertiary)",
  background: "var(--color-background-primary)",
  color: "var(--color-text-primary)",
  fontSize: 13,
  width: "100%",
  boxSizing: "border-box",
};

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
    const { data } = await api.get("/admin/flights", {
      params: { search, status, page },
    });
    setFlights(data.flights);
    setTotal(data.total);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [search, status, page]);
  useEffect(() => {
    api.get("/admin/airlines").then((r) => setAirlines(r.data));
  }, []);

  const cancelFlight = async (id) => {
    if (
      !confirm("Cancel this flight? All confirmed bookings will be cancelled.")
    )
      return;
    await api.patch(`/admin/flights/${id}/cancel`);
    load();
  };

  const deleteFlight = async (id) => {
    if (!confirm("Permanently delete this flight?")) return;
    await api.delete(`/admin/flights/${id}`);
    load();
  };

  const submitForm = async () => {
    try {
      await api.post("/admin/flights", form);
      setShowForm(false);
      load();
    } catch (e) {
      alert(e.response?.data?.message || "Failed to create flight");
    }
  };

  const STATUS_BADGE = {
    scheduled: ["#E3EFFE", "#0C447C"],
    delayed: ["#FAEEDA", "#633806"],
    cancelled: ["#FCEBEB", "#501313"],
    completed: ["#E1F5EE", "#085041"],
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 500 }}>
          Flights{" "}
          <span
            style={{
              fontSize: 14,
              fontWeight: 400,
              color: "var(--color-text-secondary)",
            }}
          >
            ({total})
          </span>
        </h2>
        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: "8px 16px",
            background: "#185FA5",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          + Add flight
        </button>
      </div>

      {/* Filters */}
      <div
        style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}
      >
        <input
          placeholder="Search flight no. or route…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...inputStyle, width: 240 }}
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{ ...inputStyle, width: 160 }}
        >
          <option value="">All status</option>
          <option value="scheduled">Scheduled</option>
          <option value="delayed">Delayed</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Table */}
      <div
        style={{
          background: "var(--color-background-secondary)",
          border: "1px solid var(--color-border-tertiary)",
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        <table
          style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
        >
          <thead>
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
                  style={{
                    padding: "10px 14px",
                    textAlign: "left",
                    fontWeight: 500,
                    color: "var(--color-text-secondary)",
                    borderBottom: "1px solid var(--color-border-tertiary)",
                    fontSize: 11,
                    textTransform: "uppercase",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={8}
                  style={{
                    padding: 32,
                    textAlign: "center",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  Loading…
                </td>
              </tr>
            ) : (
              flights.map((f) => {
                const [bg, color] =
                  STATUS_BADGE[f.status] || STATUS_BADGE.scheduled;
                return (
                  <tr
                    key={f._id}
                    style={{
                      borderBottom: "1px solid var(--color-border-tertiary)",
                    }}
                  >
                    <td style={{ padding: "10px 14px", fontWeight: 500 }}>
                      {f.flightNumber}
                    </td>
                    <td
                      style={{
                        padding: "10px 14px",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {f.airlineId?.name}
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      {f.origin} → {f.destination}
                    </td>
                    <td
                      style={{
                        padding: "10px 14px",
                        color: "var(--color-text-secondary)",
                        fontSize: 12,
                      }}
                    >
                      {fmt(f.departureTime)}
                    </td>
                    <td style={{ padding: "10px 14px", fontSize: 12 }}>
                      E:{f.availableSeats.economy} / B:
                      {f.availableSeats.business} / F:{f.availableSeats.first}
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      ₹{f.baseFare.economy?.toLocaleString("en-IN")}
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <span
                        style={{
                          padding: "3px 9px",
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 500,
                          background: bg,
                          color,
                        }}
                      >
                        {f.status}
                      </span>
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        {f.status === "scheduled" && (
                          <button
                            onClick={() => cancelFlight(f._id)}
                            style={{
                              padding: "3px 10px",
                              borderRadius: 5,
                              border: "1px solid #F09595",
                              background: "transparent",
                              color: "#A32D2D",
                              fontSize: 12,
                              cursor: "pointer",
                            }}
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          onClick={() => deleteFlight(f._id)}
                          style={{
                            padding: "3px 10px",
                            borderRadius: 5,
                            border: "1px solid var(--color-border-secondary)",
                            background: "transparent",
                            fontSize: 12,
                            cursor: "pointer",
                          }}
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

      {/* Pagination */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 8,
          marginTop: 16,
        }}
      >
        {Array.from({ length: Math.ceil(total / 20) }, (_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            style={{
              padding: "5px 12px",
              borderRadius: 6,
              border: "1px solid var(--color-border-secondary)",
              background: page === i + 1 ? "#185FA5" : "transparent",
              color: page === i + 1 ? "#fff" : "inherit",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Add flight modal */}
      {showForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "var(--color-background-primary)",
              borderRadius: 12,
              padding: 28,
              width: "100%",
              maxWidth: 560,
              maxHeight: "90vh",
              overflow: "auto",
            }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 500, marginBottom: 20 }}>
              Add new flight
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              {[
                ["Flight number", "flightNumber", "text", "e.g. AI-201"],
                ["Origin (IATA)", "origin", "text", "e.g. DEL"],
                ["Destination", "destination", "text", "e.g. BOM"],
                ["Stops", "stops", "number", "0"],
              ].map(([label, key, type, ph]) => (
                <label
                  key={key}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 5,
                    fontSize: 13,
                  }}
                >
                  {label}
                  <input
                    type={type}
                    placeholder={ph}
                    value={form[key]}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, [key]: e.target.value }))
                    }
                    style={inputStyle}
                  />
                </label>
              ))}

              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 5,
                  fontSize: 13,
                }}
              >
                Airline
                <select
                  value={form.airlineId}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, airlineId: e.target.value }))
                  }
                  style={inputStyle}
                >
                  <option value="">Select airline</option>
                  {airlines.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </label>

              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 5,
                  fontSize: 13,
                }}
              >
                Departure time
                <input
                  type="datetime-local"
                  value={form.departureTime}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, departureTime: e.target.value }))
                  }
                  style={inputStyle}
                />
              </label>
              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 5,
                  fontSize: 13,
                }}
              >
                Arrival time
                <input
                  type="datetime-local"
                  value={form.arrivalTime}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, arrivalTime: e.target.value }))
                  }
                  style={inputStyle}
                />
              </label>
            </div>

            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>
                Base fare (₹)
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 10,
                }}
              >
                {["economy", "business", "first"].map((cls) => (
                  <label
                    key={cls}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 5,
                      fontSize: 12,
                    }}
                  >
                    {cls.charAt(0).toUpperCase() + cls.slice(1)}
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
                      style={inputStyle}
                    />
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>
                Seat rows per class
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 10,
                }}
              >
                {["economy", "business", "first"].map((cls) => (
                  <label
                    key={cls}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 5,
                      fontSize: 12,
                    }}
                  >
                    {cls.charAt(0).toUpperCase() + cls.slice(1)} rows
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
                      style={inputStyle}
                    />
                  </label>
                ))}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 20,
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setShowForm(false)}
                style={{
                  padding: "9px 18px",
                  borderRadius: 8,
                  border: "1px solid var(--color-border-secondary)",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                Cancel
              </button>
              <button
                onClick={submitForm}
                style={{
                  padding: "9px 18px",
                  borderRadius: 8,
                  background: "#185FA5",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 500,
                }}
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
