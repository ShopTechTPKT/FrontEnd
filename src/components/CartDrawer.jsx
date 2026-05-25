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

const CartItem = React.memo(({ item, optimisticQty, onIncrease, onDecrease, onRemove }) => {
  const productId = item.productID || item.productId || item.id;
  const qty = optimisticQty[productId] ?? item.quantity ?? 1;

  return (
    <div className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl transition-all duration-200 hover:shadow-sm group">
      {/* Product image */}
      <div className="relative shrink-0">
        <img
          src={item.imageUrl || item.image}
          alt=""
          className="w-[72px] h-[72px] object-contain bg-white dark:bg-[var(--color-bg-subtle)] rounded-xl border border-gray-100 dark:border-[var(--color-border)] p-1.5"
        />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug">
          {item.name || item.productName}
        </h4>
        <p className="text-sm font-bold text-[var(--color-primary)] dark:text-violet-400 mt-1">
          {formatCurrency(item.unitPrice || item.price)}
        </p>

        {/* Quantity + Remove */}
        <div className="flex items-center justify-between mt-2.5">
          {/* Stepper */}
          <div className="flex items-center gap-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-[var(--color-border)] rounded-full px-1 py-0.5">
            <button
              onClick={() => onDecrease(productId, qty)}
              className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
              aria-label="Decrease"
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                <path d="M5 12h14" />
              </svg>
            </button>
            <span className="text-sm font-semibold w-6 text-center tabular-nums dark:text-gray-200">{qty}</span>
            <button
              onClick={() => onIncrease(productId, qty)}
              className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
              aria-label="Increase"
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          </div>

          {/* Remove */}
          <button
            onClick={() => onRemove(productId)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            aria-label="Remove item"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
});

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

  const queueQuantityUpdate = React.useCallback((productId, quantity) => {
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
  }, [dispatch]);

  const handleIncrease = React.useCallback((productId, qty) => {
    queueQuantityUpdate(productId, qty + 1);
  }, [queueQuantityUpdate]);

  const handleDecrease = React.useCallback((productId, qty) => {
    queueQuantityUpdate(productId, qty - 1);
  }, [queueQuantityUpdate]);

  const handleRemove = React.useCallback((productId) => {
    dispatch(removeFromCart({ userId: getCurrentUserId(), productId }));
  }, [dispatch]);

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
        <div className="relative flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700 overflow-hidden">
          {/* Gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-600 to-purple-500" />
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
              {t("cart.title") || "Gio hang"}
            </h2>
            {cartItems.length > 0 && (
              <span className="min-w-[22px] h-[22px] px-1.5 flex items-center justify-center rounded-full bg-violet-600 text-white text-[11px] font-bold">
                {cartItems.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close cart"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 18L18 6M6 6l12 12" />
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
              <CartItem
                key={item.productID || item.productId || item.id}
                item={item}
                optimisticQty={optimisticQty}
                onIncrease={handleIncrease}
                onDecrease={handleDecrease}
                onRemove={handleRemove}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t border-gray-100 dark:border-gray-700 px-5 pt-4 pb-6 space-y-3">
            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">{t("cart.subtotal") || "Tam tinh"}</span>
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(subtotal)}</span>
            </div>

            {/* Checkout CTA */}
            <button
              onClick={() => { onClose(); navigate("/checkout"); }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 text-white font-semibold text-sm shadow-md shadow-violet-200/50 hover:shadow-violet-300/60 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {t("cart.checkout") || "Thanh toan"}
            </button>

            {/* Continue shopping */}
            <button
              onClick={onClose}
              className="w-full py-2.5 text-sm text-gray-500 hover:text-violet-700 font-medium transition-colors"
            >
              {t("cart.continue_shopping") || "Tiep tuc mua sam"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
