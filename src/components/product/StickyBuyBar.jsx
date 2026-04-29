import React, { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
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
  const [visible, setVisible] = useState(false);
  const [adding, setAdding] = useState(false);

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

  const handleAddToCart = async () => {
    if (adding) return;
    const userId = getCurrentUserId();
    setAdding(true);
    try {
      await dispatch(
        addToCart({
          userId,
          productId: product.productID,
          quantity,
          productData: {
            id: product.productID,
            name: product.productName,
            unitPrice: product.price || product.unitPrice || 0,
            imageUrl: product.image || product.imageUrl || "",
          },
        })
      ).unwrap();
      notify.success("Đã thêm vào giỏ hàng!");
    } catch {
      notify.error("Lỗi khi thêm vào giỏ hàng!");
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
            <p className="text-base font-bold text-violet-700 leading-tight tabular-nums">
              {formatCurrency(price * quantity)}
              {quantity > 1 && (
                <span className="text-xs font-normal text-gray-500 ml-1.5">
                  × {quantity}
                </span>
              )}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleAddToCart}
              disabled={adding}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-violet-700 text-white text-sm font-semibold rounded-xl hover:bg-violet-800 disabled:opacity-60 transition-colors shadow-sm"
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
              Thêm vào giỏ
            </button>

            <a
              href={`/shopping_card_checkout`}
              onClick={handleAddToCart}
              className="px-4 py-2.5 border border-violet-200 text-violet-700 text-sm font-semibold rounded-xl hover:bg-violet-50 transition-colors hidden sm:flex items-center gap-1.5"
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                <path
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
              Mua ngay
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StickyBuyBar;
