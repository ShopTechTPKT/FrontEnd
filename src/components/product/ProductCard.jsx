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

  const {
    isFavorited,
    loading: favoriteLoading,
    handleToggleFavorite,
  } = useFavorites(product?.productID);

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
  // Mini specs: parse from categoryName or seriesName
  const miniSpecs = product.seriesName || product.categoryName || null;

  return (
    <>
      <div
        className="group relative bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-transparent hover:border-violet-100"
        onClick={handleClick}
        style={{ willChange: "transform, box-shadow" }}
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

          {/* Discount badge */}
          {hasDiscount && (
            <span className="bg-discount-badge text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md leading-none shadow-sm">
              -{discountPct}%
            </span>
          )}
        </div>

        {/* Installment badge — top right corner */}
        {isExpensive && (
          <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-semibold px-1.5 py-0.5 rounded-md leading-none whitespace-nowrap">
              Trả góp 0%
            </span>
          </div>
        )}

        {/* ── Action Buttons (hover reveal) — when NOT expensive (no installment) ── */}
        <div
          className={`absolute z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
            isExpensive ? "top-10 right-3" : "top-3 right-3"
          }`}
        >
          <div className="flex flex-col gap-2">
            <button
              onClick={handleAddToCompare}
              className="p-2 bg-white rounded-full shadow-sm border border-gray-100 hover:bg-violet-50 hover:border-violet-200 transition-colors"
              title="Thêm so sánh"
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-gray-600">
                <path d="M4 7h8M4 12h12M4 17h8M17 5l3 3-3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {/* Wishlist */}
            <button
              onClick={handleAddToWishlist}
              className="p-2 bg-white rounded-full shadow-sm border border-gray-100 hover:bg-red-50 hover:border-red-200 transition-colors relative"
              disabled={isCheckingFavorite}
              title={isFavorited ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
            >
              <svg
                viewBox="0 0 24 24"
                fill={isFavorited ? "currentColor" : "none"}
                className={`w-4 h-4 transition-all ${isFavorited ? "text-red-500" : "text-gray-600"}`}
              >
                <path
                  d="M12 20s-7-4.6-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.4-7 10-7 10Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {isCheckingFavorite && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-3 border border-gray-700 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </button>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              className="p-2 bg-white rounded-full shadow-sm border border-gray-100 hover:bg-violet-50 hover:border-violet-200 transition-colors"
              title="Thêm vào giỏ hàng"
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-gray-600">
                <path
                  d="M3 4H5L7.2 14.5C7.3 15 7.8 15.4 8.3 15.4H17.8C18.3 15.4 18.8 15 18.9 14.5L20.3 8.5H6.2"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="9.2" cy="19" r="1.4" fill="currentColor" />
                <circle cx="17.2" cy="19" r="1.4" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Product Image ── */}
        <div className="aspect-square bg-gray-50/50 flex items-center justify-center p-5">
          <img
            src={product.image}
            alt={product.productName}
            className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-[1.06]"
            loading="lazy"
          />
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
                Đã bán {soldCount > 999 ? `${(soldCount / 1000).toFixed(1)}k` : soldCount}
              </span>
            )}
          </div>

          {/* Product Name */}
          <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 leading-tight tracking-tight">
            {product.productName}
          </h3>

          {/* Mini specs */}
          {miniSpecs && (
            <p className="text-[11px] text-gray-400 mb-2 truncate">{miniSpecs}</p>
          )}

          {/* Price row */}
          <div className="flex items-center justify-between gap-2">
            <div>
              {hasDiscount && (
                <p className="text-[11px] text-gray-400 line-through leading-none">
                  {formatCurrency(originalPrice)}
                </p>
              )}
              <p className="text-base font-bold text-violet-700 leading-tight">
                {formatCurrency(price)}
              </p>
            </div>

            {/* Quick View */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowQuickView(true);
              }}
              className="opacity-0 group-hover:opacity-100 p-2 bg-violet-700 text-white rounded-lg hover:bg-violet-800 transition-all duration-200 shrink-0"
              title="Xem nhanh"
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