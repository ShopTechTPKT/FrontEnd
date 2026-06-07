import React, { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { addToCart } from "../../utils/redux/cartSlice";
import notify from "../../utils/notify";
import formatCurrency from "../../utils/formatCurrency";
import getCurrentUserId from "../../utils/getCurrentUserId";

/**
 * StickyBuyBar — Fixed bottom bar that appears when user scrolls
 * past the main "add to cart" section of the product detail page.
 *
 * Props:
 *   product   — product object (productID, productName, price, image)
 *   quantity  — currently selected quantity
 *   anchorRef — ref to the buy-box element; bar shows when anchor scrolls off screen
 */
const StickyBuyBar = ({ product, quantity = 1, anchorRef }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [adding, setAdding] = useState(false);
  const [selectedQty, setSelectedQty] = useState(Math.max(1, quantity));

  /* Show bar when buy box scrolls above viewport */
  useEffect(() => {
    if (!anchorRef?.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Visible = anchor is OUT of viewport (scrolled past it)
        setVisible(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "0px 0px 0px 0px" }
    );

    observer.observe(anchorRef.current);
    return () => observer.disconnect();
  }, [anchorRef]);

  useEffect(() => {
    setSelectedQty(Math.max(1, quantity));
  }, [quantity]);

  const handleAddToCart = async () => {
    if (adding) return;
    const userId = getCurrentUserId();
    setAdding(true);
    try {
      await dispatch(
        addToCart({
          userId,
          productId: product.productID,
          quantity: selectedQty,
          productData: {
            id: product.productID,
            name: product.productName,
            unitPrice: product.price || product.unitPrice || 0,
            imageUrl: product.image || product.imageUrl || "",
          },
        })
      ).unwrap();
      notify.success(t("cart.added_success"));
    } catch {
      notify.error(t("cart.added_error"));
    } finally {
      setAdding(false);
    }
  };

  const price = product?.price || product?.unitPrice || 0;
  const name = product?.productName || product?.name || "";

  if (!visible) return null;

  return (
    <div className="sticky-buy-bar animate-slideInUp">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center gap-4">
          {/* Product thumbnail */}
          {(product?.image || product?.imageUrl) && (
            <img
              src={product.image || product.imageUrl}
              alt={name}
              className="w-10 h-10 object-contain rounded-lg bg-gray-50 border border-gray-100 shrink-0 hidden sm:block"
            />
          )}

          {/* Name + price */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate leading-tight">
              {name}
            </p>
            <p className="text-base font-bold text-indigo-600 leading-tight tabular-nums">
              {formatCurrency(price * quantity)}
              {selectedQty > 1 && (
                <span className="text-xs font-normal text-gray-500 ml-1.5">
                  × {selectedQty}
                </span>
              )}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-1.5 py-1">
              <button
                type="button"
                onClick={() => setSelectedQty((q) => Math.max(1, q - 1))}
                className="w-7 h-7 rounded-md text-gray-700 hover:bg-gray-100"
                aria-label={t("cart.decrease_quantity")}
              >
                -
              </button>
              <span className="w-8 text-center text-sm font-semibold text-gray-900">{selectedQty}</span>
              <button
                type="button"
                onClick={() => setSelectedQty((q) => Math.min(99, q + 1))}
                className="w-7 h-7 rounded-md text-gray-700 hover:bg-gray-100"
                aria-label={t("cart.increase_quantity")}
              >
                +
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={adding}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-500 text-white text-sm font-semibold rounded-xl hover:bg-indigo-600 active:scale-[0.97] disabled:opacity-60 transition-all shadow-sm"
            >
              {adding ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                  <path
                    d="M3 4H5L7.2 14.5C7.3 15 7.8 15.4 8.3 15.4H17.8C18.3 15.4 18.8 15 18.9 14.5L20.3 8.5H6.2"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  />
                  <circle cx="9.2" cy="19" r="1.4" fill="currentColor" />
                  <circle cx="17.2" cy="19" r="1.4" fill="currentColor" />
                </svg>
              )}
              {t("product.add_to_cart")}
            </button>

            <a
              href={`/shopping_card_checkout?installment=1`}
              onClick={handleAddToCart}
              className="px-4 py-2.5 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900 active:scale-[0.97] transition-all hidden sm:flex items-center gap-1.5"
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                <path
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
              {t("product.installment_zero_percent")}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StickyBuyBar;
