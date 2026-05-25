import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  fetchSalesByCategory,
  fetchUsersStats,
  fetchProductsStats,
  fetchOrdersStats,
  fetchLowStockProducts,
  fetchTopProducts,
  fetchTopCustomers,
  fetchReviewsStats,
  fetchDiscountsStats,
  fetchAppointmentsStats,
  fetchChatsStats,
  fetchPaymentMethodDistribution,
  fetchOrdersTrend,
  fetchRevenueByDay,
  fetchRevenueByMonth,
  fetchRevenueByQuarter,
  fetchRevenueByYear,
  fetchTopCategories,
  fetchReturningCustomers,
  fetchRfm,
  fetchAbcInventory,
  fetchFrequentlyBoughtTogether,
  fetchRetentionRate,
  fetchCustomerLtv,
  fetchWeekdayRevenue,
  fetchProductRatingDistribution,
  fetchTopRatedProducts,
  fetchMostFavoritedProducts,
} from "../../../apis/adminStatsApi";

export const useAdminStats = () => {
  const { t } = useTranslation("translation");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Dashboard states
  const [stats, setStats] = useState({
    usersStats: null,
    productsStats: null,
    ordersStats: null,
    categorySales: [],
    topProducts: [],
    topCustomers: [],
    lowStockList: [],
    ordersTrend: [],
    revenueByDay: [],
    revenueByMonth: [],
    revenueByQuarter: [],
    revenueByYear: [],
    returningCustomers: [],
    rfm: [],
    abcInventory: [],
    frequentlyBought: [],
    retentionRate: [],
    customerLtv: [],
    weekdayRevenue: [],
    ratingDistribution: [],
    topRatedProducts: [],
    mostFavoritedProducts: [],
  });

  const toPairs = (obj) => {
    if (!obj || typeof obj !== "object") return [];
    return Object.entries(obj).map(([name, value]) => ({ name, value }));
  };

  const fetchAllStats = useCallback(async (dateRange, productIdForRating = 1) => {
    setLoading(true);
    setError(null);
    try {
      const [
        us, ps, os, rv, dc, ap, ch, cs, tp, tc, ls, pm, ot, rbd, rbm, rbq, rby, tcats,
        rcus, rfmData, abc, frq, rr, ltv, wdr, rating, topRated, mostFavorited
      ] = await Promise.all([
        fetchUsersStats(),
        fetchProductsStats(),
        fetchOrdersStats(),
        fetchReviewsStats(),
        fetchDiscountsStats(),
        fetchAppointmentsStats(),
        fetchChatsStats(),
        fetchSalesByCategory(),
        fetchTopProducts(10),
        fetchTopCustomers(10),
        fetchLowStockProducts(10, 10),
        fetchPaymentMethodDistribution(dateRange.start, dateRange.end),
        fetchOrdersTrend(dateRange.start, dateRange.end),
        fetchRevenueByDay(dateRange.start, dateRange.end),
        fetchRevenueByMonth(new Date(dateRange.start).getFullYear(), new Date(dateRange.end).getFullYear()),
        fetchRevenueByQuarter(new Date(dateRange.start).getFullYear(), new Date(dateRange.end).getFullYear()),
        fetchRevenueByYear(new Date(dateRange.start).getFullYear(), new Date(dateRange.end).getFullYear()),
        fetchTopCategories(5, dateRange.start, dateRange.end),
        fetchReturningCustomers(10),
        fetchRfm(dateRange.start, dateRange.end, 20),
        fetchAbcInventory(dateRange.start, dateRange.end),
        fetchFrequentlyBoughtTogether(productIdForRating, 10).catch(() => null),
        fetchRetentionRate(dateRange.start, dateRange.end).catch(() => null),
        fetchCustomerLtv(dateRange.start, dateRange.end).catch(() => null),
        fetchWeekdayRevenue(dateRange.start, dateRange.end).catch(() => null),
        fetchProductRatingDistribution(productIdForRating).catch(() => null),
        fetchTopRatedProducts(10).catch(() => null),
        fetchMostFavoritedProducts(10).catch(() => null),
      ]);

      const processedReturningCustomers = rcus?.returningCustomers?.map(item => ({
        customerId: item.userId,
        customerName: item.userName || `${t("admin.customer")} ${item.userId}`,
        name: item.userName || `${t("admin.customer")} ${item.userId}`,
        fullName: item.userName || `${t("admin.customer")} ${item.userId}`,
        totalOrders: item.orderCount,
        orders: item.orderCount,
        count: item.orderCount,
      })) || [];

      let rfmTransformed = [];
      if (rfmData?.rfmTop) {
        rfmTransformed = rfmData.rfmTop.map(item => ({
          userId: item.userId,
          name: item.userName || `User ${item.userId}`,
          value: item.r + item.f + item.m,
          r: item.r, f: item.f, m: item.m,
          segment: item.r >= 4 && item.f >= 4 && item.m >= 4 ? "Champions" : "Loyal"
        }));
      }

      setStats({
        usersStats: us,
        productsStats: ps,
        ordersStats: os,
        categorySales: cs?.categorySales ? toPairs(cs.categorySales) : (Array.isArray(cs) ? cs : []),
        topProducts: tp?.topProducts || (Array.isArray(tp) ? tp : []),
        topCustomers: (tc?.topCustomers || (Array.isArray(tc) ? tc : [])).sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0)),
        lowStockList: ls?.items || (Array.isArray(ls) ? ls : []),
        ordersTrend: ot?.ordersByDay ? toPairs(ot.ordersByDay) : (Array.isArray(ot) ? ot : []),
        revenueByDay: rbd?.revenueByDay ? toPairs(rbd.revenueByDay) : (Array.isArray(rbd) ? rbd : []),
        revenueByMonth: rbm?.revenueByMonth ? toPairs(rbm.revenueByMonth) : (Array.isArray(rbm) ? rbm : []),
        revenueByQuarter: rbq?.revenueByQuarter ? toPairs(rbq.revenueByQuarter) : (Array.isArray(rbq) ? rbq : []),
        revenueByYear: rby?.revenueByYear ? toPairs(rby.revenueByYear) : (Array.isArray(rby) ? rby : []),
        returningCustomers: processedReturningCustomers,
        rfm: rfmTransformed,
        abcInventory: abc?.abcGroups ? Object.entries(abc.abcGroups).map(([id, group]) => ({ name: `Product ${id}`, group, value: group === "A" ? 100 : 10 })) : [],
        frequentlyBought: frq?.frequentlyBoughtTogether ? toPairs(frq.frequentlyBoughtTogether) : [],
        retentionRate: rr,
        customerLtv: ltv,
        weekdayRevenue: wdr ? toPairs(wdr.weekdayRevenue || wdr) : [],
        ratingDistribution: rating,
        topRatedProducts: topRated,
        mostFavoritedProducts: mostFavorited,
      });

    } catch (err) {
      console.error("Error fetching admin stats:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [t]);

  return {
    stats,
    loading,
    error,
    fetchAllStats,
  };
};
