import React, { useCallback, useRef, useState } from "react";

const variantClasses = {
  primary:
    "bg-violet-700 text-white shadow-xs hover:bg-violet-800 hover:shadow-sm focus-visible:ring-violet-700/30",
  secondary:
    "bg-violet-100 text-violet-900 hover:bg-violet-200 focus-visible:ring-violet-500/25 dark:bg-violet-950/60 dark:text-violet-100 dark:hover:bg-violet-900/80",
  outline:
    "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 focus-visible:ring-gray-400/20",
  ghost:
    "bg-transparent text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:ring-gray-400/20",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600/30",
  success:
    "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-600/30",
  link: "bg-transparent text-violet-700 dark:text-violet-400 hover:underline shadow-none px-0 h-auto focus-visible:ring-violet-500/30 underline-offset-4",
  gradient:
    "text-white shadow-md hover:shadow-lg focus-visible:ring-violet-500/30 bg-gradient-to-br from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700",
};

const sizeClasses = {
  xs: "h-7 px-2.5 text-xs gap-1 rounded-md min-h-[28px]",
  sm: "h-8 px-3 text-xs gap-1.5 rounded-lg min-h-[32px]",
  md: "h-10 px-4 text-sm gap-2 rounded-[10px] min-h-[40px]",
  lg: "h-12 px-6 text-base gap-2 rounded-xl min-h-[48px]",
  xl: "h-14 px-8 text-lg gap-2.5 rounded-xl min-h-[56px]",
};

function RippleLayer({ ripples }) {
  return (
    <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
      {ripples.map((r) => (
        <span
          key={r.id}
          className="absolute animate-ping rounded-full bg-white/40"
          style={{
            left: r.x,
            top: r.y,
            width: r.size,
            height: r.size,
            animationDuration: "600ms",
          }}
        />
      ))}
    </span>
  );
}

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
  ripple = true,
  children,
}) {
  const [ripples, setRipples] = useState([]);
  const btnRef = useRef(null);
  const isDisabled = disabled || loading;
  const startIcon = leftIcon ?? icon;

  const spawnRipple = useCallback(
    (e) => {
      if (!ripple || isDisabled || variant === "link") return;
      const el = btnRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const size = Math.max(rect.width, rect.height) * 1.2;
      const id = `${Date.now()}-${Math.random()}`;
      setRipples((prev) => [...prev.slice(-2), { id, x: x - size / 2, y: y - size / 2, size }]);
      window.setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 650);
    },
    [ripple, isDisabled, variant]
  );

  const handleClick = (e) => {
    spawnRipple(e);
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
        variant === "link" ? "" : "active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-gray-900",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
        variantClasses[variant] || variantClasses.primary,
        sizeClasses[size] || sizeClasses.md,
        fullWidth ? "w-full" : "",
        active && variant !== "link" ? "ring-2 ring-violet-500/40" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {variant !== "link" && ripples.length > 0 ? <RippleLayer ripples={ripples} /> : null}
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
