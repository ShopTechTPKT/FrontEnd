import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { addToCart } from "../../utils/redux/cartSlice";
import notify from "../../utils/notify";
import { useFavorites } from "../../hooks/useFavorites";
import { useCompare } from "../../context/CompareContext";
import formatCurrency from "../../utils/formatCurrency";
import getCurrentUserId from "../../utils/getCurrentUserId";
import QuickViewModal from "./QuickViewModal";
import LazyImage from "../ui/LazyImage";
import Badge from "../ui/Badge";

/**
 * ProductCard — Enhanced product display card.
 * New in Phase 1:
 *  - Discount % badge (top-left)
 *  - Installment badge for expensive items (top-right extra)
 *  - Mini specs line
 *  - Sold count
 *  - Lifted hover shadow
 */
const ProductCard = ({ product }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showQuickView, setShowQuickView] = useState(false);
  const { addToCompare, isInCompare } = useCompare();

  const { isFavorited,
    loading: favoriteLoading,
    handleToggleFavorite,
  } = useFavorites(product?.productID);

  // Derived stock value
  const stock = product.stock ?? product.quantity ?? product.inventory ?? 0;

  const handleClick = () => {
    navigate(`/product/${product.productID}/productAbout`);
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    const userId = getCurrentUserId();
    try {
      await dispatch(
        addToCart({
          userId,
          productId: product.productID,
          quantity: 1,
          productData: {
            id: product.productID,
            name: product.productName,
            unitPrice: product.price || 0,
            imageUrl: product.image || "",
          },
        })
      ).unwrap();
      notify.success("Đã thêm sản phẩm vào giỏ hàng!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      notify.error("Lỗi khi thêm sản phẩm vào giỏ hàng!");
    }
  };

  const handleAddToWishlist = async (e) => {
    e.stopPropagation();
    const userId = getCurrentUserId();
    if (!userId) {
      notify.error("Vui lòng đăng nhập để thêm yêu thích");
      return;
    }
    try {
      await handleToggleFavorite();
      if (isFavorited) {
        notify.success("Đã xóa khỏi yêu thích");
      } else {
        notify.success("Đã thêm vào yêu thích");
      }
    } catch {
      notify.error("Lỗi khi thêm/xóa yêu thích");
    }
  };

  const handleAddToCompare = (e) => {
    e.stopPropagation();
    if (isInCompare(product.productID)) {
      notify.info("Sản phẩm đã có trong danh sách so sánh.");
      return;
    }
    const added = addToCompare(product);
    if (!added) {
      notify.warning("Bạn chỉ có thể so sánh tối đa 4 sản phẩm.");
      return;
    }
    notify.success("Đã thêm vào danh sách so sánh.");
  };

  // ── Derived display values ────────────────────────────────
  const price = product.price || 0;
  const originalPrice = product.originalPrice || price * 1.25;
  const discountPct = product.percentage ||
    (originalPrice > price && price > 0
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0);
  const hasDiscount = discountPct > 0;
  const isExpensive = price >= 5_000_000;
  const soldCount = product.soldCount || product.sold || null;
  const rating = product.rating || product.averageRating || null;
  const ratingDisplay = rating ? parseFloat(rating).toFixed(1) : "4.8";
  const miniSpecs = product.categoryName || product.brandName || null;
  // Mini specs: parse from categoryName or seriesName
  // Priority Badge
  let topBadge = null;
  if (hasDiscount) {
    topBadge = <span className="bg-[#dc2626] text-white text-[11px] font-bold px-2 py-1 rounded-md leading-none shadow-sm">-{discountPct}%</span>;
  } else if (product.isNew) {
    topBadge = <span className="bg-[#059669] text-white text-[11px] font-bold px-2 py-1 rounded-md leading-none shadow-sm uppercase">New</span>;
  } else if (product.isHot) {
    topBadge = <span className="bg-[#ea580c] text-white text-[11px] font-bold px-2 py-1 rounded-md leading-none shadow-sm uppercase">Hot</span>;
  }

  return (
    <>
      <div
        className="group product-card-hover relative cursor-pointer overflow-hidden rounded-2xl border border-transparent bg-white shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-indigo-700"
        onClick={handleClick}
      >
        {/* ── Top badges row ── */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {/* Stock badge */}
          {product.inStock ? (
            <Badge variant="success" size="sm" dot>
              {t("product.in_stock")}
            </Badge>
          ) : (
            <Badge variant="danger" size="sm" dot>
              {t("product.check_availability")}
            </Badge>
          )}

          {/* Priority Badge */}
          {topBadge}
        </div>

        {/* Installment badge — top right corner */}
        {isExpensive && (
          <div className="absolute top-3 right-3 z-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <span className="whitespace-nowrap rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-amber-700 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
              {t("product.installment_zero_percent")}
            </span>
          </div>
        )}

        {/* ── Action Buttons (hover reveal) — when NOT expensive (no installment) ── */}
        <div
          className={`absolute z-10 rounded-xl bg-white/90 p-2 opacity-0 shadow-md backdrop-blur-sm transition-opacity duration-200 dark:bg-gray-900/90 group-hover:opacity-100 ${
            isExpensive ? "top-10 right-3" : "top-3 right-3"
          }`}
        >
          <div className="flex flex-col gap-2">
            <button
              onClick={handleAddToCompare}
              className="p-2 bg-indigo-500 text-white rounded-full shadow-md hover:bg-indigo-600 active:scale-[0.97] transition-all"
              title={t("product.add_compare")}
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 7h8M4 12h12M4 17h8M17 5l3 3-3 3" />
              </svg>
            </button>
            {/* Wishlist */}
            <button
              onClick={handleAddToWishlist}
              className={`p-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full shadow-md active:scale-[0.97] transition-all ${favoriteLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={favoriteLoading}
              title={isFavorited ? t("product.remove_favorite") : t("product.add_favorite")}
            >
              {isFavorited ? (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20s-7-4.6-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.4-7 10-7 10Z" />
                </svg>
              )}
            </button>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              className="p-2 bg-indigo-500 text-white rounded-full shadow-md hover:bg-indigo-600 active:scale-[0.97] transition-all"
              title={t("product.add_to_cart")}
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 4H5L7.2 14.5C7.3 15 7.8 15.4 8.3 15.4H17.8C18.3 15.4 18.8 15 18.9 14.5L20.3 8.5H6.2" />
                <circle cx="9.2" cy="19" r="1.4" fill="currentColor" />
                <circle cx="17.2" cy="19" r="1.4" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Product Image ── */}
        <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gray-50/50 p-4 dark:bg-gray-800/50">
          <LazyImage
            src={product.image}
            alt={product.productName}
            className={`product-card-image max-w-full max-h-full object-contain transition-all duration-500 group-hover:scale-[1.06] ${
              product.hoverImage || (product.images && product.images[1]) ? "group-hover:opacity-0" : ""
            }`}
            loadingClassName="w-full h-full"
          />
          {(product.hoverImage || (product.images && product.images[1])) && (
            <LazyImage
              src={product.hoverImage || product.images[1]}
              alt={`${product.productName} alternate view`}
              className="product-card-image product-card-image-alt absolute max-w-full max-h-full object-contain p-5 transition-all duration-500 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-[1.06]"
              loadingClassName="absolute inset-0"
            />
          )}
        </div>

        {/* ── Product Info ── */}
        <div className="p-3.5">
          {/* Rating + sold count row */}
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} viewBox="0 0 20 20" fill="currentColor" className="text-yellow-400 w-3 h-3">
                    <path d="M10 2.8l2.2 4.4 4.9.7-3.5 3.4.8 4.8L10 14.7 5.6 16l.8-4.8L2.9 7.9l4.9-.7L10 2.8Z" />
                  </svg>
                ))}
              </div>
              <span className="text-[11px] text-gray-400 tabular-nums">({ratingDisplay})</span>
            </div>
            {soldCount && (
              <span className="text-[11px] text-gray-400">
                {t("product.sold_count", {
                  count: soldCount > 999 ? `${(soldCount / 1000).toFixed(1)}k` : soldCount,
                })}
              </span>
            )}
          </div>

          {/* Product Name */}
          <h3 className="mb-1 line-clamp-2 text-sm font-semibold leading-tight tracking-tight text-gray-900 dark:text-gray-100">
            {product.productName}
          </h3>

          {/* Mini specs */}
          {miniSpecs && (
            <p className="text-[11px] text-gray-400 mb-2 truncate">{miniSpecs}</p>
          )}

          {/* Price row */}
          <div className="flex items-center justify-between gap-2 mt-2">
            <div>
              <p className="text-base font-bold leading-none text-red-600 dark:text-red-500">
                {formatCurrency(price)}
              </p>
              {hasDiscount && (
                <div className="flex items-center gap-1.5 mt-1">
                  <p className="text-[11px] text-gray-400 line-through leading-none">
                    {formatCurrency(originalPrice)}
                  </p>
                  <span className="text-[10px] font-medium text-red-500 leading-none">
                    Tiết kiệm {formatCurrency(originalPrice - price)}
                  </span>
                </div>
              )}
            </div>
            {/* Stock indicator nếu còn ít */}
            {stock > 0 && stock < 10 && (
              <div className="flex flex-col items-center">
                <span className="text-xs text-red-600">Còn {stock} sản phẩm</span>
                <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden mt-0.5">
                  <div className="h-full bg-red-500" style={{ width: `${(stock / 10) * 100}%` }} />
                </div>
              </div>
            )}

            {/* Quick View */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowQuickView(true);
              }}
              className="opacity-0 group-hover:opacity-100 p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 active:scale-[0.97] transition-all shrink-0"
              title={t("product.quick_view")}
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5">
                <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={product}
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
      />
    </>
  );
};

export default ProductCard;