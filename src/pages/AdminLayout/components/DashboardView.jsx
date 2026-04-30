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

  if (loading) return <div className="p-10 text-center">Loading dashboard...</div>;

  const cardBg = "bg-white dark:bg-gray-800";
  const borderColor = "border-gray-200 dark:border-gray-700";

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title={t("admin.total_revenue")} value={stats.ordersStats?.totalRevenue || 0} unit="VNĐ" icon="💰" darkMode={darkMode} />
        <StatCard title={t("admin.total_orders")} value={stats.ordersStats?.totalOrders || 0} unit="" icon="📦" darkMode={darkMode} />
        <StatCard title={t("admin.total_customers")} value={stats.usersStats?.totalUsers || 0} unit="" icon="👥" darkMode={darkMode} />
        <StatCard title={t("admin.total_products")} value={stats.productsStats?.totalProducts || 0} unit="" icon="🛒" darkMode={darkMode} />
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

function StatCard({ title, value, unit, icon, darkMode }) {
  return (
    <div className={`${darkMode ? "bg-gray-800" : "bg-white"} p-6 rounded-xl border ${darkMode ? "border-gray-700" : "border-gray-200"} shadow-sm`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-2xl">{icon}</span>
        <span className="text-xs font-medium text-green-500 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">+12%</span>
      </div>
      <h3 className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"} mb-1`}>{title}</h3>
      <p className="text-2xl font-bold">
        {typeof value === "number" ? value.toLocaleString() : value} <span className="text-sm font-normal text-gray-500">{unit}</span>
      </p>
    </div>
  );
}
