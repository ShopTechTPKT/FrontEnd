import { useEffect, useMemo, useState } from "react";
import formatCurrency from "../../utils/formatCurrency";
import { createPriceAlert, getProductPriceHistory } from "../../apis/productApi";
import getCurrentUserId from "../../utils/getCurrentUserId";
import notify from "../../utils/notify";

/**
 * PriceSparkline — Inline SVG sparkline showing 30-day mock price trend.
 * Green = price dropped, Red = price increased.
 * No external library — pure SVG polyline.
 */
export default function PriceSparkline({ productId, currentPrice = 0 }) {
  const [tooltip, setTooltip] = useState(null);
  const [history, setHistory] = useState([]);
  const [targetPrice, setTargetPrice] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchHistory = async () => {
      if (!productId) return;
      try {
        const rows = await getProductPriceHistory(productId, 30);
        if (!mounted) return;
        const normalized = rows.map((item, idx) => ({
          day: idx,
          price: Number(item.price || 0),
          date: new Date(item.recordedAt).toLocaleDateString("vi-VN"),
        }));
        setHistory(normalized);
      } catch (error) {
        console.error("Failed to fetch price history:", error);
      }
    };
    fetchHistory();
    return () => {
      mounted = false;
    };
  }, [productId]);

  const data = useMemo(() => {
    if (history.length > 0) {
      return history;
    }
    const base = currentPrice || 1000000;
    return [{ day: 0, price: base, date: new Date().toLocaleDateString("vi-VN") }];
  }, [currentPrice, history]);

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
  const lowestPrice = Math.min(...prices);

  const handleCreateAlert = async () => {
    const userId = getCurrentUserId();
    const parsedTarget = Number(targetPrice);

    if (!userId || !productId || Number.isNaN(parsedTarget) || parsedTarget <= 0) {
      notify.error("Vui long nhap muc gia hop le.");
      return;
    }

    setLoading(true);
    try {
      await createPriceAlert({ userId, productId, targetPrice: parsedTarget });
      notify.success("Da dat thong bao gia thanh cong.");
      setTargetPrice("");
    } catch (error) {
      console.error("Failed to create price alert:", error);
      notify.error("Khong the dat thong bao gia.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inline-flex flex-col gap-2">
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
        <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
          Gia thap nhat: {formatCurrency(lowestPrice)}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <input
          value={targetPrice}
          onChange={(e) => setTargetPrice(e.target.value)}
          type="number"
          min="0"
          placeholder="Dat muc gia can thong bao"
          className="h-8 w-48 rounded border border-gray-300 px-2 text-xs"
        />
        <button
          type="button"
          disabled={loading}
          onClick={handleCreateAlert}
          className="h-8 rounded bg-indigo-600 px-3 text-xs text-white disabled:opacity-60"
        >
          {loading ? "Dang luu..." : "Thong bao gia"}
        </button>
      </div>
    </div>
  );
}
