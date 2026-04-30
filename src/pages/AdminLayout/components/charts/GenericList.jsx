import React from "react";

export default function GenericList({ data, darkMode, valueKeyHint }) {
  const items = Array.isArray(data) ? data.slice(0, 8) : [];
  return (
    <ul className="divide-y divide-gray-700/30">
      {items.map((it, idx) => (
        <li key={idx} className="py-2 flex items-center justify-between">
          <span className={`text-sm ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
            {it.name || it.fullName || it.productName || it.categoryName || `#${idx + 1}`}
          </span>
          <span className={`text-sm font-semibold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
            {it[valueKeyHint] || it.revenue || it.totalSpent || it.count || it.orders || it.percentage || 0}
          </span>
        </li>
      ))}
      {items.length === 0 && (
        <li className={`py-6 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          No data
        </li>
      )}
    </ul>
  );
}
