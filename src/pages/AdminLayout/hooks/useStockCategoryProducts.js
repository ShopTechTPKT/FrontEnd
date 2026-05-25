import { useState, useEffect, useCallback } from "react";
import { useProductCRUD, CATEGORY_IDS } from "./useProductCRUD";

const API_URL = "http://localhost:8081/api";

/**
 * Load products for a stock hardware category (RAM, storage, …).
 * When `skip` is true, skips fetch (parent supplies `items`); CRUD helpers still call the API.
 *
 * @param {keyof typeof CATEGORY_IDS} categoryKey
 * @param {{ skip?: boolean }} options
 */
export function useStockCategoryProducts(categoryKey, options = {}) {
  const { skip = false } = options;
  const { performOperation } = useProductCRUD();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(() => !skip);

  const fetchItems = useCallback(async () => {
    if (skip) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/products`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        const ids = CATEGORY_IDS[categoryKey];
        if (!ids) {
          setItems([]);
          return;
        }
        setItems(data.filter((p) => ids.includes(p.categoryId)));
      }
    } catch {
      /* keep list as-is */
    } finally {
      setLoading(false);
    }
  }, [categoryKey, skip]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const createProduct = async (productData) => {
    const result = await performOperation("create", categoryKey, productData);
    await fetchItems();
    return result;
  };

  const updateProduct = async (productId, productData) => {
    const result = await performOperation(
      "update",
      categoryKey,
      productData,
      productId
    );
    await fetchItems();
    return result;
  };

  return { items, loading, refetch: fetchItems, createProduct, updateProduct };
}
