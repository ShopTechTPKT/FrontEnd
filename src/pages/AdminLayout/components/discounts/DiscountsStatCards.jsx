import React from "react";
import { FaTicketAlt, FaToggleOn, FaToggleOff, FaPercent } from "react-icons/fa";

export default function DiscountsStatCards({ discounts, t }) {
  const avgPct =
    discounts.length > 0
      ? (() => {
          const avg =
            discounts.reduce((sum, d) => {
              const rate = d.discountRate || 0;
              const percentage = rate <= 1 ? rate * 100 : rate;
              return sum + percentage;
            }, 0) / discounts.length;
          return `${avg.toFixed(1)}%`;
        })()
      : "0%";

  const cards = [
    {
      label: t("admin.discount_total") || "Tổng Discount",
      value: discounts.length,
      icon: FaTicketAlt,
      iconClass: "text-[var(--color-info)] text-xl",
    },
    {
      label: t("admin.discount_active") || "Đang hoạt động",
      value: discounts.filter((d) => d.discountStatus).length,
      icon: FaToggleOn,
      iconClass: "text-[var(--color-success)] text-xl",
    },
    {
      label: t("admin.discount_expired") || "Đã hết hạn",
      value: discounts.filter((d) => !d.discountStatus).length,
      icon: FaToggleOff,
      iconClass: "text-[var(--color-danger)] text-xl",
    },
    {
      label: t("admin.discount_avg") || "Giảm giá TB",
      value: avgPct,
      icon: FaPercent,
      iconClass: "text-[var(--color-primary)] text-xl",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {cards.map(({ label, value, icon: Icon, iconClass }) => (
        <div
          key={label}
          className="admin-card p-4 rounded-[var(--radius-lg)]"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--color-text-muted)]">{label}</p>
              <p className="text-2xl font-bold text-[var(--color-text)]">{value}</p>
            </div>
            <Icon className={iconClass} />
          </div>
        </div>
      ))}
    </div>
  );
}
