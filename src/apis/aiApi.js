import axiosInstance from "../custom/axios";

export const fetchRevenueForecast = (months = 6) =>
  axiosInstance.get("/ai-analytics/revenue-forecast", { params: { months } }).then((r) => r.data);

export const fetchSentiment = () =>
  axiosInstance.get("/ai-analytics/sentiment").then((r) => r.data);

export const fetchPricingSuggestions = (limit = 5) =>
  axiosInstance.get("/ai-analytics/pricing-suggestions", { params: { limit } }).then((r) => r.data);

export const createPriceAlert = (payload) =>
  axiosInstance.post("/price-alerts", payload).then((r) => r.data);

export const fetchUserPriceAlerts = (userId) =>
  axiosInstance.get(`/price-alerts/user/${userId}`).then((r) => r.data);

export const fetchTrendingKeywords = () =>
  axiosInstance.get("/search/trending").then((r) => r.data);
