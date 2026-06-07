import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

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
    accent: "from-indigo-950/70 via-indigo-900/40 to-transparent",
  },
  {
    id: 3,
    image: banner3,
    titleKey: "banner.hero_slides.flash_deal.title",
    subtitleKey: "banner.hero_slides.flash_deal.subtitle",
    ctaLabelKey: "banner.hero_slides.flash_deal.cta",
    ctaPath: "/deals",
    accent: "from-indigo-950/75 via-indigo-900/40 to-transparent",
  },
  {
    id: 4,
    image: banner4,
    titleKey: "banner.hero_slides.accessories.title",
    subtitleKey: "banner.hero_slides.accessories.subtitle",
    ctaLabelKey: "banner.hero_slides.accessories.cta",
    ctaPath: "/all_products",
    accent: "from-indigo-950/75 via-indigo-900/40 to-transparent",
  },
];

const AUTOPLAY_INTERVAL = 7000; // 7s — thoải mái hơn

const HeroBanner = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef(null);

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
            className="mt-5 inline-flex items-center gap-2 bg-white text-indigo-600 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-indigo-50 transition-colors shadow-sm active:scale-[0.97] animate-fadeInUp"
            style={{ animationDelay: "120ms" }}
          >
            {t(slide.ctaLabelKey)}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Bottom: Dots only */}
        <div className="flex flex-col gap-4">
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
