import axiosInstance from "../custom/axios";

export const fetchShippingZones = () =>
  axiosInstance.get("/logistics/zones").then((r) => r.data);

export const createShippingZone = (payload) =>
  axiosInstance.post("/logistics/zones", payload).then((r) => r.data);

export const fetchTracking = (orderId) =>
  axiosInstance.get(`/logistics/tracking/${orderId}`).then((r) => r.data);

export const fetchShippingLabel = (orderId) =>
  axiosInstance.get(`/logistics/labels/${orderId}`).then((r) => r.data);
