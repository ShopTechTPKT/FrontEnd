"use client";

import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import path from "../../constant/path";
import CartItem from "../../components/ShoppingCard/ShoppingCardItem";
import {
  removeFromCart,
  updateCartItemQuantity,
  clearCart,
  loadCartItems,
} from "../../utils/redux/cartSlice";
import { useState, useEffect } from "react";
import ConfirmModal from "../../components/ConfirmModal";
import { Breadcrumb, Button } from "../../components/ui";
import formatCurrency from "../../utils/formatCurrency";
import getCurrentUserId from "../../utils/getCurrentUserId";

const ShoppingCart = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    carts: cartItems,
    cartSummary,
    loading,
    error,
  } = useSelector(state => state.cart);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(() => () => {});



  useEffect(() => {
    const userId = getCurrentUserId();
    if (userId) {
      dispatch(loadCartItems(userId));
    }
  }, [dispatch]);

  const openConfirm = (message, action) => {
    setConfirmMessage(message);
    setConfirmAction(() => action || (() => {}));
    setConfirmOpen(true);
  };

  const handleConfirmOk = () => {
    setConfirmOpen(false);
    try {
      confirmAction();
    } catch (e) {
      console.error(e);
    }
  };

  const handleConfirmCancel = () => setConfirmOpen(false);

  const handleRemove = async productId => {
    const userId = getCurrentUserId();
    await dispatch(removeFromCart({ userId, productId }))
      .unwrap()
      .catch(err => console.error(err));
  };

  const handleQuantityChange = (productId, newQuantity) => {
    const userId = getCurrentUserId();
    dispatch(
      updateCartItemQuantity({ userId, productId, quantity: newQuantity })
    )
      .unwrap()
      .catch(err => console.error(err));
  };

  const handleClearCart = () => {
    const userId = getCurrentUserId();
    openConfirm(t("cart.remove"), () => dispatch(clearCart(userId)));
  };

  const [loginConfirmOpen, setLoginConfirmOpen] = useState(false);
  const handleCheckout = () => {
    const userId = getCurrentUserId();

    if (!userId) {
      setLoginConfirmOpen(true);
    } else if (cartItems.length === 0) {
      openConfirm(t("cart.gi_hng_trng"));
    } else {
      navigate(path.shopping_card_checkout);
    }
  };

  const subtotal = cartSummary
    ? cartSummary.totalAmount
    : cartItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);



  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50/50 via-white to-gray-50/80 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Breadcrumb — tối giản */}
        <Breadcrumb
          items={[
            { label: t("product.home"), to: path.home },
            { label: t("cart.title") },
          ]}
        />

        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight">
            {t("cart.title")}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {t("payment.checkout.step_shipping")} →{" "}
            {t("payment.checkout.step_payment_review")}
          </p>
        </header>

        {loading && (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm space-y-4">
            <div className="h-4 w-32 bg-gray-100 rounded-md animate-pulse" />
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="flex gap-4 py-4 border-b border-gray-50 last:border-0"
              >
                <div className="w-20 h-20 bg-gray-100 rounded-xl animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-gray-50 rounded w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-100 bg-red-50 text-red-800 px-4 py-3 text-sm mb-6"
          >
            {t("common.error")}: {error}
          </div>
        )}

        {!loading && cartItems.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white px-6 py-14 sm:py-16 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-violet-50 text-violet-600">
              <svg
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218a1.5 1.5 0 001.421-1.004l3.75-12a1.5 1.5 0 00-1.421-1.996H6.257m-3.75 9V6.75A2.25 2.25 0 016 4.5h6.75"
                />
              </svg>
            </div>
            <p className="text-gray-700 font-medium">{t("cart.gi_hng_trng")}</p>
            <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
              {t("common.catalog_no_products_hint")}
            </p>
            <Link to={path.home} className="inline-block mt-8">
              <span className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 transition-colors">
                {t("cart.tip_tc_mua_sm")}
              </span>
            </Link>
          </div>
        ) : (
          !loading && (
            <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start">
              <div className="lg:col-span-8">
                <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm">
                  <div className="divide-y divide-gray-100">
                    {cartItems.map(item => (
                      <CartItem
                        key={item.id}
                        item={{
                          productID: item.product.id,
                          name: item.product.name,
                          price: item.unitPrice,
                          imageUrl: item.product.imageUrl,
                          quantity: item.quantity,
                          totalPrice: item.totalPrice,
                        }}
                        onQuantityChange={handleQuantityChange}
                        onRemove={() => handleRemove(item.product.id)}
                      />
                    ))}
                  </div>

                  <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between pt-6 border-t border-gray-100">
                    <Button
                      variant="outline"
                      onClick={handleClearCart}
                    >
                      {t("cart.xa_gi_hng")}
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleCheckout}
                    >
                      {t("cart.checkout")}
                    </Button>
                  </div>
                </div>
              </div>

              <aside className="mt-8 lg:mt-0 lg:col-span-4">
                <div className="rounded-2xl border border-violet-100/80 bg-white p-5 sm:p-6 shadow-sm lg:sticky lg:top-28">
                  <h2 className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    {t("order.subtotal")}
                  </h2>
                  <p className="mt-2 text-2xl font-semibold text-violet-700 tabular-nums">
                    {formatCurrency(subtotal)}
                  </p>
                  <p className="mt-3 text-xs text-gray-500 leading-relaxed">
                    {t("payment.checkout.shipping")} —{" "}
                    {t("payment.checkout.step_payment_review").toLowerCase()}
                  </p>
                  <button
                    type="button"
                    onClick={handleCheckout}
                    className="mt-6 w-full rounded-xl bg-violet-600 py-3 text-sm font-medium text-white shadow-sm hover:bg-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 transition-colors lg:hidden"
                  >
                    {t("cart.checkout")}
                  </button>
                </div>
              </aside>
            </div>
          )
        )}

        <ConfirmModal
          isOpen={confirmOpen}
          title={t("cart.remove")}
          message={confirmMessage}
          onConfirm={handleConfirmOk}
          onCancel={handleConfirmCancel}
          confirmText={t("common.confirm")}
          cancelText={t("common.cancel")}
        />
        <ConfirmModal
          isOpen={loginConfirmOpen}
          title={t("header.pleaseLogin")}
          message={t("cart.please_login_to_checkout")}
          onConfirm={() => {
            setLoginConfirmOpen(false);
            navigate(path.login);
          }}
          onCancel={() => setLoginConfirmOpen(false)}
          confirmText={t("header.login")}
          cancelText={t("common.cancel")}
        />
      </div>
    </div>
  );
};

export default ShoppingCart;
