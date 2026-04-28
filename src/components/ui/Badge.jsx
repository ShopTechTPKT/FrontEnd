import React from "react";

/**
 * Badge — Small status indicator used across the app.
 *
 * Variants: success | danger | warning | info | neutral | primary
 * Sizes:    sm | md
 * Props:    dot (shows colored dot before text)
 */

const variantClasses = {
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  danger:  "bg-red-50 text-red-700 border-red-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  info:    "bg-blue-50 text-blue-700 border-blue-200",
  neutral: "bg-gray-100 text-gray-600 border-gray-200",
  primary: "bg-violet-50 text-violet-700 border-violet-200",
};

const dotColors = {
  success: "bg-emerald-500",
  danger:  "bg-red-500",
  warning: "bg-amber-500",
  info:    "bg-blue-500",
  neutral: "bg-gray-400",
  primary: "bg-violet-500",
};

const sizeClasses = {
  sm: "px-2 py-0.5 text-[11px]",
  md: "px-2.5 py-1 text-xs",
};

function Badge({
  variant = "neutral",
  size = "md",
  dot = false,
  className = "",
  children,
}) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 font-medium rounded-full border",
        variantClasses[variant] || variantClasses.neutral,
        sizeClasses[size] || sizeClasses.md,
        className,
      ].join(" ")}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant] || dotColors.neutral}`} />
      )}
      {children}
    </span>
  );
}

export default Badge;
