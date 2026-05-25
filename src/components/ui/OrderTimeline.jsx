import React from "react";
import { useTranslation } from "react-i18next";

const STEPS = [
  { key: "PENDING", icon: "📋" },
  { key: "CONFIRMED", icon: "✅" },
  { key: "PROCESSING", icon: "⚙️" },
  { key: "SHIPPED", icon: "🚚" },
  { key: "DELIVERED", icon: "📦" },
];

const STATUS_INDEX = {
  PENDING: 0,
  CONFIRMED: 1,
  PROCESSING: 2,
  SHIPPED: 3,
  DELIVERED: 4,
  CANCELLED: -1,
  RETURNED: -2,
};

/**
 * OrderTimeline — Visual step indicator for order status.
 * 
 * @param {string} status — Current order status (PENDING, CONFIRMED, etc.)
 */
const OrderTimeline = ({ status = "PENDING" }) => {
  const { t } = useTranslation();
  const currentIdx = STATUS_INDEX[status] ?? 0;

  if (currentIdx < 0) {
    // Cancelled or Returned
    const isCancelled = status === "CANCELLED";
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--color-danger-light)] border border-red-200 dark:border-red-900 dark:bg-red-950/20">
        <div className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center text-lg">
          {isCancelled ? "✕" : "↩"}
        </div>
        <div>
          <p className="font-semibold text-red-700 dark:text-red-400 text-sm">
            {isCancelled
              ? t("order.cancelled", { defaultValue: "Đơn hàng đã hủy" })
              : t("order.returned", { defaultValue: "Đơn hàng đã trả" })}
          </p>
          <p className="text-xs text-red-600/70 dark:text-red-400/60">
            {isCancelled
              ? t("order.cancelled_desc", { defaultValue: "Đơn hàng này đã bị hủy bỏ" })
              : t("order.returned_desc", { defaultValue: "Đơn hàng đã được trả lại" })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="order-timeline">
      {STEPS.map((step, idx) => {
        const isCompleted = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        const dotClass = isCompleted
          ? "completed"
          : isCurrent
          ? "current"
          : "pending";

        return (
          <React.Fragment key={step.key}>
            {idx > 0 && (
              <div
                className={`order-timeline-line ${isCompleted ? "completed" : ""}`}
              />
            )}
            <div className="order-timeline-step">
              <div className={`order-timeline-dot ${dotClass}`}>
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-sm">{step.icon}</span>
                )}
              </div>
              <span
                className={`order-timeline-label ${isCurrent || isCompleted ? "active" : ""}`}
              >
                {t(`order.status_${step.key.toLowerCase()}`, {
                  defaultValue: step.key,
                })}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default OrderTimeline;
