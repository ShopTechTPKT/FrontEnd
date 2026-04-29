import axiosInstance from "../custom/axios";

export const fetchCompareProducts = async (ids) => {
  if (!ids?.length) return [];
  const response = await axiosInstance.get("/products/compare", {
    params: { ids },
    paramsSerializer: {
      indexes: null,
    },
  });
  return Array.isArray(response.data) ? response.data : [];
};
