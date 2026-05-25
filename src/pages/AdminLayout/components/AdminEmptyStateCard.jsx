import React from "react";

export default function AdminEmptyStateCard({
  icon,
  title,
  description,
  action,
  className = "",
}) {
  return (
    <div className={`admin-empty-card max-w-lg mx-auto ${className}`.trim()}>
      {icon ? (
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--color-primary-subtle)] text-[var(--color-primary)] mb-4">
          {icon}
        </div>
      ) : null}
      <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
        {title}
      </h3>
      {description ? (
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-6">
          {description}
        </p>
      ) : null}
      {action}
    </div>
  );
}
