import { createContext, useContext, useState, useEffect } from "react";

const CompareContext = createContext();
const MAX_COMPARE = 4;
const STORAGE_KEY = "compare_products";

/**
 * CompareProvider — Manages product comparison list (max 3 items).
 * Persists in localStorage.
 */
export function CompareProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCompare = (product) => {
    const id = product.productID || product.id;
    if (items.find((p) => (p.productID || p.id) === id)) return false;
    if (items.length >= MAX_COMPARE) return false;
    setItems((prev) => [
      ...prev,
      {
        productID: id,
        productName: product.productName || product.name || "",
        price: product.price || product.unitPrice || 0,
        image: product.image || product.imageUrl || "",
        categoryName: product.categoryName || "",
        description: product.description || "",
      },
    ]);
    return true;
  };

  const removeFromCompare = (id) => {
    setItems((prev) => prev.filter((p) => (p.productID || p.id) !== id));
  };

  const clearCompare = () => setItems([]);

  const isInCompare = (id) =>
    items.some((p) => (p.productID || p.id) === id);

  return (
    <CompareContext.Provider
      value={{ items, addToCompare, removeFromCompare, clearCompare, isInCompare }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
}

export default CompareContext;
