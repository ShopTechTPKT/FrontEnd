import React, { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import formatCurrency from "../../utils/formatCurrency";

/**
 * SmartRecommendation — "Có thể bạn quan tâm"
 * Uses RecentlyViewed localStorage + same category to suggest products.
 */
const SmartRecommendation = ({ products = [], maxItems = 12 }) => {
  const { t } = useTranslation();
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Get recently viewed from localStorage
  const [recentIds, setRecentIds] = useState([]);
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
      setRecentIds(stored.map((p) => p.productID || p.id));
    } catch { setRecentIds([]); }
  }, []);

  // Build recommendations: products in same categories as recently viewed
  const recommendations = React.useMemo(() => {
    if (!products.length) return [];
    const recentCategories = new Set();
    recentIds.forEach((id) => {
      const product = products.find((p) => (p.productID || p.id || p.item?.productID) === id);
      if (product) recentCategories.add(product.categoryId || product.categoryName);
    });

    // Prioritize same-category items, exclude already viewed
    const scored = products
      .filter((p) => !recentIds.includes(p.productID || p.id || p.item?.productID))
      .map((p) => ({
        ...p,
        score: recentCategories.has(p.categoryId || p.categoryName) ? 10 : (p.isHot ? 5 : (p.rating > 4 ? 3 : 1)),
      }))
      .sort((a, b) => b.score - a.score);

    return scored.slice(0, maxItems);
  }, [products, recentIds, maxItems]);

  const updateScrollButtons = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollButtons);
    updateScrollButtons();
    return () => el.removeEventListener("scroll", updateScrollButtons);
  }, [recommendations]);

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 300, behavior: "smooth" });
  };

  if (recommendations.length < 3) return null;

  return (
    <section className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="inline-block h-6 w-1 rounded-full bg-indigo-500" />
          <h2 className="text-xl font-bold tracking-tight text-[var(--color-text)]">
            {t("home.may_like", { defaultValue: "Có thể bạn quan tâm" })} ✨
          </h2>
        </div>
        <div className="flex gap-2">
          <button onClick={() => scroll(-1)} disabled={!canScrollLeft} className="w-8 h-8 rounded-full border border-[var(--color-border)] flex items-center justify-center disabled:opacity-30 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={() => scroll(1)} disabled={!canScrollRight} className="w-8 h-8 rounded-full border border-[var(--color-border)] flex items-center justify-center disabled:opacity-30 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-thin scroll-smooth pb-2" style={{ scrollSnapType: "x mandatory" }}>
        {recommendations.map((product, idx) => {
          const id = product.productID || product.id || product.item?.productID;
          const name = product.productName || product.name || product.item?.productName || "";
          const price = product.price || product.unitPrice || product.item?.price || 0;
          const image = product.image || product.imageUrl || product.item?.imageUrl || "";

          return (
            <Link
              key={id || idx}
              to={`/productdetail/${id}`}
              className="flex-shrink-0 w-44 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] overflow-hidden hover:shadow-md hover:border-[var(--color-primary-300)] transition-all group"
              style={{ scrollSnapAlign: "start" }}
            >
              <div className="aspect-square bg-[var(--color-bg-muted)] overflow-hidden">
                <img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
              </div>
              <div className="p-3">
                <p className="text-xs font-medium text-[var(--color-text)] line-clamp-2 mb-2 leading-snug">{name}</p>
                <p className="text-sm font-bold text-[var(--color-primary)]">{formatCurrency(price)}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default React.memo(SmartRecommendation);
