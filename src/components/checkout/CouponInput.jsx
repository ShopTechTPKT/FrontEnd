import { useState } from "react";
import { useTranslation } from "react-i18next";

/**
 * CouponInput — Inline coupon code input with validate button.
 * Calls /api/coupons/validate and displays result.
 *
 * Props:
 *   orderTotal: number — current order total for validation
 *   onApply: (discount) => void — callback when coupon is successfully applied
 *   apiBase: string — API base URL
 */
export default function CouponInput({ orderTotal = 0, onApply, apiBase = "" }) {
  const { t } = useTranslation();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleValidate = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`${apiBase}/api/coupons/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), orderTotal }),
      });
      const data = await res.json();
      setResult(data);
      if (data.valid && onApply) {
        onApply({
          code: code.trim(),
          discountPercent: data.discountPercent,
          discountAmount: data.discountAmount,
        });
      }
    } catch {
      setResult({ valid: false, message: "Loi ket noi" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder={t("coupon.placeholder") || "Nhap ma giam gia"}
          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 uppercase tracking-wider"
          maxLength={20}
          onKeyDown={(e) => e.key === "Enter" && handleValidate()}
        />
        <button
          onClick={handleValidate}
          disabled={loading || !code.trim()}
          className="px-4 py-2 bg-indigo-700 text-white text-sm font-medium rounded-lg hover:bg-indigo-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "..." : t("coupon.apply") || "Ap dung"}
        </button>
      </div>
      {result && (
        <p className={`text-xs ${result.valid ? "text-green-600" : "text-red-500"}`}>
          {result.message}
        </p>
      )}
    </div>
  );
}
