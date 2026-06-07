import { useState } from "react";

const API_URL = "http://localhost:8080/api";

export const CATEGORY_IDS = {
  laptop: [45, 46, 47, 48, 49, 50, 51],
  mouse: [6, 7, 8, 9, 10],
  keyboard: [1, 2, 3, 4, 5],
  phone: [52, 53, 54],
  computers: [36, 37, 38, 39],
  tablet: [44],
  gamingGear: [14, 15, 16],
  processors: [18, 19],
  ram: [30, 31, 32],
  storage: [27, 28, 29],
  case: [17],
  mainboard: [20, 21, 22],
  psu: [23, 24, 25, 26],
  pc: [40, 41],
  headphone: [42, 43],
  mousepad: [11, 12, 13],
};

export const useProductCRUD = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const notify = (type, message) => {
    window.dispatchEvent(
      new CustomEvent("app:notify", {
        detail: {
          type,
          message,
          duration: 5000,
          position: "top-right",
        },
      })
    );
  };

  const performOperation = async (operation, category, productData, productId) => {
    const validCategoryIds = CATEGORY_IDS[category];
    if (!validCategoryIds && operation !== "delete" && category !== "all") {
       // Allow delete without strict category check if needed, but usually category is provided
    }

    if ((operation === "create" || operation === "update") && productData?.categoryID) {
      if (validCategoryIds && !validCategoryIds.includes(productData.categoryID)) {
        const errorMsg = `categoryID ${productData.categoryID} is not valid for ${category}`;
        notify("warning", errorMsg);
        throw new Error(errorMsg);
      }
    }

    setLoading(true);
    setError(null);

    try {
      let response;
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      };

      if (operation === "create") {
        response = await fetch(`${API_URL}/products`, {
          method: "POST",
          headers,
          body: JSON.stringify(productData),
        });
      } else if (operation === "update") {
        response = await fetch(`${API_URL}/products/${productId}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(productData),
        });
      } else if (operation === "delete") {
        response = await fetch(`${API_URL}/products/${productId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
        });
      }

      const responseText = await response.text();
      if (!response.ok) {
        let errorMessage = `Failed to ${operation} product`;
        try {
          const errorData = JSON.parse(responseText);
          if (errorData.result && typeof errorData.result === "object") {
            Object.entries(errorData.result).forEach(([field, msg]) => {
              notify("warning", `${field}: ${msg}`);
            });
            errorMessage = errorData.message || "Validation error";
          } else if (errorData.message) {
            errorMessage = errorData.message;
            notify("error", errorMessage);
          }
        } catch (e) {
          errorMessage = responseText || errorMessage;
          notify("error", errorMessage);
        }
        throw new Error(errorMessage);
      }

      const result = responseText ? JSON.parse(responseText) : true;
      notify("success", `Sản phẩm đã được ${operation === "create" ? "tạo" : operation === "update" ? "cập nhật" : "xóa"} thành công!`);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getProductById = async (productId) => {
    try {
      const response = await fetch(`${API_URL}/products/${productId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      });
      if (!response.ok) throw new Error("Failed to get product");
      return await response.json();
    } catch (err) {
      notify("error", "Không thể lấy thông tin sản phẩm");
      throw err;
    }
  };

  return {
    performOperation,
    getProductById,
    loading,
    error,
  };
};
