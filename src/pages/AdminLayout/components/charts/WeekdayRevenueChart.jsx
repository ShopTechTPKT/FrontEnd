import React from "react";
import { useTranslation } from "react-i18next";

export default function WeekdayRevenueChart({ data, darkMode }) {
  const { t } = useTranslation("translation");
  const normalized = Array.isArray(data) ? data : [data];
  const entries = normalized.slice(0, 7);
  const maxVal = Math.max(1, ...entries.map(e => Number(e.value || 0)));

  const dayNames = [
    t("admin.day_mon"), t("admin.day_tue"), t("admin.day_wed"),
    t("admin.day_thu"), t("admin.day_fri"), t("admin.day_sat"), t("admin.day_sun"),
  ];

  return (
    <div className="w-full h-full flex flex-col p-2">
      <div className="text-center mb-2 flex-shrink-0">
        <div className={`text-sm font-semibold ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
          {t("admin.weekday_revenue")}
        </div>
        <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
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
                className="w-6 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t transition-all duration-500 cursor-pointer hover:opacity-80"
                style={{ height: `${height}px` }}
                title={`${dayName}: ${value.toLocaleString()} VNĐ`}
              ></div>
              <div className={`text-xs mt-1 text-center ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                {dayName}
              </div>
              <div className={`text-xs font-bold ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                {(value / 1000000).toFixed(1)}M
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
