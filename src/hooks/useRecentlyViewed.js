/**
 * useRecentlyViewed — Hook to track recently viewed products in localStorage.
 * Max 12 items, auto-deduplicates, most recent first.
 */

const STORAGE_KEY = "recently_viewed_products";
const MAX_ITEMS = 12;

export function useRecentlyViewed() {
  const getItems = () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  const addItem = (product) => {
    if (!product?.productID && !product?.id) return;
    const id = product.productID || product.id;
    const items = getItems().filter(
      (p) => (p.productID || p.id) !== id
    );
    const entry = {
      productID: id,
      productName: product.productName || product.name || "",
      price: product.price || product.unitPrice || 0,
      image: product.image || product.imageUrl || "",
      categoryName: product.categoryName || "",
      inStock: product.inStock ?? true,
      viewedAt: Date.now(),
    };
    items.unshift(entry);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(items.slice(0, MAX_ITEMS))
    );
  };

  const clearAll = () => {
    localStorage.removeItem(STORAGE_KEY);
  };

  return { getItems, addItem, clearAll };
}

export default useRecentlyViewed;
