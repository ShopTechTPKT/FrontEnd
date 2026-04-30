import React, { useState } from "react";
import { useTranslation } from "react-i18next";

export default function TrendChart({ data, darkMode, title }) {
  const { t } = useTranslation("translation");
  const [tooltip, setTooltip] = useState(null);
  const normalized = Array.isArray(data) ? data : [data];
  const entries = normalized;
  const maxVal = Math.max(
    1,
    ...entries.map(e =>
      Number(e.value || e.revenue || e.count || e.percentage || e.total || 0)
    )
  );
  const minVal = Math.min(
    ...entries.map(e =>
      Number(e.value || e.revenue || e.count || e.percentage || e.total || 0)
    )
  );

  const dataRange = maxVal - minVal;
  const paddingRange = dataRange * 0.1;
  const adjustedMaxVal = maxVal + paddingRange;
  const adjustedMinVal = Math.max(0, minVal - paddingRange);

  const width = 1600;
  const height = 700;
  const padding = 100;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points = entries
    .map((e, i) => {
      const x = padding + (i / (entries.length - 1)) * chartWidth;
      const y =
        padding +
        chartHeight -
        ((Number(
          e.value || e.revenue || e.count || e.percentage || e.total || 0
        ) -
          adjustedMinVal) /
          (adjustedMaxVal - adjustedMinVal)) *
          chartHeight;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `${padding},${padding + chartHeight} ${points} ${
    padding + chartWidth
  },${padding + chartHeight}`;

  return (
    <div className="w-full h-full p-4 relative">
      <div className="text-center mb-4">
        <h3
          className={`text-lg font-bold ${
            darkMode ? "text-gray-200" : "text-gray-800"
          }`}
        >
          {title}
        </h3>
      </div>
      <div className="relative w-full h-full">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1600 700"
          className="overflow-visible"
        >
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop
                offset="0%"
                stopColor={darkMode ? "#3B82F6" : "#2563EB"}
                stopOpacity="0.4"
              />
              <stop
                offset="100%"
                stopColor={darkMode ? "#3B82F6" : "#2563EB"}
                stopOpacity="0.1"
              />
            </linearGradient>
          </defs>

          {[0, 0.5, 1].map((ratio, i) => (
            <line
              key={i}
              x1={padding}
              y1={padding + chartHeight - ratio * chartHeight}
              x2={padding + chartWidth}
              y2={padding + chartHeight - ratio * chartHeight}
              stroke={darkMode ? "#374151" : "#E5E7EB"}
              strokeWidth="2"
            />
          ))}

          {entries
            .filter((_, i) => i % 3 === 0)
            .map((_, i) => {
              const x = padding + ((i * 3) / (entries.length - 1)) * chartWidth;
              return (
                <line
                  key={i}
                  x1={x}
                  y1={padding}
                  x2={x}
                  y2={padding + chartHeight}
                  stroke={darkMode ? "#374151" : "#E5E7EB"}
                  strokeWidth="1"
                />
              );
            })}

          <polygon points={areaPoints} fill="url(#areaGradient)" />

          <polyline
            points={points}
            fill="none"
            stroke={darkMode ? "#60A5FA" : "#3B82F6"}
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-pulse"
            style={{ animationDuration: "3s" }}
          />

          {entries.map((e, i) => {
            const x = padding + (i / (entries.length - 1)) * chartWidth;
            const y =
              padding +
              chartHeight -
              ((Number(
                e.value || e.revenue || e.count || e.percentage || e.total || 0
              ) -
                adjustedMinVal) /
                (adjustedMaxVal - adjustedMinVal)) *
                chartHeight;
            const v = Number(
              e.value || e.revenue || e.count || e.percentage || e.total || 0
            );
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="6"
                fill={darkMode ? "#60A5FA" : "#3B82F6"}
                stroke={darkMode ? "#1E40AF" : "#1D4ED8"}
                strokeWidth="3"
                onMouseEnter={event => {
                  const rect = event.target.getBoundingClientRect();
                  setTooltip({
                    x: rect.left + rect.width / 2,
                    y: rect.top - 10,
                    name:
                      e.name || e.label || e.category || e.month || e.day || "",
                    value: v,
                  });
                }}
                onMouseLeave={() => setTooltip(null)}
                style={{ cursor: "pointer" }}
              />
            );
          })}
        </svg>

        {tooltip && (
          <div
            className={`fixed z-[9999] px-3 py-2 rounded-lg shadow-lg border ${
              darkMode
                ? "bg-gray-800 text-gray-100 border-gray-600"
                : "bg-white text-gray-800 border-gray-300"
            }`}
            style={{
              left: tooltip.x - 50,
              top: tooltip.y - 50,
              pointerEvents: "none",
            }}
          >
            <div className="text-sm font-semibold">{tooltip.name}</div>
            <div className="text-xs">
              {title?.toLowerCase().includes("orders")
                ? t("remaining.orders_label")
                : t("remaining.revenue")}
              : {tooltip.value.toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
