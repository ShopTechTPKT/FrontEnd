import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { 
  fetchOverview, 
  fetchTopProducts, 
  fetchRevenueByDay, 
  fetchRevenueByMonth,
  fetchOrdersTrend 
} from "../../apis/adminStatsApi";

const PERIODS = [
  { label: "7 ngày", value: "7d" },
  { label: "30 ngày", value: "30d" },
  { label: "12 tháng", value: "12m" },
];

const formatVND = (value) => {
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return value;
};

export default function DashboardCharts() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState("30d");
  
  const [overview, setOverview] = useState({ totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 });
  const [revenueData, setRevenueData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [customerGrowth, setCustomerGrowth] = useState([]);

  useEffect(() => {
    fetchOverview().then(res => {
      if (res && res.data) {
        setOverview({
          totalRevenue: res.data.totalRevenue || 0,
          totalOrders: res.data.totalOrders || 0,
          avgOrderValue: res.data.totalOrders ? (res.data.totalRevenue / res.data.totalOrders) : 0
        });
      } else if (res && res.totalRevenue !== undefined) {
        setOverview({
          totalRevenue: res.totalRevenue || 0,
          totalOrders: res.totalOrders || 0,
          avgOrderValue: res.totalOrders ? (res.totalRevenue / res.totalOrders) : 0
        });
      }
    }).catch(console.error);

    fetchTopProducts(10).then(res => {
       if (res && res.data) {
         setTopProducts(res.data.map(p => ({
           name: p.productName || p.name,
           totalSold: p.totalSold || p.quantity,
           revenue: p.revenue || p.totalRevenue
         })));
       }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    const endDate = new Date();
    let startDate = new Date();
    
    if (period === "7d" || period === "30d") {
      if (period === "7d") {
        startDate.setDate(endDate.getDate() - 6);
      } else {
        startDate.setDate(endDate.getDate() - 29);
      }
      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];
      
      fetchRevenueByDay(startStr, endStr).then(res => {
        if (res && res.data) {
           const mapped = res.data.map(item => ({
             date: item.date,
             revenue: item.revenue || item.totalRevenue || 0,
             orders: item.ordersCount || item.orders || 0
           }));
           setRevenueData(mapped);
        }
      }).catch(console.error);
      
      fetchOrdersTrend(startStr, endStr).then(res => {
        if (res && res.data) {
          let cum = 0;
          const mapped = res.data.map(item => {
             cum += (item.ordersCount || item.orders || 0);
             return {
               month: item.date,
               totalCustomers: cum,
               newCustomers: item.ordersCount || item.orders || 0
             };
          });
          setCustomerGrowth(mapped);
        }
      }).catch(console.error);

    } else if (period === "12m") {
      const year = endDate.getFullYear();
      fetchRevenueByMonth(year, year).then(res => {
        if (res && res.data) {
           const mapped = res.data.map(item => ({
             date: `T${item.month}`,
             revenue: item.revenue || item.totalRevenue || 0,
             orders: item.ordersCount || item.orders || 0
           }));
           setRevenueData(mapped);
           
           let cum = 0;
           const growth = res.data.map(item => {
              cum += (item.ordersCount || item.orders || 0);
              return {
                 month: `T${item.month}`,
                 totalCustomers: cum,
                 newCustomers: item.ordersCount || item.orders || 0
              };
           });
           setCustomerGrowth(growth);
        }
      }).catch(console.error);
    }
  }, [period]);

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          label={t("dashboard.total_revenue") || "Tổng doanh thu"}
          value={formatVND(overview.totalRevenue)}
          suffix=" VND"
          color="indigo"
        />
        <SummaryCard
          label={t("dashboard.total_orders") || "Tổng đơn hàng"}
          value={overview.totalOrders}
          color="blue"
        />
        <SummaryCard
          label={t("dashboard.avg_order") || "Trung bình/đơn"}
          value={formatVND(overview.avgOrderValue)}
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
                ? "bg-[var(--color-primary-)] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Revenue Trend */}
      <ChartCard title={t("dashboard.revenue_trend") || "Xu hướng doanh thu"}>
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
        <ChartCard title={t("dashboard.top_products") || "Top sản phẩm bán chạy"}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tickFormatter={formatVND} tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => formatVND(v)} />
              <Bar dataKey="totalSold" name="Số lượng" fill="#7c3aed" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Customer Growth */}
        <ChartCard title={t("dashboard.customer_growth") || "Tăng trưởng đơn hàng"}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={customerGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="totalCustomers"
                name="Tổng đơn"
                stroke="#7c3aed"
                fill="#ede9fe"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="newCustomers"
                name="Đơn mới"
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

function SummaryCard({ label, value, suffix = "", color = "indigo" }) {
  const colors = {
    violet: "bg-[var(--color-primary-)] text-[var(--color-primary-)] border-[var(--color-primary-)]",
    blue: "bg-[var(--color-primary-)] text-[var(--color-primary-)] border-[var(--color-primary-)]",
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
