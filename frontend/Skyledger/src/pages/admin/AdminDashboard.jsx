import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import api from "../../api/axios";

const STAT_CARD = ({ label, value, sub, up }) => (
  <div
    style={{
      background: "var(--color-background-secondary)",
      border: "1px solid var(--color-border-tertiary)",
      borderRadius: 10,
      padding: "14px 18px",
    }}
  >
    <div
      style={{
        fontSize: 11,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        color: "var(--color-text-secondary)",
        marginBottom: 6,
      }}
    >
      {label}
    </div>
    <div style={{ fontSize: 24, fontWeight: 500 }}>{value}</div>
    {sub && (
      <div
        style={{
          fontSize: 11,
          color: up
            ? "#0F6E56"
            : up === false
              ? "#A32D2D"
              : "var(--color-text-secondary)",
          marginTop: 4,
        }}
      >
        {sub}
      </div>
    )}
  </div>
);

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const PIE_COLORS = ["#185FA5", "#5DCAA5", "#EF9F27"];
const fmtINR = (v) => `₹${(v / 100000).toFixed(1)}L`;

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [chart, setChart] = useState([]);
  const [split, setSplit] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/admin/stats"),
      api.get("/admin/revenue-chart"),
      api.get("/admin/class-split"),
    ]).then(([s, c, sp]) => {
      setStats(s.data);
      setChart(
        c.data.map((d) => ({
          name: MONTH_NAMES[d._id.month - 1],
          revenue: d.revenue,
          bookings: d.bookings,
        })),
      );
      setSplit(
        sp.data.map((d) => ({
          name: d._id.charAt(0).toUpperCase() + d._id.slice(1),
          value: d.count,
          revenue: d.revenue,
        })),
      );
      setLoading(false);
    });
  }, []);

  if (loading)
    return (
      <p style={{ color: "var(--color-text-secondary)" }}>Loading dashboard…</p>
    );

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 500, marginBottom: 20 }}>
        Overview
      </h2>

      {/* Stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 14,
          marginBottom: 24,
        }}
      >
        <STAT_CARD
          label="Total bookings"
          value={stats.totalBookings.toLocaleString()}
          sub={`↑ ${stats.bookingGrowth}% this month`}
          up={Number(stats.bookingGrowth) >= 0}
        />
        <STAT_CARD
          label="Monthly revenue"
          value={fmtINR(stats.monthRevenue)}
          sub={`↑ ${stats.revenueGrowth}% vs last month`}
          up={Number(stats.revenueGrowth) >= 0}
        />
        <STAT_CARD
          label="Active flights"
          value={stats.activeFlights}
          sub="Upcoming scheduled"
        />
        <STAT_CARD
          label="Cancellations"
          value={stats.cancellations}
          sub="This month"
          up={false}
        />
      </div>

      {/* Revenue chart */}
      <div
        style={{
          background: "var(--color-background-secondary)",
          border: "1px solid var(--color-border-tertiary)",
          borderRadius: 10,
          padding: 20,
          marginBottom: 20,
        }}
      >
        <h3 style={{ fontSize: 14, fontWeight: 500, marginBottom: 16 }}>
          Monthly revenue
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chart} barSize={32}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={fmtINR}
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={52}
            />
            <Tooltip
              formatter={(v) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]}
            />
            <Bar dataKey="revenue" fill="#185FA5" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          marginBottom: 20,
        }}
      >
        {/* Pie chart */}
        <div
          style={{
            background: "var(--color-background-secondary)",
            border: "1px solid var(--color-border-tertiary)",
            borderRadius: 10,
            padding: 20,
          }}
        >
          <h3 style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
            Bookings by class
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={split}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={70}
                innerRadius={40}
              >
                {split.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Legend
                iconType="circle"
                iconSize={10}
                wrapperStyle={{ fontSize: 12 }}
              />
              <Tooltip formatter={(v, n) => [v, n]} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Recent bookings */}
        <div
          style={{
            background: "var(--color-background-secondary)",
            border: "1px solid var(--color-border-tertiary)",
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid var(--color-border-tertiary)",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Recent bookings
          </div>
          <div style={{ overflow: "auto", maxHeight: 200 }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 12,
              }}
            >
              <thead>
                <tr>
                  {["PNR", "Passenger", "Amount", "Status"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "7px 12px",
                        textAlign: "left",
                        fontWeight: 500,
                        color: "var(--color-text-secondary)",
                        borderBottom: "1px solid var(--color-border-tertiary)",
                        fontSize: 11,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.recentBookings.map((b) => (
                  <tr key={b._id}>
                    <td style={{ padding: "8px 12px", fontWeight: 500 }}>
                      {b.PNR}
                    </td>
                    <td
                      style={{
                        padding: "8px 12px",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {b.userId?.name}
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      ₹{b.totalAmount?.toLocaleString("en-IN")}
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: 20,
                          fontSize: 10,
                          fontWeight: 500,
                          background:
                            b.bookingStatus === "CONFIRMED"
                              ? "#E1F5EE"
                              : b.bookingStatus === "CANCELLED"
                                ? "#FCEBEB"
                                : "#FAEEDA",
                          color:
                            b.bookingStatus === "CONFIRMED"
                              ? "#085041"
                              : b.bookingStatus === "CANCELLED"
                                ? "#501313"
                                : "#412402",
                        }}
                      >
                        {b.bookingStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
