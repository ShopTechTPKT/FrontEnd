import axiosInstance from "../custom/axios";

export const getLoyaltyBalance = async (userId) => {
  const response = await axiosInstance.get("/loyalty/balance", {
    params: { userId },
  });
  return response.data?.balance ?? 0;
};

export const getLoyaltyHistory = async (userId, page = 0, size = 20) => {
  const response = await axiosInstance.get("/loyalty/history", {
    params: { userId, page, size },
  });
  return Array.isArray(response.data) ? response.data : [];
};

export const redeemLoyaltyPoints = async ({ userId, points, orderId }) => {
  const response = await axiosInstance.post("/loyalty/redeem", {
    userId,
    points,
    orderId,
  });
  return response.data;
};

export const getLoyaltyTier = async (userId) => {
  const response = await axiosInstance.get(`/loyalty/tier/${userId}`);
  return response.data;
};
