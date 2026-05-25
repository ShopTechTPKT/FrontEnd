import React, { useState } from "react";
import { useTranslation } from "react-i18next";

export default function GenericBarChart({ data, title }) {
  const { t } = useTranslation("translation");
  const [tooltip, setTooltip] = useState(null);
  const normalized = Array.isArray(data) ? data : [data];
  const entries = normalized.slice(0, 15);
  const maxVal = Math.max(
    1,
    ...entries.map(e =>
      Number(e.value || e.revenue || e.count || e.percentage || e.total || 0)
    )
  );

  return (
    <div className="w-full h-full p-4 relative">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-[var(--color-text)]">
          {title}
        </h3>
        <p className="text-xs font-medium mt-2 text-[var(--color-text-muted)]">
          {t("remaining.abc_inventory")}
        </p>
      </div>

      <div className="h-[350px] flex items-end justify-center gap-2 overflow-x-auto px-2 relative">
        <div className="absolute left-2 top-1/2 transform -rotate-90 -translate-y-1/2 z-10">
          <span className="text-xs font-medium text-[var(--color-text-muted)]">
            {t("remaining.abc_value_label")}
          </span>
        </div>

        <div className="ml-12 flex items-end justify-center gap-2 w-full">
          {entries.map((e, i) => {
            const v = Number(e.value || e.revenue || e.count || e.percentage || e.total || 0);
            const height = Math.max(35, Math.round((v / maxVal) * 280));
            const colors = [
              "bg-gradient-to-t from-[var(--color-primary-)] to-[var(--color-primary-)]",
              "bg-gradient-to-t from-green-600 to-green-400",
              "bg-gradient-to-t from-[var(--color-primary-)] to-[var(--color-primary-)]",
              "bg-gradient-to-t from-orange-600 to-orange-400",
              "bg-gradient-to-t from-red-600 to-red-400",
            ];
            const color = colors[i % colors.length];

            return (
              <div key={i} className="flex-shrink-0 flex flex-col items-center justify-end min-w-[50px] group">
                <div className="mb-1 text-xs font-bold text-[var(--color-text)] opacity-0 group-hover:opacity-100 transition-opacity">
                  {v.toLocaleString()}
                </div>
                <div
                  className={`${color} w-10 rounded-t-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer`}
                  style={{ height: `${height}px` }}
                  onMouseEnter={event => {
                    const rect = event.target.getBoundingClientRect();
                    setTooltip({
                      x: rect.left + rect.width / 2,
                      y: rect.top - 10,
                      data: e,
                      value: v,
                      group: e.group || e.category || "N/A",
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
                <div className="mt-2 text-xs font-medium text-[var(--color-text-secondary)] text-center max-w-[70px] leading-tight break-words">
                  {e.name || e.label || e.category || e.month || e.day || ""}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {tooltip && (
        <div
          className="fixed z-[9999] px-4 py-3 rounded-[var(--radius-md)] shadow-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] backdrop-blur-md"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y - 20}px`,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="text-center">
            <div className="text-lg font-bold mb-1">{tooltip.data.name || `ID: ${tooltip.data.productId}`}</div>
            <div className="text-sm text-[var(--color-text-muted)]">
              <span className="font-semibold text-[var(--color-text)]">{t("remaining.value_label")}:</span>{" "}
              {tooltip.value.toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
