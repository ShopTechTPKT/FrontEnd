import axiosInstance from "../custom/axios";

export const getUserAchievements = async (userId) => {
  const response = await axiosInstance.get(`/achievements/${userId}`);
  return Array.isArray(response.data) ? response.data : [];
};

export const checkAchievements = async (userId) => {
  const response = await axiosInstance.post("/achievements/check", { userId });
  return Array.isArray(response.data) ? response.data : [];
};
