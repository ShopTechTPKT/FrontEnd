import React, { useState } from "react";
import { useTranslation } from "react-i18next";

export default function WeekdayRevenueChart({ data }) {
  const { t } = useTranslation("translation");
  const [tooltip, setTooltip] = useState(null);
  const normalized = Array.isArray(data) ? data : [data];
  const entries = normalized.slice(0, 7);
  const maxVal = Math.max(1, ...entries.map(e => Number(e.value || 0)));

  const dayNames = [
    t("admin.day_mon"), t("admin.day_tue"), t("admin.day_wed"),
    t("admin.day_thu"), t("admin.day_fri"), t("admin.day_sat"), t("admin.day_sun"),
  ];

  return (
    <div className="w-full h-full flex flex-col p-2 relative">
      <div className="text-center mb-2 flex-shrink-0">
        <div className="text-sm font-semibold text-[var(--color-text)]">
          {t("admin.weekday_revenue")}
        </div>
        <div className="text-xs text-[var(--color-text-muted)]">
          {t("admin.revenue_total")}: {(entries.reduce((sum, e) => sum + Number(e.value || 0), 0) / 1000000).toFixed(1)}M VNĐ
        </div>
      </div>

      <div className="flex-grow flex items-end justify-center gap-1 px-2">
        {entries.map((e, i) => {
          const value = Number(e.value || 0);
          const height = Math.max(20, Math.round((value / maxVal) * 80));
          const dayName = dayNames[i] || `Day ${i + 1}`;

          return (
            <div key={i} className="flex flex-col items-center flex-1">
              <div
                className="w-6 bg-gradient-to-t from-[var(--color-primary-)] to-[var(--color-primary-)] rounded-t transition-all duration-500 cursor-pointer hover:opacity-80"
                style={{ height: `${height}px` }}
                onMouseEnter={(ev) => {
                  const rect = ev.currentTarget.getBoundingClientRect();
                  setTooltip({
                    x: rect.left + rect.width / 2,
                    y: rect.top,
                    dayName,
                    value,
                  });
                }}
                onMouseLeave={() => setTooltip(null)}
              />
              <div className="text-xs mt-1 text-center text-[var(--color-text-secondary)]">
                {dayName}
              </div>
              <div className="text-xs font-bold text-[var(--color-text)]">
                {(value / 1000000).toFixed(1)}M
              </div>
            </div>
          );
        })}
      </div>

      {tooltip && (
        <div
          className="fixed z-[9999] px-3 py-2 rounded-[var(--radius-md)] shadow-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] backdrop-blur-md pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y - 6,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="text-sm font-semibold">{tooltip.dayName}</div>
          <div className="text-xs text-[var(--color-text-muted)]">
            {tooltip.value.toLocaleString()} VNĐ
          </div>
        </div>
      )}
    </div>
  );
}
