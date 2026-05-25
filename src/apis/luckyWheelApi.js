import axiosInstance from "../custom/axios";

export const getLuckyWheelPrizes = async () => {
  const response = await axiosInstance.get("/lucky-wheel/prizes");
  return Array.isArray(response.data) ? response.data : [];
};

export const spinLuckyWheel = async ({ userId, usePoints = false }) => {
  const response = await axiosInstance.post("/lucky-wheel/spin", { userId, usePoints });
  return response.data;
};
