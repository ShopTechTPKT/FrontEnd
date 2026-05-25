import axiosInstance from "../custom/axios";

export const submitDailyCheckIn = async (userId) => {
  const response = await axiosInstance.post("/checkin", { userId });
  return response.data;
};

export const getDailyCheckInStreak = async (userId) => {
  const response = await axiosInstance.get(`/checkin/streak/${userId}`);
  return response.data;
};
