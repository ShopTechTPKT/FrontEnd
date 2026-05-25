import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export default function PieChartWithDetails({ data, title }) {
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
        <p className="text-lg text-[var(--color-text-muted)]">
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
      <h3 className="text-lg font-bold text-center mb-4 text-[var(--color-text)]">
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
                backgroundColor: "var(--color-bg)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                color: "var(--color-text)",
              }}
              formatter={(value) => value.toLocaleString()}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              wrapperStyle={{ color: "var(--color-text-secondary)" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
