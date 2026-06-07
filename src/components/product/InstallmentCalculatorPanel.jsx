import { useMemo, useState } from "react";
import formatCurrency from "../../utils/formatCurrency";

const TERM_OPTIONS = [3, 6, 9, 12];
const INTEREST_OPTIONS = [0, 1.2, 1.6, 2.1];

export default function InstallmentCalculatorPanel({ price = 0 }) {
  const safePrice = Number(price || 0);
  const [downPercent, setDownPercent] = useState(30);
  const [termMonths, setTermMonths] = useState(6);
  const [monthlyRate, setMonthlyRate] = useState(0);

  const computed = useMemo(() => {
    const downPayment = (safePrice * downPercent) / 100;
    const financedAmount = Math.max(0, safePrice - downPayment);
    const totalInterest = financedAmount * (monthlyRate / 100) * termMonths;
    const totalInstallment = financedAmount + totalInterest;
    const monthlyPayment = termMonths > 0 ? totalInstallment / termMonths : 0;
    return { downPayment, financedAmount, totalInterest, monthlyPayment };
  }, [safePrice, downPercent, termMonths, monthlyRate]);

  if (!safePrice) return null;

  return (
    <div className="rounded-lg border border-indigo-200 bg-indigo-50/50 p-4">
      <h3 className="text-sm font-semibold text-indigo-800 mb-3">Ước tính trả góp</h3>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Trả trước</span>
            <span className="font-medium text-gray-800">{downPercent}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="70"
            step="5"
            value={downPercent}
            onChange={(e) => setDownPercent(Number(e.target.value))}
            className="w-full accent-indigo-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-gray-600">
            Kỳ hạn
            <select
              value={termMonths}
              onChange={(e) => setTermMonths(Number(e.target.value))}
              className="mt-1 h-9 w-full rounded-md border border-gray-200 bg-white px-2 text-sm text-gray-800"
            >
              {TERM_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m} tháng
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs text-gray-600">
            Lãi suất / tháng
            <select
              value={monthlyRate}
              onChange={(e) => setMonthlyRate(Number(e.target.value))}
              className="mt-1 h-9 w-full rounded-md border border-gray-200 bg-white px-2 text-sm text-gray-800"
            >
              {INTEREST_OPTIONS.map((rate) => (
                <option key={rate} value={rate}>
                  {rate}%
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="mt-4 space-y-1.5 rounded-md border border-gray-100 bg-white px-3 py-2.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Trả trước</span>
          <span className="font-medium text-gray-800">{formatCurrency(computed.downPayment)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Khoản vay</span>
          <span className="font-medium text-gray-800">{formatCurrency(computed.financedAmount)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Lãi dự kiến</span>
          <span className="font-medium text-gray-800">{formatCurrency(computed.totalInterest)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2">
          <span className="text-gray-700 font-semibold">Tạm tính mỗi tháng</span>
          <span className="text-sm font-bold text-indigo-700">
            {formatCurrency(computed.monthlyPayment)}
          </span>
        </div>
      </div>
    </div>
  );
}
