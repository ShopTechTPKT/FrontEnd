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
        <KpiCard
          label="Doanh thu"
          value={formatVndCompact(kpi.totalRevenue)}
          subValue={formatVnd(kpi.totalRevenue)}
          gradient="from-violet-500 to-purple-600"
          icon={
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          trend="+12%"
          trendUp
        />
        <KpiCard
          label="Đơn hàng"
          value={kpi.totalOrders}
          gradient="from-blue-500 to-cyan-500"
          icon={
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          }
          trend="+8%"
          trendUp
        />
        <KpiCard
          label="Khách hàng"
          value={kpi.totalUsers}
          gradient="from-emerald-500 to-teal-500"
          icon={
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm10 5a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          trend="+5%"
          trendUp
        />
        <KpiCard
          label="Giá trị đơn TB"
          value={formatVnd(kpi.avgOrderValue)}
          gradient="from-orange-500 to-amber-500"
          icon={
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
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
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-600 font-medium">Đang tải dữ liệu...</p>
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({ label, value, subValue, icon, gradient = "from-violet-500 to-purple-600", trend, trendUp }) {
  return (
    <div className="relative rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      {/* Gradient accent top bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`} />
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">{label}</p>
            <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
            {subValue && <p className="text-xs text-gray-400 mt-1 truncate">{subValue}</p>}
          </div>
          {icon && (
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm shrink-0 ml-3`}>
              {icon}
            </div>
          )}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 mt-3 text-xs font-semibold ${
            trendUp ? "text-emerald-600" : "text-red-500"
          }`}>
            <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d={trendUp ? "M7 17l10-10M17 7H7m10 0v10" : "M7 7l10 10M17 17H7m10 0V7"} />
            </svg>
            {trend} <span className="text-gray-400 font-normal">so với tháng trước</span>
          </div>
        )}
      </div>
    </div>
  );
}

function ChartCard({ title, children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden ${className}`}>
      <div className="px-5 py-4 border-b border-gray-50">
        <h2 className="text-sm font-semibold text-gray-900 tracking-tight">{title}</h2>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}
