import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  removeFromCart,
  updateCartItemQuantity,
  loadCartItems,
} from "../utils/redux/cartSlice";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const CartDropdown = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { carts, cartSummary } = useSelector(state => state.cart);

  const getCurrentUserId = () => {
    try {
      const savedUser = localStorage.getItem("user");
      if (!savedUser) return null;
      const parsed = JSON.parse(savedUser);
      const raw =
        parsed?.id ??
        parsed?.customerId ??
        parsed?.customerID ??
        parsed?.userId ??
        null;
      if (raw == null) return null;
      const idNum = typeof raw === "number" ? raw : Number(raw);
      return Number.isFinite(idNum) ? idNum : null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    dispatch(loadCartItems());
  }, [dispatch]);

  const totalAmount = cartSummary
    ? cartSummary.totalAmount
    : carts.reduce((total, item) => {
        return (
          total +
          (item.totalPrice ||
            item.quantity * (item.unitPrice || item.product?.unitPrice || 0) ||
            0)
        );
      }, 0);

  const handleIncrement = async (productId, currentQuantity) => {
    const userId = getCurrentUserId();
    dispatch(
      updateCartItemQuantity({
        userId,
        productId,
        quantity: currentQuantity + 1,
      })
    );
  };

  const handleDecrement = async (productId, currentQuantity) => {
    const userId = getCurrentUserId();
    try {
      if (currentQuantity <= 1) {
        await dispatch(removeFromCart({ userId, productId })).unwrap();
      } else {
        await dispatch(
          updateCartItemQuantity({
            userId,
            productId,
            quantity: currentQuantity - 1,
          })
        ).unwrap();
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const handleRemove = async productId => {
    const userId = getCurrentUserId();
    dispatch(removeFromCart({ userId, productId }));
  };

  const handleCheckout = () => {
    navigate("/shopping_card_checkout");
    onClose();
  };

  const handleViewCart = () => {
    navigate("/shopping_card_item");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-gray-200 rounded-xl shadow-md shadow-gray-200/40 z-[100] overflow-hidden animate-fadeIn">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="text-gray-900 font-semibold text-base flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-gray-700">
            <path d="M6 8h12l-1 11H7L6 8Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 9V7a3 3 0 1 1 6 0v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          {t("cart.title")} ({carts.length})
        </h3>
      </div>

      {/* Cart Items */}
      <div className="max-h-80 overflow-y-auto">
        {carts.length === 0 ? (
          <div className="p-8 text-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-12 h-12 text-gray-200 mx-auto mb-3">
              <path d="M6 8h12l-1 11H7L6 8Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 9V7a3 3 0 1 1 6 0v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <p className="text-gray-600 mb-1 font-medium text-sm">
              {t("cart.your_cart_is_empty")}
            </p>
            <p className="text-gray-400 text-xs">
              {t("cart.add_some_products_to")}
            </p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {carts.map((item, index) => (
              <div
                key={item.id || `cart-item-${index}`}
                className="flex gap-3 p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100/80 transition-colors group"
              >
                {/* Product Image */}
                <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                  <img
                    src={item.product?.imageUrl || item.imageUrl || ""}
                    alt={item.product?.name || item.name || ""}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-gray-800 font-medium text-sm mb-0.5 truncate">
                    {item.product?.name || item.name || ""}
                  </h4>
                  <p className="text-gray-900 font-semibold text-sm mb-2">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(
                      item.unitPrice ||
                        item.product?.unitPrice ||
                        item.price ||
                        0
                    )}
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() =>
                        handleDecrement(
                          item.product?.id || item.id,
                          item.quantity
                        )
                      }
                      className="w-6 h-6 flex items-center justify-center bg-white hover:bg-gray-100 text-gray-600 rounded border border-gray-200 transition-colors"
                    >
                      <svg viewBox="0 0 20 20" fill="none" className="w-2 h-2">
                        <path d="M4 10h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    </button>
                    <span className="text-gray-800 font-medium text-sm w-7 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        handleIncrement(
                          item.product?.id || item.id,
                          item.quantity
                        )
                      }
                      className="w-6 h-6 flex items-center justify-center bg-white hover:bg-gray-100 text-gray-600 rounded border border-gray-200 transition-colors"
                    >
                      <svg viewBox="0 0 20 20" fill="none" className="w-2 h-2">
                        <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemove(item.product?.id || item.id)}
                  className="text-gray-400 hover:text-red-500 p-1.5 rounded transition-colors self-start"
                  title={t("cart.remove_from_cart")}
                >
                  <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3">
                    <path d="M4 7h16M10 11v6M14 11v6M9 7l1-2h4l1 2M7 7l1 12h8l1-12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {carts.length > 0 && (
        <div className="p-4 border-t border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-500">{t("cart.subtotal")}</span>
            <span className="text-gray-900 font-bold text-base">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(totalAmount)}
            </span>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleViewCart}
              className="w-full py-2 text-sm bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-200 transition-colors"
            >
              {t("cart.view_cart")}
            </button>
            <button
              onClick={handleCheckout}
              className="w-full py-2 text-sm bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors"
            >
              {t("cart.checkout")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartDropdown;
