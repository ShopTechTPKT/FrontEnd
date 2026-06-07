import React, { useEffect, useMemo, useState } from "react";
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
  FaChartLine,
  FaShoppingBag,
  FaUsers,
  FaMoneyBillWave,
  FaDownload,
  FaCalendarAlt
} from "react-icons/fa";
import {
  fetchOverview,
  fetchRevenueByDay,
  fetchTopProducts,
  fetchPaymentMethodDistribution,
  fetchTopCustomers,
  fetchConversionRate,
  downloadRevenueExport,
} from "../../apis/adminStatsApi";
import formatCurrency from "../../utils/formatCurrency";

const COLORS = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#6366f1"];

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

const pickObject = (payload, candidates = []) => {
  if (!payload) return null;
  for (const key of candidates) {
    const value = payload?.[key];
    if (value && typeof value === "object" && !Array.isArray(value)) return value;
  }
  return null;
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

// Custom Tooltip for charts to support Dark Mode seamlessly
const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[var(--color-bg)] border border-[var(--color-border)] p-3 rounded-lg shadow-xl text-sm">
        <p className="font-semibold text-[var(--color-text)] mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="flex items-center gap-2" style={{ color: entry.color || entry.fill }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }}></span>
            {entry.name}: <span className="font-bold">{formatter ? formatter(entry.value) : entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsDashboard() {
  const [preset, setPreset] = useState(30);
  const [range, setRange] = useState(getDateRangeFromPreset(30));
  const [loading, setLoading] = useState(true);
  const [kpi, setKpi] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    avgOrderValue: 0,
    conversionRate: 0,
    successfulConversionRate: 0,
  });
  const [revenueSeries, setRevenueSeries] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);

  useEffect(() => {
    setRange(getDateRangeFromPreset(preset));
  }, [preset]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const results = await Promise.allSettled([
          fetchOverview(),
          fetchRevenueByDay(range.startDate, range.endDate),
          fetchTopProducts(10),
          fetchPaymentMethodDistribution(range.startDate, range.endDate),
          fetchTopCustomers(10),
          fetchConversionRate(range.startDate, range.endDate),
        ]);

        const overviewRaw = results[0].status === "fulfilled" ? results[0].value : {};
        const revenueRaw = results[1].status === "fulfilled" ? results[1].value : {};
        const topProductsRaw = results[2].status === "fulfilled" ? results[2].value : {};
        const paymentRaw = results[3].status === "fulfilled" ? results[3].value : {};
        const topCustomersRaw = results[4].status === "fulfilled" ? results[4].value : {};
        const conversionRaw = results[5].status === "fulfilled" ? results[5].value : {};

        const overview = overviewRaw?.data || overviewRaw?.result || overviewRaw || {};
        const revenueMap = pickObject(revenueRaw, ["revenueByDay"]) || {};
        const revenueRows = Object.entries(revenueMap).map(([date, revenue]) => ({
          label: date,
          revenue: Number(revenue || 0),
        }));

        const topRows = pickArray(topProductsRaw?.topProducts || topProductsRaw).map((row, index) => ({
          name: row.productName || row.name || `SP ${index + 1}`,
          sold: Number(row.totalSold || row.sold || row.quantity || 0),
          revenue: Number(row.revenue || row.totalRevenue || 0),
        }));

        const paymentMap = pickObject(paymentRaw, ["paymentMethodDistribution"]) || {};
        const paymentRows = Object.entries(paymentMap).map(([name, value]) => ({
          name,
          value: Number(value || 0),
        }));

        const topCustomerRows = pickArray(topCustomersRaw?.topCustomers || topCustomersRaw).map((row, index) => ({
          customerId: row.customerId || row.userId || index + 1,
          customerName: row.customerName || row.userName || `Khach ${index + 1}`,
          totalOrders: Number(row.totalOrders || row.orderCount || 0),
          totalRevenue: Number(row.totalRevenue || row.revenue || 0),
        }));

        const totalRevenue =
          pickNumber(overview, ["totalRevenue", "revenue"]) ||
          revenueRows.reduce((sum, item) => sum + item.revenue, 0);
        const totalOrders = pickNumber(overview, ["totalOrders", "ordersCount", "orderCount"]);
        const totalUsers = pickNumber(overview, ["totalUsers", "userCount", "customers"]);
        const avgOrderValue =
          totalOrders > 0 ? totalRevenue / totalOrders : pickNumber(overview, ["avgOrderValue"], 0);
        const conversionRate = Number(conversionRaw?.conversionRate || 0);
        const successfulConversionRate = Number(conversionRaw?.successfulConversionRate || 0);

        setKpi({
          totalRevenue,
          totalOrders,
          totalUsers,
          avgOrderValue,
          conversionRate,
          successfulConversionRate,
        });
        setRevenueSeries(revenueRows);
        setTopProducts(topRows);
        setPaymentMethods(paymentRows);
        setTopCustomers(topCustomerRows);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [range.startDate, range.endDate]);

  const exportRevenueFile = async (format = "csv") => {
    try {
      const response = await downloadRevenueExport(format, range.startDate, range.endDate);
      const ext = format === "pdf" ? "pdf" : "csv";
      const blob = new Blob([response.data], {
        type: format === "pdf" ? "application/pdf" : "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `analytics-revenue-${range.startDate}-to-${range.endDate}.${ext}`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export revenue file error:", error);
    }
  };

  const topProductsChartData = useMemo(
    () => topProducts.slice(0, 10).map((item) => ({ ...item, shortName: item.name.slice(0, 24) })),
    [topProducts]
  );

  return (
    <div className="space-y-6 animate-pageIn min-h-screen p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[var(--color-bg)] p-6 rounded-2xl shadow-sm border border-[var(--color-border)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary-)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-primary-)] to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-[var(--color-primary-)]/50 dark:shadow-[var(--color-primary-)]/50">
            <FaChartLine size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text)] tracking-tight">Thống kê & Báo cáo</h1>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              Phân tích doanh thu và hành vi khách hàng
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 relative z-10 w-full md:w-auto">
          <div className="flex items-center bg-[var(--color-bg-subtle)] rounded-xl border border-[var(--color-border)] p-1 w-full md:w-auto">
            {[7, 30, 90].map((value) => (
              <button
                key={value}
                onClick={() => setPreset(value)}
                className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                  preset === value
                    ? "bg-[var(--color-primary)] text-white shadow-md"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-subtle)]"
                }`}
              >
                {preset === value && <FaCalendarAlt size={12} />}
                {value} ngày
              </button>
            ))}
          </div>
          
          <button
            onClick={() => exportRevenueFile("csv")}
            disabled={loading}
            className="w-full md:w-auto flex items-center justify-center gap-2 btn-admin-outline px-4 py-2 rounded-xl font-medium"
          >
            <FaDownload />
            Xuất CSV
          </button>
          <button
            onClick={() => exportRevenueFile("pdf")}
            disabled={loading}
            className="w-full md:w-auto flex items-center justify-center gap-2 btn-admin-outline px-4 py-2 rounded-xl font-medium"
          >
            <FaDownload />
            Xuất PDF
          </button>
        </div>
      </div>

      {loading ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <div key={i} className="admin-skeleton h-32 rounded-2xl" />)}
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 admin-skeleton h-[400px] rounded-2xl" />
            <div className="admin-skeleton h-[400px] rounded-2xl" />
          </div>
          <div className="admin-skeleton h-[400px] rounded-2xl" />
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            <KpiCard
              label="Tổng Doanh thu"
              value={formatVndCompact(kpi.totalRevenue)}
              subValue={formatVnd(kpi.totalRevenue)}
              gradient="from-[var(--color-primary-)] to-indigo-600"
              icon={<FaMoneyBillWave size={20} className="text-white" />}
              trend="+12.5%"
              trendUp
            />
            <KpiCard
              label="Tổng Đơn hàng"
              value={new Intl.NumberFormat("vi-VN").format(kpi.totalOrders)}
              gradient="from-[var(--color-primary-)] to-cyan-500"
              icon={<FaShoppingBag size={20} className="text-white" />}
              trend="+8.2%"
              trendUp
            />
            <KpiCard
              label="Conversion Rate"
              value={`${Number(kpi.conversionRate || 0).toFixed(2)}%`}
              subValue={`Success: ${Number(kpi.successfulConversionRate || 0).toFixed(2)}%`}
              gradient="from-emerald-500 to-teal-500"
              icon={<FaUsers size={20} className="text-white" />}
            />
            <KpiCard
              label="Giá trị đơn trung bình"
              value={formatVnd(kpi.avgOrderValue)}
              gradient="from-amber-500 to-orange-500"
              icon={<FaChartLine size={20} className="text-white" />}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <ChartCard title="Biểu đồ doanh thu" subtitle={`${preset} ngày gần nhất`} className="xl:col-span-2">
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={revenueSeries} margin={{ top: 20, right: 20, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis 
                    dataKey="label" 
                    stroke="var(--color-text-muted)" 
                    tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis 
                    tickFormatter={formatVndCompact} 
                    stroke="var(--color-text-muted)" 
                    tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    dx={-10}
                  />
                  <Tooltip content={<CustomTooltip formatter={(v) => formatVnd(v)} />} />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    name="Doanh thu"
                    stroke="#8b5cf6" 
                    strokeWidth={3} 
                    dot={{ r: 4, strokeWidth: 2, fill: "var(--color-bg)" }} 
                    activeDot={{ r: 6, strokeWidth: 0, fill: "#8b5cf6" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Phương thức thanh toán" subtitle="Tỷ trọng giao dịch">
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie 
                    data={paymentMethods} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={2}
                  >
                    {paymentMethods.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} stroke="var(--color-bg)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {paymentMethods.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-secondary)]">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                    {entry.name}
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>

          <ChartCard title="Top sản phẩm bán chạy" subtitle="Số lượng đã bán">
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={topProductsChartData} margin={{ top: 20, right: 20, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis 
                  dataKey="shortName" 
                  interval={0} 
                  angle={-25} 
                  textAnchor="end" 
                  height={80}
                  stroke="var(--color-text-muted)" 
                  tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="var(--color-text-muted)" 
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-primary-subtle)', opacity: 0.4 }} />
                <Bar 
                  dataKey="sold" 
                  name="Số lượng bán" 
                  fill="#8b5cf6" 
                  radius={[4, 4, 0, 0]} 
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Top khách hàng" subtitle="Xếp hạng theo doanh thu">
            {topCustomers.length === 0 ? (
              <p className="text-sm text-[var(--color-text-muted)]">Chưa có dữ liệu.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
                      <th className="px-3 py-2">Khách hàng</th>
                      <th className="px-3 py-2">Số đơn</th>
                      <th className="px-3 py-2 text-right">Doanh thu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topCustomers.map((customer) => (
                      <tr key={customer.customerId} className="border-b border-[var(--color-border)]/60">
                        <td className="px-3 py-2 text-[var(--color-text)]">{customer.customerName}</td>
                        <td className="px-3 py-2 text-[var(--color-text)]">{customer.totalOrders}</td>
                        <td className="px-3 py-2 text-right font-semibold text-[var(--color-text)]">
                          {formatVnd(customer.totalRevenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </ChartCard>
        </>
      )}
    </div>
  );
}

const KpiCard = React.memo(function KpiCard({ label, value, subValue, icon, gradient = "from-[var(--color-primary-)] to-indigo-600", trend, trendUp }) {
  return (
    <div className="admin-card relative rounded-2xl overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
      <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${gradient}`} />
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-4">
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-2">{label}</p>
            <p className="text-3xl font-black text-[var(--color-text)] tracking-tight leading-none mb-1">{value}</p>
            {subValue && <p className="text-xs font-medium text-[var(--color-text-secondary)] mt-2 truncate bg-[var(--color-bg-subtle)] px-2 py-1 rounded-md inline-block border border-[var(--color-border)]">{subValue}</p>}
          </div>
          {icon && (
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg shrink-0 border-2 border-[var(--color-bg)]`}>
              {icon}
            </div>
          )}
        </div>
        {trend && (
          <div className={`flex items-center gap-1.5 mt-4 text-xs font-bold px-2.5 py-1 rounded-full w-fit ${
            trendUp ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
          }`}>
            <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d={trendUp ? "M7 17l10-10M17 7H7m10 0v10" : "M7 7l10 10M17 17H7m10 0V7"} />
            </svg>
            {trend} <span className="font-medium opacity-70">so với kỳ trước</span>
          </div>
        )}
      </div>
    </div>
  );
});

function ChartCard({ title, subtitle, children, className = "" }) {
  return (
    <div className={`admin-card rounded-2xl overflow-hidden flex flex-col ${className}`}>
      <div className="px-6 py-5 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-bg-subtle)]">
        <div>
          <h2 className="text-base font-bold text-[var(--color-text)] tracking-tight">{title}</h2>
          {subtitle && <p className="text-xs font-medium text-[var(--color-text-muted)] mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="p-6 flex-1 bg-[var(--color-bg)]">
        {children}
      </div>
    </div>
  );
}
