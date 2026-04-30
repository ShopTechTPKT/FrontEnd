import formatCurrency from "../../utils/formatCurrency";
import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  fetchOverview,
  fetchRevenueByDay,
  fetchTopProducts,
  fetchPaymentMethodDistribution,
} from "../../apis/adminStatsApi";

const COLORS = ["#7c3aed", "#06b6d4", "#22c55e", "#f59e0b", "#ef4444", "#6366f1"];

const toIsoDate = (date) => date.toISOString().slice(0, 10);

const getDateRangeFromPreset = (days) => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days + 1);
  return {
    startDate: toIsoDate(start),
    endDate: toIsoDate(end),
  };
};

const pickArray = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.result)) return payload.result;
  if (Array.isArray(payload.DT)) return payload.DT;
  if (Array.isArray(payload.content)) return payload.content;
  if (Array.isArray(payload.items)) return payload.items;
  return [];
};

const pickNumber = (payload, candidates, fallback = 0) => {
  for (const key of candidates) {
    const value = payload?.[key];
    if (typeof value === "number") return value;
  }
  return fallback;
};

const formatVndCompact = (value) =>
  new Intl.NumberFormat("vi-VN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(value) || 0);

const formatVnd = formatCurrency;

export default function AnalyticsDashboard() {
  const [preset, setPreset] = useState(30);
  const [range, setRange] = useState(getDateRangeFromPreset(30));
  const [loading, setLoading] = useState(false);
  const [kpi, setKpi] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    avgOrderValue: 0,
  });
  const [revenueSeries, setRevenueSeries] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);

  useEffect(() => {
    setRange(getDateRangeFromPreset(preset));
  }, [preset]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [overviewRaw, revenueRaw, topProductsRaw, paymentRaw] = await Promise.all([
          fetchOverview(),
          fetchRevenueByDay(range.startDate, range.endDate),
          fetchTopProducts(10),
          fetchPaymentMethodDistribution(range.startDate, range.endDate),
        ]);

        const overview = overviewRaw?.data || overviewRaw?.result || overviewRaw || {};
        const revenueRows = pickArray(revenueRaw).map((row, index) => ({
          label: row.date || row.day || row.label || `${index + 1}`,
          revenue: Number(row.revenue || row.totalRevenue || row.amount || 0),
        }));
        const topRows = pickArray(topProductsRaw).map((row, index) => ({
          name: row.productName || row.name || `SP ${index + 1}`,
          sold: Number(row.totalSold || row.sold || row.quantity || 0),
          revenue: Number(row.revenue || row.totalRevenue || 0),
        }));
        const paymentRows = pickArray(paymentRaw).map((row, index) => ({
          name: row.method || row.paymentMethod || row.name || `Method ${index + 1}`,
          value: Number(row.count || row.total || row.value || 0),
        }));

        const totalRevenue =
          pickNumber(overview, ["totalRevenue", "revenue"]) ||
          revenueRows.reduce((sum, item) => sum + item.revenue, 0);
        const totalOrders = pickNumber(overview, ["totalOrders", "ordersCount", "orderCount"]);
        const totalUsers = pickNumber(overview, ["totalUsers", "userCount", "customers"]);
        const avgOrderValue =
          totalOrders > 0 ? totalRevenue / totalOrders : pickNumber(overview, ["avgOrderValue"], 0);

        setKpi({ totalRevenue, totalOrders, totalUsers, avgOrderValue });
        setRevenueSeries(revenueRows);
        setTopProducts(topRows);
        setPaymentMethods(paymentRows);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [range.startDate, range.endDate]);

  const exportRevenueCsv = () => {
    if (!revenueSeries.length) return;
    const header = "date,revenue";
    const rows = revenueSeries.map((r) => `${r.label},${r.revenue}`);
    const content = [header, ...rows].join("\n");
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `analytics-revenue-${range.startDate}-to-${range.endDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const topProductsChartData = useMemo(
    () => topProducts.slice(0, 10).map((item) => ({ ...item, shortName: item.name.slice(0, 24) })),
    [topProducts]
  );

  return (
    <div className="space-y-6 p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <div className="flex flex-wrap items-center gap-2">
          {[7, 30, 90].map((value) => (
            <button
              key={value}
              onClick={() => setPreset(value)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                preset === value
                  ? "bg-violet-700 text-white"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              {value} ngày
            </button>
          ))}
          <button
            onClick={exportRevenueCsv}
            className="rounded-lg bg-white border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Doanh thu" value={formatVndCompact(kpi.totalRevenue)} />
        <KpiCard label="Đơn hàng" value={kpi.totalOrders} />
        <KpiCard label="Khách hàng" value={kpi.totalUsers} />
        <KpiCard label="Giá trị đơn TB" value={formatVnd(kpi.avgOrderValue)} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <ChartCard title="Doanh thu theo ngày" className="xl:col-span-2">
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={revenueSeries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis tickFormatter={formatVndCompact} />
              <Tooltip formatter={(v) => formatVnd(v)} />
              <Line type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Phương thức thanh toán">
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie data={paymentMethods} dataKey="value" nameKey="name" outerRadius={110}>
                {paymentMethods.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Top sản phẩm bán chạy">
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={topProductsChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="shortName" interval={0} angle={-15} textAnchor="end" height={70} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="sold" fill="#7c3aed" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {loading && (
        <div className="text-sm text-gray-500">Đang tải dữ liệu phân tích...</div>
      )}
    </div>
  );
}

function KpiCard({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function ChartCard({ title, children, className = "" }) {
  return (
    <div className={`rounded-xl border border-gray-100 bg-white p-4 shadow-sm ${className}`}>
      <h2 className="mb-3 text-base font-semibold text-gray-900">{title}</h2>
      {children}
    </div>
  );
}
