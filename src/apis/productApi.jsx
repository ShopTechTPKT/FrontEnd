import axiosInstance from "../custom/axios";
import { getOrFetchWithCache } from "../utils/apiCache";

// Product API wrappers (JSX extension per request)
export async function getAllProducts() {
  return getOrFetchWithCache({
    key: "products:all",
    ttlMs: 60 * 1000,
    fetcher: async () => {
      const response = await axiosInstance.get("/products");
      const data = response?.data;

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.content)
        ? data.content
        : [];

      return { EC: 1, DT: list };
    },
  });
}

// Optimized home products API
export async function getHomeProducts() {
  return getOrFetchWithCache({
    key: "products:home",
    ttlMs: 60 * 1000,
    fetcher: async () => {
      const response = await axiosInstance.get("/products/home");
      return response.data;
    },
  });
}
export const getProductsByCategory = async categoryId => {
  try {
    const response = await axiosInstance.get(
      `/products/category/${categoryId}`
    );
    return response.data;
  } catch (error) {
    console.error("L?i khi l?y s?n ph?m theo category:", error);
    throw error;
  }
};

export const getProductById = async productId => {
  try {
    return getOrFetchWithCache({
      key: `products:detail:${productId}`,
      ttlMs: 2 * 60 * 1000,
      fetcher: async () => {
        const response = await axiosInstance.get(`/products/${productId}`);
        return response.data;
      },
    });
  } catch (error) {
    console.error("L?i khi l?y chi ti?t s?n ph?m:", error);
    throw error;
  }
};
// API l?c s?n ph?m
export const filterProducts = async filterRequest => {
  try {
    const response = await axiosInstance.post("/products/filter", filterRequest);
    return response.data;
  } catch (error) {
    console.error("L?i khi l?c s?n ph?m:", error);
    throw error;
  }
};

// API l?y các tùy ch?n l?c (categories, price ranges, status)
export const getFilterOptions = async () => {
  try {
    const response = await axiosInstance.get("/products/filter-options");
    return response.data;
  } catch (error) {
    console.error("L?i khi l?y filter options:", error);
    throw error;
  }
};

// API l?c theo category
export const filterByCategory = async categoryId => {
  try {
    const response = await axiosInstance.get(`/products/filter/category/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error("L?i khi l?c theo category:", error);
    throw error;
  }
};

// API l?c theo giá
export const filterByPrice = async (minPrice, maxPrice = null) => {
  try {
    const params = { min: minPrice };
    if (maxPrice) {
      params.max = maxPrice;
    }
    const response = await axiosInstance.get("/products/filter/price", { params });
    return response.data;
  } catch (error) {
    console.error("L?i khi l?c theo giá:", error);
    throw error;
  }
};

export const searchAdvancedProducts = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/products/search/advanced", { params });
    return response.data;
  } catch (error) {
    console.error("L?i khi tìm ki?m nâng cao:", error);
    throw error;
  }
};

export const getProductRecommendations = async (productId, limit = 8) => {
  try {
    const response = await axiosInstance.get("/products/recommendations", {
      params: { productId, limit },
    });
    return response.data;
  } catch (error) {
    console.error("L?i khi l?y g?i ý s?n ph?m:", error);
    throw error;
  }
};

export const getPopularProducts = async (limit = 8) => {
  try {
    const response = await axiosInstance.get("/products/recommendations/popular", {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    console.error("L?i khi l?y s?n ph?m ph? bi?n:", error);
    throw error;
  }
};

export const getProductPriceHistory = async (productId, days = 30) => {
  const response = await axiosInstance.get(`/products/${productId}/price-history`, {
    params: { days },
  });
  return Array.isArray(response.data) ? response.data : [];
};

export const createPriceAlert = async ({ userId, productId, targetPrice }) => {
  const response = await axiosInstance.post("/price-alerts", {
    userId,
    productId,
    targetPrice,
  });
  return response.data;
};

export const previewProductImport = async file => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await axiosInstance.post("/products/import/preview", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const importProductsFromCsv = async file => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await axiosInstance.post("/products/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export default {
  getAllProducts,
  getHomeProducts,
  getProductById,
  filterProducts,
  getFilterOptions,
  filterByCategory,
  filterByPrice,
  searchAdvancedProducts,
  getProductRecommendations,
  getPopularProducts,
  getProductPriceHistory,
  createPriceAlert,
  previewProductImport,
  importProductsFromCsv,
};
