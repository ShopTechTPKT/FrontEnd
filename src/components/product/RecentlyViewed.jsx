import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import formatCurrency from "../../utils/formatCurrency";
import { useRecentlyViewed } from "../../hooks/useRecentlyViewed";
import LazyImage from "../ui/LazyImage";

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
          className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200 transition-colors"
        >
          {t("product.clear_recently_viewed") || "Xóa lịch sử"}
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
        {items.map((item) => {
          const id = item.productID || item.id;
          const name = item.productName || item.name;
          const image = item.image || item.imageUrl;
          const price = item.price ?? item.unitPrice ?? 0;
          return (
            <Link
              key={id}
              to={`/product/${id}/productAbout`}
              className="snap-start min-w-[170px] sm:min-w-[190px] max-w-[190px] border border-gray-200 rounded-xl p-3 bg-white hover:border-violet-300 hover:shadow-sm transition-all"
            >
              <div className="w-full h-28 bg-gray-50 rounded-lg flex items-center justify-center p-2">
                <LazyImage
                  src={image}
                  alt={name}
                  className="max-w-full max-h-full object-contain"
                  loadingClassName="w-full h-full"
                />
              </div>
              <p className="mt-2 text-xs text-gray-800 line-clamp-2 min-h-[2.4rem]">{name}</p>
              <p className="mt-1 text-sm font-semibold text-violet-700">{formatCurrency(price)}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
