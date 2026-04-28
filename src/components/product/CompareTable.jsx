import { useCompare } from "../../context/CompareContext";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import formatCurrency from "../../utils/formatCurrency";

/**
 * CompareTable — Side-by-side product comparison page.
 * Displays products in columns with attribute rows.
 */
export default function CompareTable() {
  const { items, removeFromCompare, clearCompare } = useCompare();
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (items.length < 2) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {t("compare.title") || "So sánh sản phẩm"}
        </h1>
        <p className="text-gray-500 mb-8">
          {t("compare.need_at_least_2") || "Cần ít nhất 2 sản phẩm để so sánh"}
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2 bg-violet-700 text-white rounded-lg hover:bg-violet-800 transition-colors"
        >
          {t("common.continue_shopping") || "Tiếp tục mua sắm"}
        </button>
      </div>
    );
  }

  const rows = [
    { label: t("product.category") || "Danh mục", key: "categoryName" },
    {
      label: t("product.price") || "Giá",
      key: "price",
      render: (val) => (
        <span className="text-lg font-bold text-violet-700">
          {formatCurrency(val)}
        </span>
      ),
      highlight: true,
    },
    { label: t("product.description") || "Mô tả", key: "description" },
  ];

  // Find lowest price for highlighting
  const lowestPrice = Math.min(...items.map((p) => p.price || 0));

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          {t("compare.title") || "So sánh sản phẩm"}
        </h1>
        <button
          onClick={() => { clearCompare(); navigate("/"); }}
          className="text-sm text-gray-400 hover:text-red-500 transition-colors"
        >
          {t("compare.clear_all") || "Xóa tất cả"}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <table className="w-full">
          <thead>
            <tr>
              <th className="w-40 p-4 text-left text-sm font-semibold text-gray-500 border-b border-gray-100" />
              {items.map((product) => (
                <th
                  key={product.productID}
                  className="p-4 text-center border-b border-gray-100 border-l"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-24 h-24 bg-gray-50 rounded-xl p-2">
                      <img
                        src={product.image}
                        alt={product.productName}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                      {product.productName}
                    </h3>
                    <button
                      onClick={() => removeFromCompare(product.productID)}
                      className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                    >
                      {t("common.remove") || "Xóa"}
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-b border-gray-50 last:border-0">
                <td className="p-4 text-sm font-medium text-gray-500">
                  {row.label}
                </td>
                {items.map((product) => {
                  const val = product[row.key];
                  const isBest = row.highlight && val === lowestPrice;
                  return (
                    <td
                      key={product.productID}
                      className={`p-4 text-center text-sm border-l border-gray-50 ${
                        isBest ? "bg-violet-50" : ""
                      }`}
                    >
                      {row.render
                        ? row.render(val)
                        : (
                          <span className="text-gray-700 line-clamp-3">
                            {val || "-"}
                          </span>
                        )}
                      {isBest && (
                        <span className="block text-xs text-violet-600 font-medium mt-1">
                          {t("compare.best_price") || "Giá tốt nhất"}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
