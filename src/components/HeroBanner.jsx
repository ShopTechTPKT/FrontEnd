import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import formatCurrency from "../utils/formatCurrency";
import useDebouncedValue from "../hooks/useDebouncedValue";

// Reuse existing banner images
import banner1 from "../assets/1.jpg";
import banner3 from "../assets/3.jpg";
import banner4 from "../assets/4.jpg";

const SLIDES = [
  {
    id: 1,
    image: banner1,
    titleKey: "banner.hero_slides.laptop.title",
    subtitleKey: "banner.hero_slides.laptop.subtitle",
    ctaLabelKey: "banner.hero_slides.laptop.cta",
    ctaPath: "/laptops",
    accent: "from-violet-900/70 via-violet-800/40 to-transparent",
  },
  {
    id: 3,
    image: banner3,
    titleKey: "banner.hero_slides.flash_deal.title",
    subtitleKey: "banner.hero_slides.flash_deal.subtitle",
    ctaLabelKey: "banner.hero_slides.flash_deal.cta",
    ctaPath: "/deals",
    accent: "from-violet-900/75 via-violet-800/40 to-transparent",
  },
  {
    id: 4,
    image: banner4,
    titleKey: "banner.hero_slides.accessories.title",
    subtitleKey: "banner.hero_slides.accessories.subtitle",
    ctaLabelKey: "banner.hero_slides.accessories.cta",
    ctaPath: "/all_products",
    accent: "from-violet-900/75 via-violet-800/40 to-transparent",
  },
];

const AUTOPLAY_INTERVAL = 7000; // 7s — thoải mái hơn

const removeVietnameseTones = (str) =>
  str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");

const HeroBanner = ({ products = [] }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef(null);
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 220);
  const suggestionListId = "hero-search-suggestions";

  // ── Auto-play ──────────────────────────────────────────────
  const startAutoplay = useCallback(() => {
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, AUTOPLAY_INTERVAL);
  }, []);

  const stopAutoplay = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    startAutoplay();
    return stopAutoplay;
  }, [startAutoplay, stopAutoplay]);

  const goTo = (idx) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    stopAutoplay();
    setCurrent(idx);
    startAutoplay();
    setTimeout(() => setIsTransitioning(false), 600);
  };

  const goNext = () => goTo((current + 1) % SLIDES.length);
  const goPrev = () => goTo((current - 1 + SLIDES.length) % SLIDES.length);

  // ── Search ─────────────────────────────────────────────────
  const filteredProducts = React.useMemo(() => {
    if (!debouncedSearchTerm.trim()) return [];
    return products.filter((p) => {
      const q = removeVietnameseTones(debouncedSearchTerm.toLowerCase());
      const name = removeVietnameseTones(
        (p.productName || p.item?.productName || "").toLowerCase()
      );
      return name.includes(q);
    });
  }, [products, debouncedSearchTerm]);

  const visibleSuggestions = filteredProducts.slice(0, 7);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!showSuggestions && visibleSuggestions.length > 0) {
        setShowSuggestions(true);
      }
      setSelectedSuggestionIndex((prev) =>
        Math.min(prev + 1, visibleSuggestions.length - 1)
      );
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) => Math.max(prev - 1, 0));
      return;
    }

    if (e.key === "Enter") {
      if (showSuggestions && selectedSuggestionIndex >= 0) {
        const picked = visibleSuggestions[selectedSuggestionIndex];
        const id = picked?.productID || picked?.item?.productID;
        if (id) {
          navigate(`/product/${id}/productAbout`);
          setShowSuggestions(false);
          setSearchTerm("");
          setSelectedSuggestionIndex(-1);
          return;
        }
      }
      handleSearch();
    }
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        searchRef.current && !searchRef.current.contains(e.target) &&
        suggestionsRef.current && !suggestionsRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const slide = SLIDES[current];

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: "clamp(320px, 52vw, 560px)" }}
      onMouseEnter={stopAutoplay}
      onMouseLeave={startAutoplay}
    >
      {/* ── Slides ── */}
      {SLIDES.map((s, idx) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <img
            src={s.image}
            alt={t(s.titleKey)}
            className="w-full h-full object-cover"
            loading={idx === 0 ? "eager" : "lazy"}
            fetchPriority={idx === 0 ? "high" : "auto"}
            decoding={idx === 0 ? "sync" : "async"}
          />
          {/* Gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-r ${s.accent}`} />
        </div>
      ))}

      {/* ── Content overlay ── */}
      <div className="absolute inset-0 z-20 flex flex-col justify-between py-8 px-6 md:px-12 lg:px-16">
        {/* Top: slide text */}
        <div className="max-w-lg">
          <p
            key={`sub-${current}`}
            className="text-white/80 text-sm font-medium tracking-wide mb-2 animate-fadeInUp"
          >
            {t(slide.subtitleKey)}
          </p>
          <h2
            key={`title-${current}`}
            className="text-white text-3xl md:text-4xl lg:text-5xl font-bold leading-tight animate-fadeInUp"
            style={{ animationDelay: "60ms" }}
          >
            {t(slide.titleKey)}
          </h2>
          <button
            key={`cta-${current}`}
            onClick={() => navigate(slide.ctaPath)}
            className="mt-5 inline-flex items-center gap-2 bg-white text-violet-700 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-violet-50 transition-colors shadow-md animate-fadeInUp"
            style={{ animationDelay: "120ms" }}
          >
            {t(slide.ctaLabelKey)}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Bottom: Search bar + dots */}
        <div className="flex flex-col gap-4">
          {/* Search bar */}
          <div className="relative max-w-xl" ref={searchRef}>
            <div className="flex items-center bg-white/95 backdrop-blur-md rounded-2xl shadow-lg overflow-visible">
              <svg
                className="absolute left-4 w-4 h-4 text-gray-400 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                />
              </svg>
              <input
                type="text"
                value={searchTerm}
                role="combobox"
                aria-expanded={showSuggestions}
                aria-controls={suggestionListId}
                aria-autocomplete="list"
                aria-activedescendant={
                  selectedSuggestionIndex >= 0
                    ? `${suggestionListId}-${selectedSuggestionIndex}`
                    : undefined
                }
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(e.target.value.trim().length > 0);
                  setSelectedSuggestionIndex(-1);
                }}
                onFocus={() => {
                  if (debouncedSearchTerm.trim()) setShowSuggestions(true);
                }}
                onKeyDown={handleKeyDown}
                placeholder={t("search.search_for_products") || "Tìm laptop, PC, linh kiện..."}
                className="flex-1 pl-10 pr-4 py-3 text-gray-900 text-sm bg-transparent outline-none placeholder-gray-400"
              />
              {searchTerm && (
                <button
                  onClick={() => { setSearchTerm(""); setShowSuggestions(false); }}
                  className="px-2 text-gray-400 hover:text-gray-600"
                  aria-label={t("common.clear") || "Xóa"}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <button
                onClick={handleSearch}
                className="m-1.5 px-4 py-2 bg-violet-700 text-white text-sm font-medium rounded-xl hover:bg-violet-800 transition-colors whitespace-nowrap"
              >
                {t("search.search") || "Tìm kiếm"}
              </button>
            </div>

            {/* Suggestions dropdown */}
            {showSuggestions && searchTerm.trim() && (
              <div
                ref={suggestionsRef}
                id={suggestionListId}
                role="listbox"
                className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 max-h-80 overflow-y-auto animate-fadeIn"
              >
                {filteredProducts.length > 0 ? (
                  <div className="py-1.5">
                    {visibleSuggestions.map((p, i) => {
                      const id = p.productID || p.item?.productID || i;
                      const name = p.productName || p.item?.productName || "";
                      const img = p.image || p.imageUrl || p.item?.imageUrl || "";
                      const price = p.price ?? p.item?.unitPrice ?? 0;
                      return (
                        <button
                          key={id}
                          id={`${suggestionListId}-${i}`}
                          role="option"
                          aria-selected={i === selectedSuggestionIndex}
                          onClick={() => {
                            navigate(`/product/${id}/productAbout`);
                            setShowSuggestions(false);
                            setSearchTerm("");
                            setSelectedSuggestionIndex(-1);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                            i === selectedSuggestionIndex
                              ? "bg-violet-50"
                              : "hover:bg-violet-50"
                          }`}
                        >
                          {img && (
                            <img src={img} alt={name} className="w-10 h-10 object-contain rounded-lg bg-gray-50" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
                            <p className="text-xs text-violet-700 font-medium">
                              {formatCurrency(price)}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                    {filteredProducts.length > 7 && (
                      <button
                        onClick={handleSearch}
                        className="w-full py-2.5 text-sm text-violet-700 font-medium text-center hover:bg-violet-50 border-t border-gray-100 transition-colors"
                      >
                        {t("search.view_all_results", { count: filteredProducts.length })}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="px-4 py-6 text-center text-sm text-gray-500">
                    {t("search.no_results")}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Dots + slide count */}
          <div className="flex items-center gap-3">
            {SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                className={`hero-dot ${idx === current ? "active" : ""}`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
            <span className="text-white/60 text-xs ml-2 tabular-nums">
              {current + 1} / {SLIDES.length}
            </span>
          </div>
        </div>
      </div>

      {/* ── Prev / Next arrows ── */}
      <button
        onClick={goPrev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 flex items-center justify-center bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full transition-colors"
        aria-label="Previous slide"
      >
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={goNext}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 flex items-center justify-center bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full transition-colors"
        aria-label="Next slide"
      >
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export default HeroBanner;

