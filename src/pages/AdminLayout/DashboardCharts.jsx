import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

/**
 * DashboardCharts — Admin analytics dashboard with revenue trends,
 * top products, and customer growth visualization using Recharts.
 */

const PERIODS = [
  { label: "7 ngay", value: "7d" },
  { label: "30 ngay", value: "30d" },
  { label: "12 thang", value: "12m" },
];

// Mock data for demo — replace with real API calls
const generateMockRevenue = (period) => {
  const count = period === "7d" ? 7 : period === "30d" ? 30 : 12;
  return Array.from({ length: count }, (_, i) => ({
    date: period === "12m" ? `T${i + 1}` : `${i + 1}`,
    revenue: Math.floor(Math.random() * 50000000) + 10000000,
    orders: Math.floor(Math.random() * 50) + 10,
  }));
};

const MOCK_TOP_PRODUCTS = [
  { name: "MacBook Pro M3", totalSold: 156, revenue: 7800000000 },
  { name: "iPhone 15 Pro", totalSold: 234, revenue: 6084000000 },
  { name: "iPad Air M2", totalSold: 98, revenue: 1960000000 },
  { name: "AirPods Pro", totalSold: 312, revenue: 1872000000 },
  { name: "Apple Watch S9", totalSold: 87, revenue: 1131000000 },
  { name: "Samsung Galaxy S24", totalSold: 145, revenue: 2900000000 },
  { name: "Dell XPS 15", totalSold: 67, revenue: 2680000000 },
  { name: "Sony WH-1000XM5", totalSold: 201, revenue: 1608000000 },
];

const MOCK_CUSTOMER_GROWTH = Array.from({ length: 12 }, (_, i) => ({
  month: `T${i + 1}`,
  newCustomers: Math.floor(Math.random() * 100) + 20,
  totalCustomers: 500 + i * 50 + Math.floor(Math.random() * 30),
}));

const formatVND = (value) => {
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return value;
};

export default function DashboardCharts() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState("30d");
  const [revenueData, setRevenueData] = useState([]);

  useEffect(() => {
    setRevenueData(generateMockRevenue(period));
  }, [period]);

  const totalRevenue = revenueData.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = revenueData.reduce((s, d) => s + d.orders, 0);
  const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          label={t("dashboard.total_revenue") || "Tong doanh thu"}
          value={formatVND(totalRevenue)}
          suffix=" VND"
          color="violet"
        />
        <SummaryCard
          label={t("dashboard.total_orders") || "Tong don hang"}
          value={totalOrders}
          color="blue"
        />
        <SummaryCard
          label={t("dashboard.avg_order") || "Trung binh/don"}
          value={formatVND(avgOrder)}
          suffix=" VND"
          color="emerald"
        />
      </div>

      {/* Period Selector */}
      <div className="flex items-center gap-2">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-colors ${
              period === p.value
                ? "bg-violet-700 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Revenue Trend */}
      <ChartCard title={t("dashboard.revenue_trend") || "Xu huong doanh thu"}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={formatVND} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v) => formatVND(v) + " VND"} />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              name="Doanh thu"
              stroke="#7c3aed"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <ChartCard title={t("dashboard.top_products") || "Top san pham ban chay"}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={MOCK_TOP_PRODUCTS} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tickFormatter={formatVND} tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => formatVND(v)} />
              <Bar dataKey="totalSold" name="So luong" fill="#7c3aed" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Customer Growth */}
        <ChartCard title={t("dashboard.customer_growth") || "Tang truong khach hang"}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={MOCK_CUSTOMER_GROWTH}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="totalCustomers"
                name="Tong KH"
                stroke="#7c3aed"
                fill="#ede9fe"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="newCustomers"
                name="KH moi"
                stroke="#06b6d4"
                fill="#cffafe"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, suffix = "", color = "violet" }) {
  const colors = {
    violet: "bg-violet-50 text-violet-700 border-violet-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  return (
    <div className={`rounded-2xl border p-5 ${colors[color]}`}>
      <p className="text-sm font-medium opacity-70">{label}</p>
      <p className="text-2xl font-bold mt-1">
        {value}
        {suffix && <span className="text-sm font-normal opacity-60">{suffix}</span>}
      </p>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5">
      <h3 className="text-base font-semibold text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  );
}
