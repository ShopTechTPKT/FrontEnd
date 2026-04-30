import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { removeFromCart, updateCartItemQuantity } from "../utils/redux/cartSlice";
import { selectCartItems, selectCartSubtotal } from "../utils/redux/selectors";
import formatCurrency from "../utils/formatCurrency";
import EmptyState from "./ui/EmptyState";
import Button from "./ui/Button";

/**
 * CartDrawer — Full-height slide-in panel from right replacing dropdown cart.
 * Shows all cart items with quantity controls, subtotal, and checkout CTA.
 */
export default function CartDrawer({ isOpen, onClose }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const drawerRef = useRef(null);
  const qtyTimersRef = useRef({});
  const cartItems = useSelector(selectCartItems);
  const [optimisticQty, setOptimisticQty] = useState({});

  const getCurrentUserId = () => {
    try {
      const savedUser = localStorage.getItem("user");
      if (!savedUser) return null;
      const parsed = JSON.parse(savedUser);
      const raw = parsed?.id ?? parsed?.customerId ?? parsed?.customerID ?? parsed?.userId ?? null;
      if (raw == null) return null;
      const idNum = typeof raw === "number" ? raw : Number(raw);
      return Number.isFinite(idNum) ? idNum : null;
    } catch {
      return null;
    }
  };

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

  useEffect(() => {
    const synced = {};
    cartItems.forEach((item) => {
      const id = item.productID || item.productId || item.id;
      synced[id] = item.quantity || 1;
    });
    setOptimisticQty(synced);
  }, [cartItems]);

  useEffect(() => {
    return () => {
      Object.values(qtyTimersRef.current).forEach((timerId) => clearTimeout(timerId));
    };
  }, []);

  const queueQuantityUpdate = (productId, quantity) => {
    const nextQty = Math.max(1, quantity);
    setOptimisticQty((prev) => ({ ...prev, [productId]: nextQty }));

    if (qtyTimersRef.current[productId]) {
      clearTimeout(qtyTimersRef.current[productId]);
    }

    qtyTimersRef.current[productId] = setTimeout(() => {
      dispatch(
        updateCartItemQuantity({
          userId: getCurrentUserId(),
          productId,
          quantity: nextQty,
        })
      );
    }, 320);
  };

  const subtotal = useSelector(selectCartSubtotal);

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
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl flex flex-col transition-transform duration-500 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {t("cart.title") || "Gio hang"} ({cartItems.length})
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
              description={t("cart.empty_description")}
              ctaLabel={t("cart.start_shopping")}
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
                className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl transition-all duration-300 hover:shadow-sm hover:-translate-y-0.5"
              >
                <img
                  src={item.imageUrl || item.image}
                  alt=""
                  className="w-16 h-16 object-contain bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-700 p-1"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
                    {item.name || item.productName}
                  </h4>
                  <p className="text-sm font-bold text-violet-700 mt-1">
                    {formatCurrency(item.unitPrice || item.price)}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => {
                        const productId = item.productID || item.productId || item.id;
                        const currentQty = optimisticQty[productId] ?? item.quantity ?? 1;
                        queueQuantityUpdate(productId, currentQty - 1);
                      }}
                      className="w-6 h-6 flex items-center justify-center rounded bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-xs hover:border-violet-300"
                    >
                      -
                    </button>
                    <span className="text-sm font-medium w-6 text-center dark:text-gray-200">
                      {(optimisticQty[item.productID || item.productId || item.id] ?? item.quantity) || 1}
                    </span>
                    <button
                      onClick={() => {
                        const productId = item.productID || item.productId || item.id;
                        const currentQty = optimisticQty[productId] ?? item.quantity ?? 1;
                        queueQuantityUpdate(productId, currentQty + 1);
                      }}
                      className="w-6 h-6 flex items-center justify-center rounded bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-xs hover:border-violet-300"
                    >
                      +
                    </button>
                    <button
                      onClick={() =>
                        dispatch(
                          removeFromCart({
                            userId: getCurrentUserId(),
                            productId: item.productID || item.productId || item.id,
                          })
                        )
                      }
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
          <div className="border-t border-gray-100 dark:border-gray-700 px-5 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">{t("cart.subtotal") || "Tam tinh"}</span>
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{formatCurrency(subtotal)}</span>
            </div>
            <Button
              onClick={() => { onClose(); navigate("/checkout"); }}
              fullWidth
              size="lg"
            >
              {t("cart.checkout") || "Thanh toan"}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
