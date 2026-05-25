import axiosInstance from "../custom/axios";

export const createQuoteRequest = async (payload) => {
  const response = await axiosInstance.post("/quotes", payload);
  return response.data;
};

export const getUserQuoteRequests = async (userId) => {
  const response = await axiosInstance.get(`/quotes/user/${userId}`);
  return Array.isArray(response.data) ? response.data : [];
};
