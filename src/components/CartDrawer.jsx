import React, { useEffect, useRef, useState, memo, useCallback, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { UserContext } from "../context/UserContext";
import { createPortal } from "react-dom";
import { removeFromCart, updateCartItemQuantity } from "../utils/redux/cartSlice";
import { selectCartItems, selectCartSubtotal } from "../utils/redux/selectors";
import formatCurrency from "../utils/formatCurrency";
import EmptyState from "./ui/EmptyState";
import Button from "./ui/Button";

/**
 * CartDrawer — Full-height slide-in panel from right replacing dropdown cart.
 * Shows all cart items with quantity controls, subtotal, and checkout CTA.
 */

const CartItem = memo(({ item, optimisticQty, onIncrease, onDecrease, onRemove }) => {
  const productId = item.productID || item.productId || item.id;
  const qty = optimisticQty[productId] ?? item.quantity ?? 1;

  return (
    <div className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl transition-all duration-200 hover:shadow-sm group">
      {/* Product image */}
      <div className="relative shrink-0">
        <img
          src={item.image || item.imageUrl || item.product?.imageUrl || ""}
          alt={item.productName || item.name || item.product?.name || "Product"}
          className="w-[72px] h-[72px] object-contain bg-white dark:bg-[var(--color-bg-subtle)] rounded-xl border border-gray-100 dark:border-[var(--color-border)] p-1.5"
        />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug">
          {item.productName || item.name || item.product?.name || "Product"}
        </h4>
        <p className="text-sm font-bold text-[var(--color-primary)] dark:text-indigo-400 mt-1">
          {formatCurrency(item.unitPrice || item.price || item.product?.unitPrice || 0)}
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
  const { user } = useContext(UserContext);
  const [optimisticQty, setOptimisticQty] = useState({});
  const [showLoginModal, setShowLoginModal] = useState(false);

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

  const queueQuantityUpdate = useCallback((productId, quantity) => {
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

  const handleIncrease = useCallback((productId, qty) => {
    queueQuantityUpdate(productId, qty + 1);
  }, [queueQuantityUpdate]);

  const handleDecrease = useCallback((productId, qty) => {
    queueQuantityUpdate(productId, qty - 1);
  }, [queueQuantityUpdate]);

  const handleRemove = useCallback((productId) => {
    dispatch(removeFromCart({ userId: getCurrentUserId(), productId }));
  }, [dispatch]);

  const handleCheckoutClick = () => {
    if (!user) {
      setShowLoginModal(true);
    } else {
      onClose();
      navigate("/checkout");
    }
  };

  const handleGoToLogin = () => {
    setShowLoginModal(false);
    onClose();
    navigate("/login", { state: { from: "/checkout" } });
  };

  const subtotal = useSelector(selectCartSubtotal);

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[var(--z-modal-backdrop)] bg-black/30 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 z-[var(--z-modal)] h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl flex flex-col transition-transform duration-500 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="relative flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700 overflow-hidden">
          {/* Gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-indigo-500" />
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
              {t("cart.title") || "Gio hang"}
            </h2>
            {cartItems.length > 0 && (
              <span className="min-w-[22px] h-[22px] px-1.5 flex items-center justify-center rounded-full bg-indigo-500 text-white text-[11px] font-bold">
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
              onClick={handleCheckoutClick}
              className="w-full py-3.5 rounded-xl bg-indigo-500 text-white font-semibold text-sm hover:bg-indigo-600 active:scale-[0.97] transition-all duration-150 flex items-center justify-center gap-2"
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {t("cart.checkout") || "Thanh toan"}
            </button>

            {/* Continue shopping */}
            <button
              onClick={onClose}
              className="w-full py-2.5 text-sm text-gray-500 hover:text-indigo-600 font-medium transition-colors"
            >
              {t("cart.continue_shopping") || "Tiep tuc mua sam"}
            </button>
          </div>
        )}
      </div>

      {/* Login Confirmation Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[var(--z-popover)] flex items-center justify-center p-4">
          {/* Modal Backdrop with glass effect */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setShowLoginModal(false)}
          />
          
          {/* Modal Panel */}
          <div className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800/50 transform scale-100 transition-all duration-300 text-center animate-fadeIn">
            {/* Lock/Warning Icon */}
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
              Yêu cầu đăng nhập
            </h3>

            {/* Description */}
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              Bạn cần đăng nhập tài khoản để thực hiện thanh toán đơn hàng. Bạn có muốn đi đến trang đăng nhập ngay không?
            </p>

            {/* Buttons */}
            <div className="space-y-2">
              <button
                onClick={handleGoToLogin}
                className="w-full py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm transition-all duration-150 active:scale-[0.98] shadow-sm hover:shadow-md"
              >
                Đăng nhập ngay
              </button>
              <button
                onClick={() => setShowLoginModal(false)}
                className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium text-sm transition-colors duration-150"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  );
}
