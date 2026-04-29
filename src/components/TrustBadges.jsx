import React from "react";
import { useTranslation } from "react-i18next";
import AnimatedCounter from "./ui/AnimatedCounter";

/* ── Icons ─────────────────────────────────────────── */
const IconTruck = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M9 17a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M1 1h11l2.68 6.39a1 1 0 01.07.36L16 13h5l-2 4H9M1 1L3 7h12" />
  </svg>
);

const IconShield = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const IconReturn = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const IconLock = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const IconHeadset = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M3 18v-6a9 9 0 0118 0v6" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" />
  </svg>
);

/* ── Badges data ─────────────────────────────────── */
const BADGES = [
  {
    icon: <IconTruck />,
    label: "Miễn phí giao hàng",
    sub: "Đơn từ 500.000₫",
  },
  {
    icon: <IconShield />,
    label: "Bảo hành chính hãng",
    sub: "12 - 36 tháng",
  },
  {
    icon: <IconReturn />,
    label: "Đổi trả dễ dàng",
    sub: "Trong vòng 15 ngày",
  },
  {
    icon: <IconLock />,
    label: "Thanh toán an toàn",
    sub: "VNPAY · MoMo · COD",
  },
  {
    icon: <IconHeadset />,
    label: "Hỗ trợ 24/7",
    sub: "Hotline: 1800-9999",
  },
];

/* ── Stats counters ──────────────────────────────── */
const STATS = [
  { value: 50000, suffix: "+", label: "Sản phẩm" },
  { value: 120000, suffix: "+", label: "Khách hàng" },
  { value: 15, suffix: "", label: "Chi nhánh" },
  { value: 99, suffix: "%", label: "Hài lòng" },
];

/* ── Component ───────────────────────────────────── */
const TrustBadges = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-white border-y border-gray-100">
      {/* ── Badge strip ── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap overflow-x-auto">
          {BADGES.map((badge, i) => (
            <div
              key={i}
              className="trust-badge animate-trustPop flex-shrink-0 flex-1 min-w-[140px] sm:min-w-0"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <span className="p-2 bg-violet-50 rounded-lg text-violet-700 flex-shrink-0">
                {badge.icon}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-900 leading-tight">
                  {badge.label}
                </p>
                <p className="text-[11px] text-gray-500 leading-tight mt-0.5">
                  {badge.sub}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Stats strip ── */}
      <div className="border-t border-gray-50 bg-gradient-to-r from-violet-50/50 via-white to-violet-50/50">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {STATS.map((stat, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <p className="text-lg font-bold text-violet-700 tabular-nums leading-none">
                  <AnimatedCounter
                    target={stat.value}
                    duration={1800}
                    delay={i * 150}
                  />
                  {stat.suffix}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustBadges;
