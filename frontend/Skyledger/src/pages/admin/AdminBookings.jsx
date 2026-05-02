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
    const { data } = await api.get("/admin/bookings", {
      params: { ...filters, page },
    });
    setBookings(data.bookings);
    setTotal(data.total);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [filters, page]);

  const exportCSV = async () => {
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
  };

  const inputStyle = {
    padding: "7px 11px",
    borderRadius: 7,
    border: "1px solid var(--color-border-tertiary)",
    background: "var(--color-background-primary)",
    color: "var(--color-text-primary)",
    fontSize: 13,
  };
  const BADGE = {
    CONFIRMED: ["#E1F5EE", "#085041"],
    CANCELLED: ["#FCEBEB", "#501313"],
    HOLD: ["#FAEEDA", "#412402"],
    FAILED: ["#FCEBEB", "#501313"],
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
          Bookings{" "}
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
          onClick={exportCSV}
          style={{
            padding: "8px 16px",
            background: "transparent",
            color: "#185FA5",
            border: "1px solid #185FA5",
            borderRadius: 8,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Export CSV
        </button>
      </div>

      <div
        style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}
      >
        <input
          placeholder="Search PNR or passenger…"
          value={filters.search}
          onChange={(e) =>
            setFilters((p) => ({ ...p, search: e.target.value }))
          }
          style={{ ...inputStyle, flex: 1, minWidth: 180 }}
        />
        <select
          value={filters.status}
          onChange={(e) =>
            setFilters((p) => ({ ...p, status: e.target.value }))
          }
          style={inputStyle}
        >
          <option value="">All status</option>
          {["CONFIRMED", "CANCELLED", "HOLD", "FAILED"].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) =>
            setFilters((p) => ({ ...p, startDate: e.target.value }))
          }
          style={inputStyle}
        />
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) =>
            setFilters((p) => ({ ...p, endDate: e.target.value }))
          }
          style={inputStyle}
        />
      </div>

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
                  style={{
                    padding: "10px 14px",
                    textAlign: "left",
                    fontSize: 11,
                    textTransform: "uppercase",
                    fontWeight: 500,
                    color: "var(--color-text-secondary)",
                    borderBottom: "1px solid var(--color-border-tertiary)",
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
              bookings.map((b) => {
                const [bg, color] = BADGE[b.bookingStatus] || BADGE.FAILED;
                return (
                  <tr
                    key={b._id}
                    style={{
                      borderBottom: "1px solid var(--color-border-tertiary)",
                    }}
                  >
                    <td style={{ padding: "10px 14px", fontWeight: 500 }}>
                      {b.PNR}
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      {b.userId?.name}
                      <br />
                      <span
                        style={{
                          fontSize: 11,
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        {b.userId?.email}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "10px 14px",
                        color: "var(--color-text-secondary)",
                        fontSize: 12,
                      }}
                    >
                      {b.flightId?.flightNumber}
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      {b.flightId?.origin} → {b.flightId?.destination}
                    </td>
                    <td
                      style={{
                        padding: "10px 14px",
                        textTransform: "capitalize",
                      }}
                    >
                      {b.cabinClass}
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      ₹{b.totalAmount?.toLocaleString("en-IN")}
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: 20,
                          fontSize: 10,
                          fontWeight: 500,
                          background: bg,
                          color,
                        }}
                      >
                        {b.bookingStatus}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "10px 14px",
                        color: "var(--color-text-secondary)",
                        fontSize: 12,
                      }}
                    >
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
  );
}
