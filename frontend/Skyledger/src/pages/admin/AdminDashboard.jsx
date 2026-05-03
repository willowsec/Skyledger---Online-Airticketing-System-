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
  <div className="bg-surface border border-slate-200 rounded-xl p-6 shadow-sm">
    <div className="text-xs uppercase tracking-wider text-text-secondary font-semibold mb-2">
      {label}
    </div>
    <div className="text-3xl font-bold text-text-primary">{value}</div>
    {sub && (
      <div
        className={`text-xs mt-2 font-medium ${
          up
            ? "text-success"
            : up === false
              ? "text-error"
              : "text-text-secondary"
        }`}
      >
        {sub}
      </div>
    )}
  </div>
);

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];
const PIE_COLORS = ["#1E3A8A", "#0EA5E9", "#F59E0B"];
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
      <div className="flex justify-center items-center py-20">
        <p className="text-body-base text-text-secondary animate-pulse">Loading dashboard...</p>
      </div>
    );

  return (
    <div className="font-sans">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-h2-section text-text-primary">Overview</h2>
        <div className="text-sm font-medium text-text-secondary bg-surface px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
          Today: {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
      <div className="bg-surface border border-slate-200 rounded-xl p-6 shadow-sm mb-8">
        <h3 className="text-h3-card text-text-primary mb-6">Monthly revenue</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chart} barSize={40}>
            <XAxis
              dataKey="name"
              tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }}
              axisLine={{ stroke: '#E2E8F0' }}
              tickLine={false}
              dy={10}
            />
            <YAxis
              tickFormatter={fmtINR}
              tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              width={60}
              dx={-10}
            />
            <Tooltip
              cursor={{ fill: '#F1F5F9' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
              formatter={(v) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]}
            />
            <Bar dataKey="revenue" fill="#1E3A8A" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Pie chart */}
        <div className="bg-surface border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-h3-card text-text-primary mb-2">Bookings by class</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={split}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={50}
                paddingAngle={5}
              >
                {split.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Legend
                iconType="circle"
                iconSize={10}
                wrapperStyle={{ fontSize: 13, fontWeight: 500, color: '#475569' }}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                formatter={(v, n) => [v, n]} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Recent bookings */}
        <div className="bg-surface border border-slate-200 rounded-xl shadow-sm flex flex-col">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-h3-card text-text-primary">Recent bookings</h3>
            <button className="text-sm text-primary font-medium hover:underline">View all</button>
          </div>
          <div className="overflow-auto flex-1">
            <table className="w-full text-left border-collapse min-w-[400px]">
              <thead className="bg-bg/50">
                <tr>
                  {["PNR", "Passenger", "Amount", "Status"].map((h) => (
                    <th
                      key={h}
                      className="py-3 px-6 text-[11px] font-bold text-text-secondary uppercase tracking-wider border-b border-slate-200"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.recentBookings.map((b) => {
                  let statusClass = "bg-warning/10 text-warning border border-warning/20";
                  if (b.bookingStatus === "CONFIRMED") statusClass = "bg-success/10 text-success border border-success/20";
                  if (b.bookingStatus === "CANCELLED") statusClass = "bg-error/10 text-error border border-error/20";
                  
                  return (
                    <tr key={b._id} className="hover:bg-bg/50 transition-colors">
                      <td className="py-4 px-6 text-sm font-semibold text-text-primary">
                        {b.PNR}
                      </td>
                      <td className="py-4 px-6 text-sm text-text-secondary">
                        {b.userId?.name || "Guest"}
                      </td>
                      <td className="py-4 px-6 text-sm font-medium text-text-primary">
                        ₹{b.totalAmount?.toLocaleString("en-IN")}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusClass}`}>
                          {b.bookingStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
