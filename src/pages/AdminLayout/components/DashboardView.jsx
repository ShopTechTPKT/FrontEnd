import React, { useEffect, useMemo, useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAdminStats } from "../hooks/useAdminStats";
import axiosInstance from "../../../custom/axios";
import { FaBoxOpen, FaShoppingCart, FaTicketAlt, FaChartLine, FaExclamationCircle } from "react-icons/fa";

const RevenueChart = lazy(() => import("./charts/RevenueChart"));
const TrendChart = lazy(() => import("./charts/TrendChart"));
const PieChartWithDetails = lazy(() => import("./charts/PieChartWithDetails"));
const GenericBarChart = lazy(() => import("./charts/GenericBarChart"));
const WeekdayRevenueChart = lazy(() => import("./charts/WeekdayRevenueChart"));
const TopRatedProductsChart = lazy(() => import("./charts/TopRatedProductsChart"));

const ChartFallback = () => <div className="w-full h-full admin-skeleton rounded-[var(--radius-lg)]" />;

export default function DashboardView({ darkMode }) {
  const { t } = useTranslation("translation");
  const navigate = useNavigate();
  const { stats, loading, fetchAllStats } = useAdminStats();

  // ── Date Range Picker (was hardcoded) ─────────────────────
  const getDefaultRange = () => {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 1);
    return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
  };
  const [dateRange, setDateRange] = useState(getDefaultRange);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [recentReviews, setRecentReviews] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  useEffect(() => {
    fetchAllStats(dateRange);
  }, [fetchAllStats, dateRange]);

  useEffect(() => {
    const fetchRealtimeWidgets = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const [reviewsRes, logsRes, ordersRes] = await Promise.allSettled([
          axiosInstance.get("/reviews"),
          axiosInstance.get("/audit-logs", { params: { page: 0, size: 8 } }),
          axiosInstance.get("/orders"),
        ]);
        const reviewsData = reviewsRes.status === "fulfilled" && Array.isArray(reviewsRes.value?.data) ? reviewsRes.value.data : [];
        const logsData = logsRes.status === "fulfilled" && Array.isArray(logsRes.value?.data?.content) ? logsRes.value.data.content : [];
        
        // Count pending orders
        const ordersList = ordersRes.status === "fulfilled" && Array.isArray(ordersRes.value?.data?.result) ? ordersRes.value.data.result : [];
        const pending = ordersList.filter(o => o.status === "PENDING" || o.status === "Chờ xác nhận").length;
        
        setRecentReviews(reviewsData.slice(0, 6));
        setActivityLogs(logsData.slice(0, 8));
        setPendingOrdersCount(pending);
      } catch {
        // Fallback handled by individual defaults
      }
    };

    fetchRealtimeWidgets();
    const timer = setInterval(fetchRealtimeWidgets, 60000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6 overflow-y-auto h-full animate-pageIn">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((k) => (
            <div key={k} className="admin-skeleton h-36 rounded-2xl border border-[var(--color-border)]" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="admin-skeleton h-[450px] rounded-[var(--radius-lg)] border border-[var(--color-border)]" />
          <div className="admin-skeleton h-[450px] rounded-[var(--radius-lg)] border border-[var(--color-border)]" />
        </div>
        <p className="text-sm text-[var(--color-text-muted)] text-center">{t("admin.ang_ti_d_liu")}</p>
      </div>
    );
  }

  const chartShell = "admin-card p-6 rounded-[var(--radius-lg)] h-full";

  return (
    <div className="p-4 lg:p-6 space-y-6 overflow-y-auto h-full animate-pageIn">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-[var(--radius-xl)] bg-gradient-to-r from-[var(--color-primary-)] to-indigo-800 text-white p-6 md:p-8 shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[var(--color-primary-)]/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Chào buổi sáng, Admin! 👋</h1>
            <p className="text-[var(--color-primary-)] text-sm md:text-base max-w-xl">
              Hôm nay bạn có <span className="font-bold text-white">{pendingOrdersCount} đơn hàng mới</span> cần xử lý và <span className="font-bold text-white">{stats.usersStats?.totalUsers || 0} khách hàng</span> đang hoạt động trên hệ thống.
            </p>
          </div>
          
          <div className="flex gap-3 flex-wrap items-center">
            <button 
              onClick={() => navigate("/admin/orders")}
              className="px-5 py-2.5 bg-white text-[var(--color-primary-)] rounded-lg font-semibold text-sm hover:bg-[var(--color-primary-)] transition-colors shadow-sm"
            >
              Xử lý đơn ngay
            </button>
            <button 
              onClick={() => navigate("/admin/analytics")}
              className="px-5 py-2.5 bg-[var(--color-primary-)]/50 text-white rounded-lg font-semibold text-sm hover:bg-[var(--color-primary-)]/70 border border-[var(--color-primary-)]/50 transition-colors backdrop-blur-sm"
            >
              Xem báo cáo
            </button>
            {/* Date Range Picker */}
            <div className="relative">
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="px-4 py-2.5 bg-white/10 text-white rounded-lg text-sm hover:bg-white/20 border border-white/20 transition-colors backdrop-blur-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                {dateRange.start} → {dateRange.end}
              </button>
              {showDatePicker && (
                <div className="absolute top-full mt-2 right-0 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl shadow-lg p-4 z-50 animate-fadeIn min-w-[280px]">
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-[var(--color-text-secondary)] block mb-1">Từ ngày</label>
                      <input type="date" value={dateRange.start} onChange={(e) => setDateRange(r => ({ ...r, start: e.target.value }))} className="admin-input text-sm py-1.5" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[var(--color-text-secondary)] block mb-1">Đến ngày</label>
                      <input type="date" value={dateRange.end} onChange={(e) => setDateRange(r => ({ ...r, end: e.target.value }))} className="admin-input text-sm py-1.5" />
                    </div>
                    <div className="flex gap-2 pt-1">
                      {[{ l: "7 ngày", d: 7 }, { l: "30 ngày", d: 30 }, { l: "90 ngày", d: 90 }].map(p => (
                        <button key={p.d} onClick={() => { const e = new Date(), s = new Date(); s.setDate(s.getDate() - p.d); setDateRange({ start: s.toISOString().slice(0,10), end: e.toISOString().slice(0,10) }); }} className="flex-1 text-xs py-1.5 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] text-[var(--color-text-secondary)] transition-colors">{p.l}</button>
                      ))}
                    </div>
                    <button onClick={() => setShowDatePicker(false)} className="w-full btn-admin-primary text-xs py-1.5">Áp dụng</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {/* Quick Actions Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button onClick={() => navigate("/admin/products/unified")} className="flex flex-col items-center justify-center p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] hover:bg-[var(--color-bg-subtle)] hover:border-[var(--color-primary-)] transition-all group">
              <div className="w-10 h-10 rounded-full bg-[var(--color-primary-)] text-[var(--color-primary-)] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <FaBoxOpen size={18} />
              </div>
              <span className="text-xs font-semibold text-[var(--color-text)]">Thêm Sản Phẩm</span>
            </button>
            <button onClick={() => navigate("/admin/orders")} className="flex flex-col items-center justify-center p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] hover:bg-[var(--color-bg-subtle)] hover:border-[var(--color-primary-)] transition-all group relative">
              <div className="w-10 h-10 rounded-full bg-[var(--color-primary-)] text-[var(--color-primary-)] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <FaShoppingCart size={18} />
              </div>
              <span className="text-xs font-semibold text-[var(--color-text)]">Đơn Hàng</span>
              {pendingOrdersCount > 0 && (
                <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </button>
            <button onClick={() => navigate("/admin/discounts")} className="flex flex-col items-center justify-center p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] hover:bg-[var(--color-bg-subtle)] hover:border-emerald-300 transition-all group">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <FaTicketAlt size={18} />
              </div>
              <span className="text-xs font-semibold text-[var(--color-text)]">Tạo Khuyến Mãi</span>
            </button>
            <button onClick={() => navigate("/admin/analytics")} className="flex flex-col items-center justify-center p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] hover:bg-[var(--color-bg-subtle)] hover:border-orange-300 transition-all group">
              <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <FaChartLine size={18} />
              </div>
              <span className="text-xs font-semibold text-[var(--color-text)]">Thống Kê</span>
            </button>
          </div>

          {/* Top Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard title={t("admin.total_revenue")} value={stats.ordersStats?.totalRevenue || 0} unit="VNĐ" iconType="revenue" trend={stats.ordersStats?.revenueTrend || null} />
            <StatCard title={t("admin.total_orders")} value={stats.ordersStats?.totalOrders || 0} unit="đơn" iconType="orders" trend={stats.ordersStats?.ordersTrend || null} />
            <StatCard title={t("admin.total_customers")} value={stats.usersStats?.totalUsers || 0} unit="người" iconType="customers" trend={stats.usersStats?.userTrend || null} />
            <StatCard title={t("admin.total_products")} value={stats.productsStats?.totalProducts || 0} unit="SP" iconType="products" trend={stats.productsStats?.productTrend || null} />
          </div>

          {/* Main Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${chartShell} h-[450px]`}>
              <Suspense fallback={<ChartFallback />}>
                <RevenueChart data={stats.revenueByDay} darkMode={darkMode} title={t("admin.revenue_by_day")} />
              </Suspense>
            </div>
            <div className={`${chartShell} h-[450px]`}>
              <Suspense fallback={<ChartFallback />}>
                <PieChartWithDetails data={stats.categorySales} title={t("admin.sales_by_category")} />
              </Suspense>
            </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          {/* Cần Xử Lý Widget */}
          <div className="admin-card p-5 rounded-[var(--radius-lg)] border-l-4 border-l-amber-500 bg-amber-50/50 dark:bg-amber-900/10">
            <h3 className="text-base font-bold mb-4 text-[var(--color-text)] flex items-center gap-2">
              <FaExclamationCircle className="text-amber-500" />
              Cần Xử Lý Ngay
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-[var(--color-bg)] p-3 rounded-lg border border-[var(--color-border)] shadow-sm cursor-pointer hover:border-amber-300 transition-colors" onClick={() => navigate("/admin/orders")}>
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text)]">Đơn hàng mới</p>
                  <p className="text-xs text-[var(--color-text-muted)]">Chờ xác nhận</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm">
                  {pendingOrdersCount}
                </div>
              </div>
              <div className="flex justify-between items-center bg-[var(--color-bg)] p-3 rounded-lg border border-[var(--color-border)] shadow-sm cursor-pointer hover:border-red-300 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text)]">Sắp hết hàng</p>
                  <p className="text-xs text-[var(--color-text-muted)]">Dưới 10 sản phẩm</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm">
                  {(stats.lowStockList || []).length}
                </div>
              </div>
            </div>
          </div>

          <div className="admin-card p-5 rounded-[var(--radius-lg)]">
            <h3 className="text-base font-bold mb-4 text-[var(--color-text)]">{t("admin.low_stock_alerts")}</h3>
            <div className="space-y-0 max-h-[300px] overflow-auto divide-y divide-[var(--color-border)]">
              {(stats.lowStockList || []).slice(0, 8).map((item, idx) => {
                const stockPercent = Math.min(100, Math.max(0, (item.quantity / 100) * 100)); // Demo progress
                return (
                <div key={`${item.id || idx}`} className="text-sm py-3 px-1 -mx-1 transition-colors hover:bg-[var(--color-bg-subtle)]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-medium truncate pr-2">{item.name || `Product #${item.productId || idx}`}</span>
                    <span className="font-bold text-red-500 tabular-nums shrink-0">{item.quantity ?? item.stock ?? 0}</span>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--color-bg-muted)] rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: `${Math.max(5, stockPercent)}%` }}></div>
                  </div>
                </div>
              )})}
              {(!stats.lowStockList || stats.lowStockList.length === 0) && (
                <div className="py-6 text-center text-[var(--color-text-muted)] text-sm">Không có sản phẩm sắp hết hàng.</div>
              )}
            </div>
          </div>

          <div className="admin-card p-5 rounded-[var(--radius-lg)]">
            <h3 className="text-base font-bold mb-4 text-[var(--color-text)] flex items-center justify-between">
              {t("admin.recent_reviews_section")}
              <span className="text-xs font-normal text-[var(--color-primary)] cursor-pointer hover:underline" onClick={() => navigate("/admin/reviews")}>Xem tất cả</span>
            </h3>
            <div className="space-y-0 max-h-[300px] overflow-auto divide-y divide-[var(--color-border)]">
              {recentReviews.map((item) => (
                <div key={item.id} className="text-sm py-3 flex gap-3 px-1 -mx-1 transition-colors hover:bg-[var(--color-bg-subtle)] cursor-pointer" onClick={() => navigate("/admin/reviews")}>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-primary-)] to-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {(item.userName || item.userId || "U").toString().slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-start mb-0.5">
                      <p className="font-semibold text-xs truncate">{item.userName || item.userId || "User"}</p>
                      <div className="flex text-amber-400 text-[10px]">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`w-3 h-3 ${i < (item.rating || 5) ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs opacity-80 line-clamp-2 text-[var(--color-text-secondary)]">{item.comment || item.content || "No content"}</p>
                  </div>
                </div>
              ))}
              {recentReviews.length === 0 && (
                <div className="py-6 text-center text-[var(--color-text-muted)] text-sm">Chưa có đánh giá mới.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`${chartShell} h-[400px] lg:col-span-2`}>
          <Suspense fallback={<ChartFallback />}>
            <TrendChart data={stats.ordersTrend} darkMode={darkMode} title={t("admin.orders_trend")} />
          </Suspense>
        </div>
        <div className={`${chartShell} h-[400px]`}>
          <Suspense fallback={<ChartFallback />}>
            <WeekdayRevenueChart data={stats.weekdayRevenue} />
          </Suspense>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${chartShell} h-[500px]`}>
          <Suspense fallback={<ChartFallback />}>
            <GenericBarChart data={stats.abcInventory} title={t("admin.abc_inventory")} />
          </Suspense>
        </div>
        <div className={`${chartShell} h-[500px] overflow-hidden`}>
           <h3 className="text-lg font-bold mb-4 text-[var(--color-text)]">{t("admin.top_rated_products")}</h3>
           <Suspense fallback={<ChartFallback />}>
             <TopRatedProductsChart data={stats.topRatedProducts} />
           </Suspense>
        </div>
      </div>

      <div className="admin-card p-6 rounded-[var(--radius-lg)]">
        <h3 className="text-lg font-bold mb-4 text-[var(--color-text)]">{t("admin.realtime_activity_feed")}</h3>
        <div className="space-y-0 max-h-60 overflow-auto divide-y divide-[var(--color-border)]">
          {activityLogs.map((log) => {
            const vi = activityFeedVariant(log);
            const accent = ACTIVITY_FEED_ACCENTS[vi];
            return (
              <div key={log.id} className="text-sm py-3 flex gap-3 rounded-xl px-1 -mx-1 transition-colors hover:bg-[var(--color-primary-subtle)]/70">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ring-1 ${accent.ring} ${accent.bg}`}>
                  <svg viewBox="0 0 24 24" className={`w-4 h-4 ${accent.fg}`} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d={accent.path} />
                  </svg>
                </div>
                <div className="min-w-0 flex-1 border-l border-[var(--color-border)] pl-3">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <p className="font-semibold text-[var(--color-text)]">{log.action || "ACTION"}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">5 phút trước</p>
                  </div>
                  <p className="text-[var(--color-text-secondary)] line-clamp-2">{log.description || log.resourceType || "System activity"}</p>
                </div>
              </div>
            );
          })}
          {activityLogs.length === 0 && (
            <div className="py-6 text-center text-[var(--color-text-muted)] text-sm">Chưa có hoạt động gần đây.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function activityFeedVariant(log) {
  const raw = `${log?.action ?? ""}${log?.resourceType ?? ""}${log?.id ?? ""}`;
  let h = 0;
  for (let i = 0; i < raw.length; i++) h = (Math.imul(31, h) + raw.charCodeAt(i)) | 0;
  return Math.abs(h) % 4;
}

const ACTIVITY_FEED_ACCENTS = [
  {
    bg: "bg-[var(--color-primary-)]/12",
    fg: "text-[var(--color-primary-)]",
    ring: "ring-[var(--color-primary-)]/25",
    path: "M13 10V3L4 14h7v7l9-11h-7z",
  },
  {
    bg: "bg-sky-500/12",
    fg: "text-sky-600",
    ring: "ring-sky-500/25",
    path: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z",
  },
  {
    bg: "bg-emerald-500/12",
    fg: "text-emerald-600",
    ring: "ring-emerald-500/25",
    path: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  },
  {
    bg: "bg-amber-500/12",
    fg: "text-amber-700",
    ring: "ring-amber-500/25",
    path: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
];

const STAT_ICONS = {
  revenue: {
    gradient: "from-[var(--color-primary-)] to-indigo-600",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  orders: {
    gradient: "from-[var(--color-primary-)] to-cyan-500",
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

function MiniSparkline({ seed }) {
  const d = useMemo(() => {
    let v = Number(seed) % 11;
    const pts = Array.from({ length: 14 }, (_, i) => {
      v = (v * 17 + i * 5 + (Number(seed) || 0)) % 12;
      return v;
    });
    const max = Math.max(...pts, 1);
    const w = 88;
    const h = 32;
    return pts
      .map((p, i) => {
        const x = pts.length === 1 ? 0 : (i / (pts.length - 1)) * w;
        const y = h - (p / max) * (h - 6) - 3;
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [seed]);

  return (
    <svg width={88} height={32} className="text-[var(--color-primary)] opacity-35" aria-hidden>
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function useAnimatedStatValue(target) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const to = typeof target === "number" && !Number.isNaN(target) ? target : 0;
    const duration = 580;
    const start = performance.now();
    let rafId;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - p) ** 3;
      setDisplay(Math.round(to * eased));
      if (p < 1) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [target]);
  return display;
}

const StatCard = React.memo(function StatCard({ title, value, unit, iconType, trend }) {
  const meta = STAT_ICONS[iconType] || STAT_ICONS.products;
  const numeric = typeof value === "number" ? value : 0;
  const animated = useAnimatedStatValue(numeric);
  return (
    <div className="admin-stat-card group backdrop-blur-[2px] border border-[var(--color-border)] bg-[var(--color-bg)] shadow-sm">
      <div className={`absolute -top-8 -right-8 w-36 h-36 rounded-full bg-gradient-to-br ${meta.gradient} opacity-[0.08] group-hover:opacity-[0.15] transition-opacity pointer-events-none`} />
      <div className="absolute bottom-3 right-3 pointer-events-none">
        <MiniSparkline seed={numeric} />
      </div>
      <div className="relative flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center shadow-md`}>
          {meta.svg}
        </div>
        {trend ? (
          <span className="relative z-[1] flex items-center gap-0.5 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full ring-1 ring-emerald-500/20">
            <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
            {trend}
          </span>
        ) : null}
      </div>
      <h3 className="relative z-[1] text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)] mb-1">{title}</h3>
      <p className="relative z-[1] text-2xl font-extrabold tabular-nums text-[var(--color-text)]">
        {animated.toLocaleString("vi-VN")}
        <span className="text-sm font-normal text-[var(--color-text-muted)] ml-1">{unit}</span>
      </p>
    </div>
  );
});
