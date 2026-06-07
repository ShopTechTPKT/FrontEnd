import React from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../../utils/redux/cartSlice";
import { useTranslation } from "react-i18next";
import notify from "../../utils/notify";
import formatCurrency from "../../utils/formatCurrency";

/**
 * QuickViewModal — Preview product details without leaving the page.
 * Shows image, name, price, description, and action buttons.
 */
export default function QuickViewModal({ product, isOpen, onClose }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  if (!product) return null;



  const getCurrentUserId = () => {
    try {
      const saved = localStorage.getItem("user");
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      return parsed?.customerID ?? parsed?.id ?? null;
    } catch {
      return null;
    }
  };

  const handleAddToCart = () => {
    const userId = getCurrentUserId();
    dispatch(
      addToCart({
        userId,
        productId: product.productID || product.id,
        quantity: 1,
        productData: {
          id: product.productID || product.id,
          name: product.productName || product.name,
          unitPrice: product.price || product.unitPrice || 0,
          imageUrl: product.image || product.imageUrl || "",
        },
      })
    );
    notify.success(t("cart.added_to_cart") || "Đã thêm vào giỏ hàng!");
    onClose();
  };

  const handleViewDetails = () => {
    navigate(`/products/${product.productID || product.id}`);
    onClose();
  };

  const price = product.price || product.unitPrice || 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("product.quick_view") || "Xem nhanh"} size="lg">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Product Image */}
        <div className="md:w-1/2 relative bg-gray-50 rounded-2xl flex items-center justify-center p-6 border border-gray-100 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <img
            src={product.image || product.imageUrl}
            alt={product.productName || product.name}
            className="max-w-full max-h-64 object-contain group-hover:scale-[1.04] transition-transform duration-500"
          />
          {/* Discount badge */}
          {product.percentage > 0 && (
            <div className="absolute top-3 left-3 bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-lg shadow-sm">
              -{product.percentage}%
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="md:w-1/2 flex flex-col">
          {/* Category pill */}
          {product.categoryName && (
            <span className="inline-flex w-fit items-center px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-[11px] font-semibold text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-900 dark:text-indigo-400 mb-2">
              {product.categoryName}
            </span>
          )}

          <h2 className="text-lg font-bold text-gray-900 tracking-tight mb-3 leading-snug">
            {product.productName || product.name}
          </h2>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <svg key={i} viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-yellow-400">
                  <path d="M10 2.8l2.2 4.4 4.9.7-3.5 3.4.8 4.8L10 14.7 5.6 16l.8-4.8L2.9 7.9l4.9-.7L10 2.8Z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-gray-400">(4.8)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-2xl font-bold text-indigo-600">
              {formatCurrency(price)}
            </span>
            <span className="text-sm text-gray-400 line-through">
              {formatCurrency(price * 1.25)}
            </span>
            <span className="text-xs font-semibold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-md">-20%</span>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 mb-5 flex-1">
            {product.description || t("product.default_description")}
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-semibold shadow-sm hover:bg-indigo-600 active:scale-[0.97] transition-all"
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {t("product.add_to_cart") || "Them vao gio"}
            </button>
            <button
              onClick={handleViewDetails}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900 active:scale-[0.97] transition-all"
            >
              {t("product.view_details") || "Xem chi tiet"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
