import axiosInstance from "../custom/axios";

export const generateReferralCode = async (userId) => {
  const response = await axiosInstance.post("/referrals/generate", { userId });
  return response.data;
};

export const applyReferralCode = async ({ userId, code }) => {
  const response = await axiosInstance.post("/referrals/apply", { userId, code });
  return response.data;
};

export const getReferralStats = async (userId) => {
  const response = await axiosInstance.get(`/referrals/${userId}`);
  return response.data;
};

export const getAllReferralsForAdmin = async () => {
  const response = await axiosInstance.get("/referrals/admin/all");
  return Array.isArray(response.data) ? response.data : [];
};
