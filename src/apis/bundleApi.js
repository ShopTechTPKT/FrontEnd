import axiosInstance from "../custom/axios";

export const getActiveBundles = async () => {
  const response = await axiosInstance.get("/bundles");
  return Array.isArray(response?.data) ? response.data : [];
};

export const getBundleById = async (bundleId) => {
  const response = await axiosInstance.get(`/bundles/${bundleId}`);
  return response?.data || null;
};

export default {
  getActiveBundles,
  getBundleById,
};
