import React from "react";
import { Link } from "react-router-dom";

/**
 * PageHeader — Reusable page header with title, subtitle, breadcrumb, and actions.
 *
 * @param {string}   title      — Main heading
 * @param {string}   subtitle   — Optional description text
 * @param {Array}    breadcrumb — [{label, to}] array for breadcrumb trail
 * @param {ReactNode} actions   — Right-side action buttons
 * @param {ReactNode} icon      — Optional icon element before title
 * @param {string}   className  — Extra classes
 */
const PageHeader = ({
  title,
  subtitle,
  breadcrumb = [],
  actions,
  icon,
  className = "",
}) => {
  return (
    <div className={`mb-6 animate-fadeIn ${className}`}>
      {/* Breadcrumb */}
      {breadcrumb.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] mb-3">
          {breadcrumb.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && (
                <svg className="w-3 h-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
              {crumb.to ? (
                <Link
                  to={crumb.to}
                  className="hover:text-[var(--color-primary)] transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-[var(--color-text-secondary)] font-medium">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Title row */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-500)] flex items-center justify-center text-white shadow-md">
              {icon}
            </div>
          )}
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--color-text)] tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
