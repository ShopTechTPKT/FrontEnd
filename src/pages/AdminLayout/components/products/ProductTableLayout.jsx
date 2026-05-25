import React from "react";

/**
 * Shared shell for admin product list pages: title row + optional toolbar (actions, search).
 */
export default function ProductTableLayout({ 
  title, 
  subtitle,
  itemCount,
  toolbar, 
  viewToggle,
  children, 
  className = "" 
}) {
  return (
    <div className={`admin-card p-4 sm:p-6 shadow-sm ${className}`.trim()}>
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text)] tracking-tight">
              {title}
            </h2>
            {itemCount !== undefined && (
              <span className="px-2.5 py-0.5 rounded-full bg-[var(--color-primary-subtle)] text-[var(--color-primary)] text-xs font-semibold border border-[var(--color-primary)]/20">
                {itemCount}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">{subtitle}</p>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {toolbar}
          {viewToggle && (
            <div className="hidden sm:flex border-l border-[var(--color-border)] pl-3 ml-1">
              {viewToggle}
            </div>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
