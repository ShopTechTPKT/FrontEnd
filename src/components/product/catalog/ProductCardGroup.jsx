import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { addToCart } from "../../../utils/redux/cartSlice";
import LazyImage from "../../ui/LazyImage";

/* ── SVG Icons ───────────────────────────────────────── */
const CartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
);

const HeartIcon = ({ filled = false }) => (
  <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} className="w-4 h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const StarIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" className={`w-3 h-3 ${filled ? "text-amber-400" : "text-gray-200"}`} fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

/* ── Helpers ─────────────────────────────────────────── */
const getUserId = () => {
  try {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    return u?.customerID ?? u?.id ?? u?.customerId ?? null;
  } catch { return null; }
};

const formatVND = (n) =>
  parseInt(n || 0).toLocaleString("vi-VN") + "₫";

const isNew = (createdAt) => {
  if (!createdAt) return false;
  return (Date.now() - new Date(createdAt).getTime()) < 30 * 24 * 3600 * 1000;
};

/* ══════════════════════════════════════════════════════
   GRID VIEW CARD
══════════════════════════════════════════════════════ */
export default function ProductCardGroup({ product }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const pid      = product?.id || product?.productID;
  const name     = product?.name || product?.productName || "";
  const img      = product?.imageUrl || product?.image || "";
  const price    = product?.unitPrice || product?.price || 0;
  const oldPrice = product?.oldPrice;
  const rating   = Math.min(5, Math.max(0, Math.round(product?.rating || 0)));
  const reviews  = product?.reviews || product?.reviewCount || 0;
  const inStock  = product?.availability === "In Stock" || product?.inStock !== false;
  const badge    = isNew(product?.createdAt);

  const discountPct =
    oldPrice && oldPrice > price
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : null;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    dispatch(addToCart({
      userId: getUserId(),
      productId: pid,
      quantity: 1,
      productData: {
        id: pid,
        name,
        unitPrice: parseFloat(String(price).replace(/[^\d.-]/g, "")) || 0,
        imageUrl: img,
      },
    }));
    import("react-toastify").then(({ toast }) =>
      toast.success("Đã thêm vào giỏ hàng!")
    );
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    import("react-toastify").then(({ toast }) =>
      toast.info("Đã thêm vào danh sách yêu thích!")
    );
  };

  return (
    <div
      className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer
                 hover:-translate-y-1 hover:shadow-lg hover:border-violet-100
                 transition-all duration-300"
      onClick={() => navigate(`/product/${pid}/productAbout`)}
    >
      {/* ── Image area ── */}
      <div className="relative bg-gray-50 overflow-hidden">
        <LazyImage
          src={img}
          alt={name}
          className="w-full h-48 object-contain p-3 group-hover:scale-105 transition-transform duration-400"
          fallbackSrc="https://via.placeholder.com/200?text=SP"
          loadingClassName="w-full h-48"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discountPct && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md leading-none">
              -{discountPct}%
            </span>
          )}
          {badge && (
            <span className="bg-violet-700 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md leading-none">
              MỚI
            </span>
          )}
        </div>

        {/* Quick action overlay (appears on hover) */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300 flex items-end">
          <div className="w-full flex gap-2 p-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <button
              onClick={handleWishlist}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-gray-200
                         text-gray-500 hover:text-red-500 hover:border-red-200 transition-colors shrink-0"
              aria-label="Thêm yêu thích"
            >
              <HeartIcon />
            </button>
            <button
              onClick={handleAddToCart}
              className="flex-1 h-9 flex items-center justify-center gap-1.5 rounded-lg
                         bg-violet-700 text-white text-xs font-semibold hover:bg-violet-800 transition-colors"
              aria-label="Thêm vào giỏ hàng"
            >
              <CartIcon />
              <span>{t("product.add_to_cart") || "Thêm giỏ"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Info area ── */}
      <div className="p-3">
        {/* Stars */}
        <div className="flex items-center gap-0.5 mb-1.5">
          {Array.from({ length: 5 }, (_, i) => (
            <StarIcon key={i} filled={i < rating} />
          ))}
          {reviews > 0 && (
            <span className="text-[11px] text-gray-400 ml-1">({reviews})</span>
          )}
        </div>

        {/* Name */}
        <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug mb-2">
          {name.length > 60 ? name.slice(0, 60) + "…" : name}
        </p>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold text-gray-900">{formatVND(price)}</span>
          {oldPrice && oldPrice > price && (
            <span className="text-xs text-gray-400 line-through">{formatVND(oldPrice)}</span>
          )}
        </div>

        {/* Stock indicator */}
        <div className="mt-2 flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full ${inStock ? "bg-emerald-500" : "bg-red-400"}`} />
          <span className={`text-[11px] font-medium ${inStock ? "text-emerald-600" : "text-red-500"}`}>
            {inStock ? t("product.in_stock") || "Còn hàng" : t("product.check_availability") || "Hết hàng"}
          </span>
        </div>
      </div>
    </div>
  );
}
