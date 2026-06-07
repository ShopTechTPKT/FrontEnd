import React from "react";

const solidMap = {
  primary: "bg-indigo-600 text-white border-indigo-600",
  success: "bg-emerald-600 text-white border-emerald-600",
  warning: "bg-amber-500 text-white border-amber-500",
  danger: "bg-red-600 text-white border-red-600",
  info: "bg-indigo-600 text-white border-indigo-600",
  neutral: "bg-gray-600 text-white border-gray-600",
};

const subtleMap = {
  primary: "bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-200 dark:border-indigo-800",
  success: "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200",
  warning: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200",
  danger: "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-200",
  info: "bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-200",
  neutral: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-200",
};

const outlineMap = {
  primary: "bg-transparent text-indigo-700 border-indigo-400 dark:text-indigo-300",
  success: "bg-transparent text-emerald-700 border-emerald-400 dark:text-emerald-300",
  warning: "bg-transparent text-amber-700 border-amber-400 dark:text-amber-300",
  danger: "bg-transparent text-red-700 border-red-400 dark:text-red-300",
  info: "bg-transparent text-indigo-700 border-indigo-400 dark:text-indigo-300",
  neutral: "bg-transparent text-gray-600 border-gray-300 dark:text-gray-300",
};

const dotColors = {
  primary: "bg-indigo-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
  info: "bg-indigo-500",
  neutral: "bg-gray-400",
};

const sizeClasses = {
  xs: "px-1.5 py-0.5 text-[10px] gap-1",
  sm: "px-2 py-0.5 text-[11px] gap-1",
  md: "px-2.5 py-1 text-xs gap-1.5",
};

function Badge({
  variant = "neutral",
  color,
  tone = "subtle",
  size = "md",
  dot = false,
  removable = false,
  onRemove,
  pill = true,
  pulse = false,
  className = "",
  children,
}) {
  const c = color ?? variant;
  const maps = { solid: solidMap, subtle: subtleMap, outline: outlineMap };
  const toneMap = maps[tone] || subtleMap;
  const shape = pill ? "rounded-full" : "rounded-md";

  return (
    <span
      className={[
        "inline-flex items-center border font-medium",
        toneMap[c] || toneMap.neutral,
        sizeClasses[size] || sizeClasses.md,
        shape,
        pulse ? "animate-pulse" : "",
        className,
      ].join(" ")}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotColors[c] || dotColors.neutral} ${pulse ? "animate-ping" : ""}`}
        />
      )}
      {children}
      {removable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="-mr-0.5 ml-0.5 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10"
          aria-label="Remove"
        >
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
}

export default Badge;
