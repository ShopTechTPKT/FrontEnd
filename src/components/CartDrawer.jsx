import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { removeFromCart, updateQuantity } from "../utils/redux/cartSlice";
import formatCurrency from "../utils/formatCurrency";
import EmptyState from "./ui/EmptyState";

/**
 * CartDrawer — Full-height slide-in panel from right replacing dropdown cart.
 * Shows all cart items with quantity controls, subtotal, and checkout CTA.
 */
export default function CartDrawer({ isOpen, onClose }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const drawerRef = useRef(null);
  const cartItems = useSelector((state) => state.cart?.items || []);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.unitPrice || item.price || 0) * (item.quantity || 1),
    0
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            {t("cart.title") || "Gio hang"} ({cartItems.length})
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {cartItems.length === 0 ? (
            <EmptyState
              type="cart"
              size="sm"
              title={t("cart.empty") || "Giỏ hàng trống"}
              description="Thêm sản phẩm để bắt đầu thanh toán nhanh hơn."
              ctaLabel="Mua sắm ngay"
              ctaPath="/all_products"
              ctaAction={() => {
                onClose();
                navigate("/all_products");
              }}
            />
          ) : (
            cartItems.map((item) => (
              <div
                key={item.productID || item.id}
                className="flex gap-3 p-3 bg-gray-50 rounded-xl"
              >
                <img
                  src={item.imageUrl || item.image}
                  alt=""
                  className="w-16 h-16 object-contain bg-white rounded-lg border border-gray-100 p-1"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                    {item.name || item.productName}
                  </h4>
                  <p className="text-sm font-bold text-violet-700 mt-1">
                    {formatCurrency(item.unitPrice || item.price)}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() =>
                        dispatch(updateQuantity({ id: item.productID || item.id, quantity: Math.max(1, (item.quantity || 1) - 1) }))
                      }
                      className="w-6 h-6 flex items-center justify-center rounded bg-white border border-gray-200 text-gray-600 text-xs hover:border-violet-300"
                    >
                      -
                    </button>
                    <span className="text-sm font-medium w-6 text-center">{item.quantity || 1}</span>
                    <button
                      onClick={() =>
                        dispatch(updateQuantity({ id: item.productID || item.id, quantity: (item.quantity || 1) + 1 }))
                      }
                      className="w-6 h-6 flex items-center justify-center rounded bg-white border border-gray-200 text-gray-600 text-xs hover:border-violet-300"
                    >
                      +
                    </button>
                    <button
                      onClick={() => dispatch(removeFromCart(item.productID || item.id))}
                      className="ml-auto text-xs text-gray-400 hover:text-red-500 transition-colors"
                    >
                      {t("common.remove") || "Xoa"}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{t("cart.subtotal") || "Tam tinh"}</span>
              <span className="text-lg font-bold text-gray-900">{formatCurrency(subtotal)}</span>
            </div>
            <button
              onClick={() => { onClose(); navigate("/checkout"); }}
              className="w-full py-3 bg-violet-700 text-white font-semibold rounded-xl hover:bg-violet-800 transition-colors"
            >
              {t("cart.checkout") || "Thanh toan"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
