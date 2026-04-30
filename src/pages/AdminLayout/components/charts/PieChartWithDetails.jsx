import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export default function PieChartWithDetails({ data, darkMode, title }) {
  const { t } = useTranslation("translation");
  const normalized = Array.isArray(data) ? data : [data];
  const entries = normalized.slice(0, 8);
  const total = entries.reduce(
    (sum, e) => sum + Number(e.totalRevenue || e.totalOrders || e.value || 0),
    0
  );

  if (total === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className={`text-lg ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          {t("admin.no_data")}
        </p>
      </div>
    );
  }

  const colors = [
    "#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444", "#06B6D4", "#F472B6", "#A78BFA"
  ];

  const chartData = entries.map((e, i) => ({
    name: e.name || e.label || e.category || "Other",
    value: Number(e.totalRevenue || e.totalOrders || e.value || 0),
    color: colors[i % colors.length]
  }));

  return (
    <div className="w-full h-full flex flex-col p-4">
      <h3 className={`text-lg font-bold text-center mb-4 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
        {title}
      </h3>
      <div className="flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: darkMode ? "#1F2937" : "#FFFFFF",
                borderColor: darkMode ? "#374151" : "#E5E7EB",
                color: darkMode ? "#F3F4F6" : "#1F2937"
              }}
              formatter={(value) => value.toLocaleString()}
            />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
