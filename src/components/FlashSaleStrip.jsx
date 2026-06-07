import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axiosInstance from "../custom/axios";
import formatCurrency from "../utils/formatCurrency";

/* ── helpers ─────────────────────────────────────────── */
const calcTimeLeft = (endDate) => {
  const diff = new Date(endDate) - new Date();
  if (diff <= 0) return null;
  return {
    h: Math.floor(diff / 3_600_000),
    m: Math.floor((diff % 3_600_000) / 60_000),
    s: Math.floor((diff % 60_000) / 1_000),
  };
};

const pad = (n) => String(n).padStart(2, "0");

/* ── Removed Mock data ──────── */
/* ── Countdown cell ─────────────────────────────────── */
const TimeCell = React.memo(({ value, label }) => (
  <div className="flex min-w-[2.5rem] flex-col items-center">
    <span className="rounded-lg border border-white/20 bg-white/15 px-2 py-1 font-mono text-base font-bold leading-none text-white tabular-nums shadow-inner dark:bg-indigo-950/40">
      {pad(value)}
    </span>
    <span className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wide">{label}</span>
  </div>
));

const Colon = () => (
  <span className="text-indigo-400 font-bold text-base self-start mt-1 px-0.5 leading-none">:</span>
);

const FlashSaleItem = React.memo(({ item, progress, onNavigate }) => (
  <button
    onClick={() => onNavigate(`/product/${item.id}/productAbout`)}
    className="group flex-shrink-0 w-40 bg-white rounded-2xl border border-gray-100 hover:border-red-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden text-left shadow-sm product-card-hover"
  >
    {/* Image */}
    <div className="relative">
      <div className="aspect-square bg-gray-50 overflow-hidden">
        <img
          src={item.imageUrl}
          alt={item.productName}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 product-card-image"
          onError={(e) => { e.target.src = "https://via.placeholder.com/200?text=SP"; }}
        />
      </div>
      {/* Discount badge */}
      <div className="absolute top-1.5 left-1.5 bg-discount-badge text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md leading-none">
        -{item.discount}%
      </div>
    </div>

    <div className="p-2">
      {/* Name */}
      <p className="text-[11px] text-gray-700 font-medium line-clamp-2 leading-tight mb-1.5">
        {item.productName}
      </p>

      {/* Price */}
      <p className="text-sm font-bold text-[var(--color-flash-sale)] leading-none">
        {formatCurrency(item.salePrice)}
      </p>
      <p className="text-[10px] text-gray-400 line-through mt-0.5">
        {formatCurrency(item.originalPrice)}
      </p>

      {/* Progress bar */}
      <div className="mt-2">
        <div className="flex justify-between text-[10px] text-gray-500 mb-0.5">
          <span>Đã bán {item.sold}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background:
                progress >= 80
                  ? "var(--color-flash-sale)"   // red — sắp hết
                  : progress >= 50
                  ? "var(--color-primary-500)"   // indigo-500 — trung bình
                  : "var(--color-primary)",  // indigo-600 — còn nhiều
            }}
          />
        </div>
        {progress >= 80 && (
          <p className="text-[10px] text-[var(--color-flash-sale)] font-medium mt-0.5 flex items-center gap-0.5">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5 text-[var(--color-hot-badge)]">
              <path d="M12 2C9 7 4 8 4 13a8 8 0 0016 0c0-4-3-7-5-9-1 2-2 3-3 3s0-5 0-5z"/>
            </svg>
            Sắp hết hàng!
          </p>
        )}
      </div>
    </div>
  </button>
));

/* ── Main component ─────────────────────────────────── */
const FlashSaleStrip = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [endTime, setEndTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pulseS, setPulseS] = useState(false);
  const scrollRef = useRef(null);
  const timerRef = useRef(null);

  /* Fetch flash sale */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosInstance.get("/flash-sales/active");
        if (res.data && res.data.id) {
          const fs = res.data;
          // Map real data
          const mapped = (fs.items || fs.products || []).map((it) => ({
            id: it.productId || it.id,
            productName: it.productName || it.name,
            imageUrl: it.imageUrl || it.image,
            originalPrice: it.originalPrice || it.unitPrice || 0,
            salePrice: it.salePrice || it.discountPrice || 0,
            discount: it.discountPercent || it.discount || 0,
            sold: it.soldCount || it.sold || 0,
            total: it.totalQuantity || it.total || 100,
          }));
          setItems(mapped);
          setEndTime(fs.endTime || fs.endDate);
        } else {
          // No active flash sale
          setItems([]);
        }
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* Countdown tick */
  useEffect(() => {
    if (!endTime) return;
    const tick = () => {
      const tl = calcTimeLeft(endTime);
      setTimeLeft(tl);
      // Pulse on each second change
      setPulseS(true);
      setTimeout(() => setPulseS(false), 300);
    };
    tick();
    timerRef.current = setInterval(tick, 1_000);
    return () => clearInterval(timerRef.current);
  }, [endTime]);

  /* Horizontal drag scroll */
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const onMouseDown = (e) => {
    isDragging.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
  };
  const onMouseMove = (e) => {
    if (!isDragging.current) return;
    const x = e.pageX - scrollRef.current.offsetLeft;
    scrollRef.current.scrollLeft = scrollLeft.current - (x - startX.current);
  };
  const onMouseUp = () => { isDragging.current = false; };

  if (loading || !items.length) return null;

  return (
    <section className="bg-white border-b border-gray-100">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4">
        {/* Header row — gradient banner */}
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gradient-to-r from-[var(--color-flash-sale)] to-[var(--color-hot-badge)] px-3 py-1.5 rounded-xl shadow-sm shadow-red-200/50">
              {/* Lightning bolt */}
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
              <h2 className="text-sm font-bold text-white tracking-tight">Flash Sale</h2>
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-white/20 text-white rounded-full uppercase tracking-wider">HOT</span>
            </div>

            {/* Countdown */}
            {timeLeft ? (
              <div className="flex items-center gap-1">
                <TimeCell value={timeLeft.h} label="Giờ" />
                <Colon />
                <TimeCell value={timeLeft.m} label="Phút" />
                <Colon />
                <div className={`transition-transform duration-150 ${pulseS ? "scale-110" : "scale-100"}`}>
                  <TimeCell value={timeLeft.s} label="Giây" />
                </div>
              </div>
            ) : (
              <span className="text-xs text-[var(--color-flash-sale)] font-medium">Đã kết thúc</span>
            )}
          </div>

          {/* Right: see all */}
          <button
            onClick={() => navigate("/deals")}
            className="text-sm text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1 transition-colors"
          >
            Xem tất cả
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Scrollable product strip */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-1 select-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          {items.map((item) => {
            const progress = Math.min(100, Math.round((item.sold / item.total) * 100));
            return (
              <FlashSaleItem 
                key={item.id} 
                item={item} 
                progress={progress} 
                onNavigate={navigate} 
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FlashSaleStrip;
