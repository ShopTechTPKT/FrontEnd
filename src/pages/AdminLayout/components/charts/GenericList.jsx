import React from "react";

export default function GenericList({ data, valueKeyHint }) {
  const items = Array.isArray(data) ? data.slice(0, 8) : [];
  return (
    <ul className="divide-y divide-[var(--color-border)]">
      {items.map((it, idx) => (
        <li key={idx} className="py-2 flex items-center justify-between">
          <span className="text-sm text-[var(--color-text)]">
            {it.name || it.fullName || it.productName || it.categoryName || `#${idx + 1}`}
          </span>
          <span className="text-sm font-semibold text-[var(--color-text)]">
            {it[valueKeyHint] || it.revenue || it.totalSpent || it.count || it.orders || it.percentage || 0}
          </span>
        </li>
      ))}
      {items.length === 0 && (
        <li className="py-6 text-center text-[var(--color-text-muted)]">
          No data
        </li>
      )}
    </ul>
  );
}
