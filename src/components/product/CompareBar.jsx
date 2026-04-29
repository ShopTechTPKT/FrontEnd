import { useCompare } from "../../context/CompareContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import formatCurrency from "../../utils/formatCurrency";

/**
 * CompareBar — Floating bottom bar showing selected comparison products.
 * Appears when at least 1 product is in comparison list.
 */
export default function CompareBar() {
  const { items, removeFromCompare, clearCompare } = useCompare();
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg transform transition-transform duration-300 dark:bg-gray-900/95 dark:border-gray-700">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Product thumbnails */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 shrink-0">
            {t("compare.title") || "So sánh"} ({items.length}/4)
          </span>
          <div className="flex gap-2">
            {items.map((product) => (
              <div
                key={product.productID}
                className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 dark:bg-gray-800 dark:border-gray-600"
              >
                <img
                  src={product.image}
                  alt=""
                  className="w-full h-full object-contain p-1"
                />
                <button
                  onClick={() => removeFromCompare(product.productID)}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={clearCompare}
            className="text-sm text-gray-400 hover:text-red-500 transition-colors"
          >
            {t("common.clear") || "Xóa hết"}
          </button>
          <button
            onClick={() => navigate("/compare")}
            disabled={items.length < 2}
            className="px-4 py-2 bg-violet-700 text-white text-sm font-medium rounded-lg hover:bg-violet-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("compare.compare_now") || "So sánh ngay"}
          </button>
        </div>
      </div>
    </div>
  );
}
