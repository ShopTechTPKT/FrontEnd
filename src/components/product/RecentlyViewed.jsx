import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import ProductSlider from "./ProductSlider";
import { useRecentlyViewed } from "../../hooks/useRecentlyViewed";

/**
 * RecentlyViewed — Displays recently viewed products carousel.
 * Data sourced from localStorage. Hidden when empty.
 */
export default function RecentlyViewed() {
  const { t } = useTranslation();
  const { getItems, clearAll } = useRecentlyViewed();
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(getItems());
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="max-w-screen-xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
          {t("product.recently_viewed") || "Sản phẩm đã xem gần đây"}
        </h2>
        <button
          onClick={() => {
            clearAll();
            setItems([]);
          }}
          className="text-sm text-gray-400 hover:text-red-500 transition-colors"
        >
          {t("common.clear") || "Xóa lịch sử"}
        </button>
      </div>
      <ProductSlider products={items} visibleCount={5} />
    </section>
  );
}
