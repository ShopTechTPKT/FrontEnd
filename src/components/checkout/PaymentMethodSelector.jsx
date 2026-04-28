import React from "react";

/**
 * PaymentMethodSelector — Card-based payment method selection.
 *
 * Props:
 *   selected  — current method id string
 *   onChange  — (methodId) => void
 */

const METHODS = [
  {
    id: "cod",
    label: "Thanh toán khi nhận hàng",
    sub: "Trả tiền mặt cho shipper",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-emerald-600">
        <rect x="2" y="6" width="20" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M6 12h.01M10 12h.01M14 12h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M2 10h20" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
    accent: "border-emerald-300 bg-emerald-50",
    dot: "bg-emerald-500",
  },
  {
    id: "vnpay",
    label: "VNPAY",
    sub: "Thanh toán qua cổng VNPAY",
    icon: (
      <div className="w-10 h-6 flex items-center justify-center">
        <svg viewBox="0 0 48 20" className="w-10">
          <rect width="48" height="20" rx="3" fill="#005BAA"/>
          <text x="6" y="14" fill="white" fontSize="10" fontWeight="bold" fontFamily="Arial">VNPAY</text>
        </svg>
      </div>
    ),
    accent: "border-blue-300 bg-blue-50",
    dot: "bg-blue-500",
  },
  {
    id: "bank",
    label: "Chuyển khoản ngân hàng",
    sub: "Thanh toán qua internet banking",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-blue-600">
        <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 10v11M16 10v11M12 10v11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    accent: "border-indigo-300 bg-indigo-50",
    dot: "bg-indigo-500",
  },
  {
    id: "momo",
    label: "Ví MoMo",
    sub: "Thanh toán qua ví điện tử MoMo",
    icon: (
      <div className="w-10 h-6 flex items-center justify-center">
        <svg viewBox="0 0 48 20" className="w-10">
          <rect width="48" height="20" rx="3" fill="#AE2070"/>
          <text x="8" y="14" fill="white" fontSize="9" fontWeight="bold" fontFamily="Arial">MoMo</text>
        </svg>
      </div>
    ),
    accent: "border-pink-300 bg-pink-50",
    dot: "bg-pink-500",
  },
];

const PaymentMethodSelector = ({ selected, onChange }) => {
  return (
    <div className="space-y-3">
      {METHODS.map((method) => {
        const isSelected = selected === method.id;
        return (
          <label
            key={method.id}
            htmlFor={`pay-${method.id}`}
            className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
              isSelected
                ? `${method.accent} shadow-sm`
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            {/* Radio */}
            <input
              type="radio"
              id={`pay-${method.id}`}
              name="payment_method"
              value={method.id}
              checked={isSelected}
              onChange={() => onChange(method.id)}
              className="sr-only"
            />
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                isSelected ? `border-violet-600 bg-violet-600` : "border-gray-300 bg-white"
              }`}
            >
              {isSelected && (
                <div className="w-2 h-2 rounded-full bg-white" />
              )}
            </div>

            {/* Icon */}
            <div className="shrink-0">{method.icon}</div>

            {/* Text */}
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">{method.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{method.sub}</p>
            </div>

            {/* Selected indicator */}
            {isSelected && (
              <div className={`w-2 h-2 rounded-full shrink-0 ${method.dot}`} />
            )}
          </label>
        );
      })}

      {/* VNPAY note */}
      {selected === "vnpay" && (
        <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100 animate-fadeIn">
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-blue-500 mt-0.5 shrink-0">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
            <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <p className="text-xs text-blue-700">
            Bạn sẽ được chuyển đến cổng thanh toán VNPAY an toàn sau khi đặt hàng.
            Hỗ trợ: Visa, MasterCard, ATM nội địa và QR Code.
          </p>
        </div>
      )}

      {selected === "bank" && (
        <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 animate-fadeIn">
          <p className="text-xs font-semibold text-indigo-800 mb-1">Thông tin chuyển khoản:</p>
          <div className="space-y-0.5 text-xs text-indigo-700">
            <p>Ngân hàng: <strong>Techcombank</strong></p>
            <p>STK: <strong>19036789012345</strong></p>
            <p>Chủ TK: <strong>CONG TY TNHH SHOPPC</strong></p>
            <p>Nội dung: <strong>Tên + SĐT + Mã đơn hàng</strong></p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelector;
