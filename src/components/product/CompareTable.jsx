import { useCompare } from "../../context/CompareContext";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { addToCart } from "../../utils/redux/cartSlice";
import formatCurrency from "../../utils/formatCurrency";
import { fetchCompareProducts } from "../../apis/compareApi";
import notify from "../../utils/notify";

/**
 * CompareTable — Side-by-side product comparison page.
 * Displays products in columns with attribute rows.
 */
export default function CompareTable() {
  const { items, removeFromCompare, clearCompare } = useCompare();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [serverItems, setServerItems] = useState([]);

  const ids = useMemo(() => items.map((i) => i.productID || i.id).filter(Boolean), [items]);

  useEffect(() => {
    if (ids.length < 2) {
      setServerItems([]);
      return;
    }
    fetchCompareProducts(ids)
      .then((data) => setServerItems(data))
      .catch(() => setServerItems([]));
  }, [ids]);

  const mergedItems = useMemo(() => {
    if (!serverItems.length) return items;
    const byId = new Map(serverItems.map((s) => [s.id, s]));
    return items.map((item) => {
      const id = item.productID || item.id;
      const server = byId.get(id);
      if (!server) return item;
      return {
        ...item,
        productID: server.id,
        productName: server.name,
        image: server.imageUrl || item.image,
        price: server.price,
        categoryName: server.categoryName || item.categoryName,
        description: server.description || item.description,
        quantity: server.quantity,
      };
    });
  }, [items, serverItems]);

  if (mergedItems.length < 2) {
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

  const hasDifference = (rowKey) => {
    const values = mergedItems.map((p) => String(p[rowKey] ?? "").trim().toLowerCase());
    return new Set(values).size > 1;
  };

  // Find lowest price for highlighting
  const lowestPrice = Math.min(...mergedItems.map((p) => p.price || 0));

  const handleAddToCart = async (product) => {
    try {
      await dispatch(
        addToCart({
          userId: null,
          productId: product.productID || product.id,
          quantity: 1,
          productData: {
            id: product.productID || product.id,
            name: product.productName || product.name,
            unitPrice: product.price || 0,
            imageUrl: product.image || "",
          },
        })
      ).unwrap();
      notify.success("Đã thêm sản phẩm vào giỏ hàng.");
    } catch {
      notify.error("Không thể thêm sản phẩm vào giỏ hàng.");
    }
  };

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
        <div className="overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead>
            <tr>
              <th className="w-40 p-4 text-left text-sm font-semibold text-gray-500 border-b border-gray-100" />
              {mergedItems.map((product) => (
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
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-md bg-violet-700 text-white hover:bg-violet-800"
                    >
                      {t("product.add_to_cart")}
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.key}
                className={`border-b border-gray-50 last:border-0 ${hasDifference(row.key) ? "bg-amber-50/40" : ""}`}
              >
                <td className="p-4 text-sm font-medium text-gray-500">
                  {row.label}
                  {hasDifference(row.key) && (
                    <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-semibold">
                      {t("compare.different")}
                    </span>
                  )}
                </td>
                {mergedItems.map((product) => {
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
    </div>
  );
}
