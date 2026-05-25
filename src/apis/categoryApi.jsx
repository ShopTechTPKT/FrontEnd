import axiosInstance from "../custom/axios";

export const fetchCategories = async () => {
  try {
    const response = await axiosInstance.get("/categories");
    const d = response?.data;
    if (Array.isArray(d)) return d;
    if (Array.isArray(d?.data)) return d.data;
    if (Array.isArray(d?.content)) return d.content;
    return [];
  } catch (e) {
    console.warn("fetchCategories:", e?.message || e);
    return [];
  }
};

export const searchCategoriesByName = async name => {
  try {
    const response = await axiosInstance.get(`/categories/search`, {
      params: { name },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tìm category theo tên:", error);
    throw error;
  }
};