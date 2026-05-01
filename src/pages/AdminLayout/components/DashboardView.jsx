import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAdminStats } from "../hooks/useAdminStats";
import RevenueChart from "./charts/RevenueChart";
import TrendChart from "./charts/TrendChart";
import PieChartWithDetails from "./charts/PieChartWithDetails";
import GenericBarChart from "./charts/GenericBarChart";
import WeekdayRevenueChart from "./charts/WeekdayRevenueChart";
import MostFavoritedProductsChart from "./charts/MostFavoritedProductsChart";
import TopRatedProductsChart from "./charts/TopRatedProductsChart";
import GenericList from "./charts/GenericList";

export default function DashboardView({ darkMode }) {
  const { t } = useTranslation("translation");
  const { stats, loading, fetchAllStats } = useAdminStats();
  const [dateRange] = useState({ start: "2025-01-01", end: "2025-02-28" });

  useEffect(() => {
    fetchAllStats(dateRange);
  }, [fetchAllStats, dateRange]);

  if (loading) return (
    <div className="p-10 flex flex-col items-center justify-center gap-3">
      <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      <p className="text-sm text-gray-400">Đang tải dữ liệu...</p>
    </div>
  );

  const cardBg = "bg-white dark:bg-gray-800";
  const borderColor = "border-gray-200 dark:border-gray-700";

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title={t("admin.total_revenue")} value={stats.ordersStats?.totalRevenue || 0} unit="VNĐ" iconType="revenue" trend="+12%" darkMode={darkMode} />
        <StatCard title={t("admin.total_orders")} value={stats.ordersStats?.totalOrders || 0} unit="đơn" iconType="orders" trend="+8%" darkMode={darkMode} />
        <StatCard title={t("admin.total_customers")} value={stats.usersStats?.totalUsers || 0} unit="người" iconType="customers" trend="+5%" darkMode={darkMode} />
        <StatCard title={t("admin.total_products")} value={stats.productsStats?.totalProducts || 0} unit="SP" iconType="products" trend="+3%" darkMode={darkMode} />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${cardBg} p-6 rounded-xl border ${borderColor} shadow-sm h-[450px]`}>
          <RevenueChart data={stats.revenueByDay} darkMode={darkMode} title={t("admin.revenue_by_day")} />
        </div>
        <div className={`${cardBg} p-6 rounded-xl border ${borderColor} shadow-sm h-[450px]`}>
          <PieChartWithDetails data={stats.categorySales} darkMode={darkMode} title={t("admin.sales_by_category")} />
        </div>
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`${cardBg} p-6 rounded-xl border ${borderColor} shadow-sm h-[400px] lg:col-span-2`}>
          <TrendChart data={stats.ordersTrend} darkMode={darkMode} title={t("admin.orders_trend")} />
        </div>
        <div className={`${cardBg} p-6 rounded-xl border ${borderColor} shadow-sm h-[400px]`}>
          <WeekdayRevenueChart data={stats.weekdayRevenue} darkMode={darkMode} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${cardBg} p-6 rounded-xl border ${borderColor} shadow-sm h-[500px]`}>
           <GenericBarChart data={stats.abcInventory} darkMode={darkMode} title={t("admin.abc_inventory")} />
        </div>
        <div className={`${cardBg} p-6 rounded-xl border ${borderColor} shadow-sm h-[500px] overflow-hidden`}>
           <h3 className="text-lg font-bold mb-4">{t("admin.top_rated_products")}</h3>
           <TopRatedProductsChart data={stats.topRatedProducts} darkMode={darkMode} />
        </div>
      </div>
    </div>
  );
}

const STAT_ICONS = {
  revenue: {
    gradient: "from-violet-500 to-purple-600",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  orders: {
    gradient: "from-blue-500 to-cyan-500",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
  },
  customers: {
    gradient: "from-emerald-500 to-teal-500",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  products: {
    gradient: "from-amber-500 to-orange-500",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 7H4C2.9 7 2 7.9 2 9v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
  },
};

function StatCard({ title, value, unit, iconType, trend, darkMode }) {
  const meta = STAT_ICONS[iconType] || STAT_ICONS.products;
  return (
    <div className={`relative overflow-hidden ${
      darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
    } p-6 rounded-2xl border shadow-sm hover:shadow-md transition-shadow duration-200 group`}>
      {/* Decorative bg glow */}
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${meta.gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center shadow-sm`}>
          {meta.svg}
        </div>
        {trend && (
          <span className="flex items-center gap-0.5 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full">
            <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
            {trend}
          </span>
        )}
      </div>
      <h3 className={`text-xs font-semibold uppercase tracking-wide ${
        darkMode ? "text-gray-400" : "text-gray-500"
      } mb-1`}>{title}</h3>
      <p className={`text-2xl font-extrabold ${darkMode ? "text-white" : "text-gray-900"}`}>
        {typeof value === "number" ? value.toLocaleString("vi-VN") : value}
        <span className="text-sm font-normal text-gray-400 ml-1">{unit}</span>
      </p>
    </div>
  );
}
