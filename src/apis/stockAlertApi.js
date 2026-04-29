import axiosInstance from "../custom/axios";

export const subscribeStockAlert = async ({ userId, productId }) => {
  const response = await axiosInstance.post("/stock-alerts", {
    userId,
    productId,
  });
  return response.data;
};

export const getStockAlertWaitingCount = async (productId) => {
  const response = await axiosInstance.get(`/stock-alerts/count/${productId}`);
  return Number(response.data?.count ?? 0);
};
