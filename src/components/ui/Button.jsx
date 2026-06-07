import React, { useRef } from "react";

const variantClasses = {
  primary:
    "bg-indigo-500 text-white shadow-sm hover:bg-indigo-600 hover:shadow-md active:bg-indigo-700 focus-visible:ring-indigo-500/30",
  secondary:
    "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 active:bg-indigo-200 focus-visible:ring-indigo-500/25 dark:bg-indigo-950/60 dark:text-indigo-100 dark:hover:bg-indigo-900/80",
  outline:
    "bg-white dark:bg-gray-900 text-slate-700 dark:text-gray-200 border border-slate-200 dark:border-gray-600 hover:bg-slate-50 hover:border-slate-300 dark:hover:bg-gray-800 active:bg-slate-100 focus-visible:ring-slate-400/20",
  ghost:
    "bg-transparent text-slate-600 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-800 active:bg-slate-200 focus-visible:ring-slate-400/20",
  danger:
    "bg-red-500 text-white hover:bg-red-600 active:bg-red-700 focus-visible:ring-red-500/30",
  success:
    "bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700 focus-visible:ring-emerald-500/30",
  link: "bg-transparent text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:underline shadow-none px-0 h-auto focus-visible:ring-indigo-500/30 underline-offset-4",
};

const sizeClasses = {
  xs: "h-7 px-2.5 text-xs gap-1 rounded-md min-h-[28px]",
  sm: "h-8 px-3 text-xs gap-1.5 rounded-lg min-h-[32px]",
  md: "h-10 px-4 text-sm gap-2 rounded-[10px] min-h-[40px]",
  lg: "h-12 px-6 text-base gap-2 rounded-xl min-h-[48px]",
  xl: "h-14 px-8 text-lg gap-2.5 rounded-xl min-h-[56px]",
};

/* Ripple removed for performance — CSS-only active state is used instead */

function Button({
  type = "button",
  variant = "primary",
  size = "md",
  className = "",
  onClick,
  disabled = false,
  loading = false,
  icon,
  leftIcon,
  rightIcon,
  fullWidth = false,
  active = false,
  children,
}) {
  const btnRef = useRef(null);
  const isDisabled = disabled || loading;
  const startIcon = leftIcon ?? icon;

  const handleClick = (e) => {
    onClick?.(e);
  };

  return (
    <button
      ref={btnRef}
      type={type}
      onClick={handleClick}
      disabled={isDisabled}
      data-active={active || undefined}
      className={[
        "relative isolate inline-flex items-center justify-center font-medium overflow-hidden",
        "transition-all duration-200",
        variant === "link" ? "" : "active:scale-[0.97]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-gray-900",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
        variantClasses[variant] || variantClasses.primary,
        sizeClasses[size] || sizeClasses.md,
        fullWidth ? "w-full" : "",
        active && variant !== "link" ? "ring-2 ring-indigo-500/40" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {loading ? (
        <span className="relative z-10 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : startIcon ? (
        <span className="relative z-10 flex h-4 w-4 shrink-0 items-center justify-center [&>svg]:h-full [&>svg]:w-full">
          {startIcon}
        </span>
      ) : null}
      {children ? <span className="relative z-10">{children}</span> : null}
      {!loading && rightIcon ? (
        <span className="relative z-10 flex h-4 w-4 shrink-0 items-center justify-center [&>svg]:h-full [&>svg]:w-full">
          {rightIcon}
        </span>
      ) : null}
    </button>
  );
}

function ButtonGroup({ className = "", children }) {
  return (
    <div
      className={[
        "inline-flex rounded-xl overflow-hidden shadow-xs border border-gray-200 dark:border-gray-600",
        "[&>button]:rounded-none [&>button]:shadow-none [&>button]:ring-0 [&>button]:focus-visible:z-10",
        "[&>button]:border-0 [&>button+button]:border-l [&>button+button]:border-gray-200 dark:[&>button+button]:border-gray-600",
        className,
      ].join(" ")}
      role="group"
    >
      {children}
    </div>
  );
}

export default Button;
export { ButtonGroup };
