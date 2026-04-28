import React from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../../utils/redux/cartSlice";
import { useTranslation } from "react-i18next";
import notify from "../../utils/notify";

/**
 * QuickViewModal — Preview product details without leaving the page.
 * Shows image, name, price, description, and action buttons.
 */
export default function QuickViewModal({ product, isOpen, onClose }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  if (!product) return null;

  const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);

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
        <div className="md:w-1/2 bg-gray-50 rounded-xl flex items-center justify-center p-6">
          <img
            src={product.image || product.imageUrl}
            alt={product.productName || product.name}
            className="max-w-full max-h-72 object-contain"
          />
        </div>

        {/* Product Info */}
        <div className="md:w-1/2 flex flex-col">
          <h2 className="text-lg font-semibold text-gray-900 tracking-tight mb-2">
            {product.productName || product.name}
          </h2>

          {/* Category */}
          {product.categoryName && (
            <span className="text-xs text-gray-500 mb-3">
              {product.categoryName}
            </span>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-sm text-gray-400 line-through">
              {formatCurrency(price * 1.25)}
            </span>
            <span className="text-2xl font-bold text-violet-700">
              {formatCurrency(price)}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-4 mb-6 flex-1">
            {product.description || t("product.default_description")}
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="primary" className="flex-1" onClick={handleAddToCart}>
              {t("product.add_to_cart") || "Thêm vào giỏ"}
            </Button>
            <Button variant="outline" className="flex-1" onClick={handleViewDetails}>
              {t("product.view_details") || "Xem chi tiết"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
