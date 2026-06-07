// CartItem.js
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import formatCurrency from "../../utils/formatCurrency";
import {
  updateCartItemQuantity,
  removeFromCart,
} from "../../utils/redux/cartSlice";

function CartItem({ item, onQuantityChange, onRemove }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  // Helper: lấy userId từ localStorage
  const getCurrentUserId = () => {
    try {
      const savedUser = localStorage.getItem("user");
      if (!savedUser) return null;
      const parsed = JSON.parse(savedUser);
      return parsed?.customerID ?? parsed?.id ?? parsed?.customerId ?? null;
    } catch (e) {
      console.error("Lỗi khi đọc user từ localStorage:", e);
      return null;
    }
  };

  // Helper: try load the latest cart item from sessionStorage by productID
  const getCartItemFromSession = productID => {
    try {
      if (!productID) return null;
      const serialized = sessionStorage.getItem("cart");
      if (!serialized) return null;
      const parsed = JSON.parse(serialized);
      // Determine current user id from localStorage
      const savedUser = localStorage.getItem("user");
      const userId = savedUser
        ? JSON.parse(savedUser).customerID ??
          JSON.parse(savedUser).id ??
          "guest"
        : "guest";
      const userCart = parsed?.[userId]?.carts ?? parsed?.guest?.carts ?? [];
      return userCart.find(c => c.productID === productID) || null;
    } catch (e) {
      console.error("Lỗi khi đọc cart từ sessionStorage", e);
      return null;
    }
  };

  const [quantity, setQuantity] = useState(() => {
    // Prefer value from sessionStorage if available, otherwise from prop, fallback to 1
    const sessionItem = getCartItemFromSession(item?.productID);
    return sessionItem?.quantity ?? item?.quantity ?? 1;
  });

  // modal state for confirming remove when decreasing below 1
  const [showConfirmRemove, setShowConfirmRemove] = useState(false);

  // Sync quantity when the prop or session changes
  useEffect(() => {
    const sessionItem = getCartItemFromSession(item?.productID);
    if (sessionItem && typeof sessionItem.quantity === "number") {
      setQuantity(sessionItem.quantity);
    } else if (item && typeof item.quantity === "number") {
      setQuantity(item.quantity); // Cập nhật lại quantity khi item thay đổi
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.productID, item?.quantity]);

  const handleQuantityChange = async newQuantity => {
    if (newQuantity < 1) {
      setShowConfirmRemove(true);
      return;
    }

    const userId = getCurrentUserId();
    const productId = item.productID || item.productId || item.id;

    try {
      await dispatch(
        updateCartItemQuantity({
          userId,
          productId,
          quantity: newQuantity,
        })
      ).unwrap();

      setQuantity(newQuantity);
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const handleRemove = async () => {
    const userId = getCurrentUserId();
    const productId = item.productID || item.productId || item.id;

    try {
      await dispatch(
        removeFromCart({
          userId,
          productId,
        })
      ).unwrap();
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  // When user clicks decrease button
  const handleDecreaseClick = () => {
    if (quantity <= 1) {
      // show confirm modal to remove
      setShowConfirmRemove(true);
    } else {
      handleQuantityChange(quantity - 1);
    }
  };

  const handleConfirmRemove = async () => {
    setShowConfirmRemove(false);
    await handleRemove();
  };

  const handleCancelRemove = () => {
    setShowConfirmRemove(false);
  };

  return (
    <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:gap-5">
      {/* Hình ảnh sản phẩm */}
      <div className="mx-auto w-24 h-24 shrink-0 sm:mx-0 sm:mr-0">
        <img
          src={item.image || item.imageUrl || item.product?.imageUrl || ""}
          alt={item.productName || item.name || item.product?.name || "Product"}
          className="w-full h-full object-cover rounded-lg"
          style={{ objectFit: "contain" }}
          onError={e => {
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "flex";
          }}
        />
        <div
          className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs"
          style={{ display: "none" }}
        >
          No Image
        </div>
      </div>

      {/* Thông tin sản phẩm */}
      <div className="min-w-0 flex-1 text-center sm:text-left">
        <h3 className="text-sm font-semibold text-gray-900">
          {item.productName ||
            item.name ||
            item.product?.name ||
            t("payment.cart_item.unknown_product")}
        </h3>
        <p className="text-xs text-gray-500">{item.description || ""}</p>
      </div>

      {/* Giá sản phẩm */}
      {/* <div className="mr-4 text-sm font-semibold text-gray-700">
        {new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(item?.unitPrice || 0)}
      </div> */}

      {/* Số lượng */}
      <div className="flex items-center justify-center gap-1 sm:mr-4">
        {/* Decrease button */}
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          onClick={handleDecreaseClick}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Quantity input */}
        <div className="relative">
          <input
            type="number"
            value={quantity}
            onChange={e => {
              const value = parseInt(e.target.value) || 1;
              handleQuantityChange(Math.max(1, value));
            }}
            min="1"
            className="h-9 w-12 rounded-lg border border-gray-200 text-center text-sm font-medium text-gray-800 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
          />
        </div>

        {/* Increase button */}
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          onClick={() => handleQuantityChange(quantity + 1)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Tổng tiền sản phẩm */}
      <div className="text-center text-sm font-semibold text-gray-900 tabular-nums sm:mr-4 sm:text-right">
        {formatCurrency(item?.totalPrice || 0)}
      </div>

      {/* Nút xóa sản phẩm */}
      <button
        type="button"
        onClick={handleRemove}
        className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300 sm:mx-0"
        aria-label={t("payment.cart_item.remove")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Confirm remove modal */}
      {showConfirmRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-[2px]"
            onClick={handleCancelRemove}
            role="presentation"
          />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              {t("payment.cart_item.remove_product")}
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              {t("payment.cart_item.confirm_remove")}
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancelRemove}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {t("payment.cart_item.cancel")}
              </button>
              <button
                type="button"
                onClick={handleConfirmRemove}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              >
                {t("payment.cart_item.remove")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartItem;
