import { useMemo, useState } from "react";

const POINT_TO_VND = 100;

export default function LoyaltyPointsPanel({
  available = 0,
  cartTotal = 0,
  onApply,
}) {
  const [inputPoints, setInputPoints] = useState("");

  const maxUsablePoints = useMemo(() => {
    const byBalance = Math.max(0, Number(available) || 0);
    const byCart = Math.floor((Number(cartTotal) || 0) / POINT_TO_VND);
    return Math.max(0, Math.min(byBalance, byCart));
  }, [available, cartTotal]);

  const appliedPoints = useMemo(() => {
    const n = Number(inputPoints) || 0;
    return Math.max(0, Math.min(n, maxUsablePoints));
  }, [inputPoints, maxUsablePoints]);

  const discountAmount = appliedPoints * POINT_TO_VND;

  const handleApply = () => {
    onApply?.({
      points: appliedPoints,
      discountAmount,
    });
  };

  return (
    <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="mb-2 text-base font-semibold text-gray-900">
        Điểm thưởng
      </h2>
      <p className="mb-3 text-sm text-gray-600">
        Điểm hiện có: <span className="font-semibold text-violet-700">{available}</span>
        {" · "}Tỷ lệ quy đổi: 1 điểm = 100đ
      </p>
      <div className="flex gap-2">
        <input
          type="number"
          min={0}
          max={maxUsablePoints}
          value={inputPoints}
          onChange={(e) => setInputPoints(e.target.value)}
          placeholder={`Tối đa ${maxUsablePoints} điểm`}
          className="h-10 flex-1 rounded-md border border-gray-200 bg-gray-50 px-3 text-sm focus:border-violet-500 focus:ring-violet-500/30"
        />
        <button
          type="button"
          onClick={handleApply}
          className="rounded-md bg-violet-600 px-4 text-sm font-medium text-white hover:bg-violet-700"
        >
          Áp dụng
        </button>
      </div>
      {discountAmount > 0 && (
        <p className="mt-2 text-sm text-emerald-600">
          Giảm ngay {new Intl.NumberFormat("vi-VN").format(discountAmount)}đ
        </p>
      )}
    </div>
  );
}
