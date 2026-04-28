import { useState, useMemo } from "react";
import formatCurrency from "../../utils/formatCurrency";

/**
 * PriceSparkline — Inline SVG sparkline showing 30-day mock price trend.
 * Green = price dropped, Red = price increased.
 * No external library — pure SVG polyline.
 */
export default function PriceSparkline({ currentPrice = 0 }) {
  const [tooltip, setTooltip] = useState(null);

  // Generate mock 30-day price history based on current price
  const data = useMemo(() => {
    const base = currentPrice || 1000000;
    return Array.from({ length: 30 }, (_, i) => {
      const variation = (Math.sin(i * 0.5) * 0.08 + (Math.random() - 0.5) * 0.06) * base;
      const price = Math.round(base + variation);
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return { day: i, price, date: date.toLocaleDateString("vi-VN") };
    });
  }, [currentPrice]);

  const prices = data.map((d) => d.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  const W = 120;
  const H = 36;
  const PAD = 2;

  const points = data
    .map((d, i) => {
      const x = PAD + (i / (data.length - 1)) * (W - PAD * 2);
      const y = PAD + (1 - (d.price - min) / range) * (H - PAD * 2);
      return `${x},${y}`;
    })
    .join(" ");

  // Determine trend color
  const firstPrice = data[0]?.price || 0;
  const lastPrice = data[data.length - 1]?.price || 0;
  const trendColor = lastPrice <= firstPrice ? "#22c55e" : "#ef4444";

  return (
    <div className="inline-flex items-center gap-2">
      <svg
        width={W}
        height={H}
        className="cursor-pointer"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const idx = Math.round((x / W) * (data.length - 1));
          if (data[idx]) setTooltip(data[idx]);
        }}
        onMouseLeave={() => setTooltip(null)}
      >
        <polyline
          points={points}
          fill="none"
          stroke={trendColor}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {tooltip && (
        <span className="text-[10px] text-gray-500 whitespace-nowrap">
          {tooltip.date}: {formatCurrency(tooltip.price)}
        </span>
      )}
    </div>
  );
}
