import React from "react";

const statusMap = {
  info: {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    subtle: "bg-indigo-50 text-indigo-900 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-100 dark:border-indigo-800",
    solid: "bg-indigo-600 text-white border-indigo-600",
  },
  success: {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    subtle: "bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-100 dark:border-emerald-800",
    solid: "bg-emerald-600 text-white border-emerald-600",
  },
  warning: {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    subtle: "bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/40 dark:text-amber-100 dark:border-amber-800",
    solid: "bg-amber-500 text-white border-amber-500",
  },
  error: {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    subtle: "bg-red-50 text-red-900 border-red-200 dark:bg-red-950/40 dark:text-red-100 dark:border-red-800",
    solid: "bg-red-600 text-white border-red-600",
  },
};

function Alert({
  status = "info",
  variant = "subtle",
  title,
  icon,
  dismissable = false,
  onDismiss,
  action,
  className = "",
  children,
}) {
  const cfg = statusMap[status] || statusMap.info;
  const styles =
    variant === "solid"
      ? cfg.solid
      : variant === "left-accent"
        ? `${cfg.subtle} border-l-4`
        : variant === "top-accent"
          ? `${cfg.subtle} border-t-4`
          : cfg.subtle;

  return (
    <div
      className={[
        "flex gap-3 rounded-xl border p-4",
        styles,
        variant === "left-accent" ? "border-l-indigo-600 dark:border-l-indigo-400" : "",
        variant === "top-accent" ? "border-t-indigo-600 dark:border-t-indigo-400" : "",
        className,
      ].join(" ")}
      role="alert"
    >
      <span className="shrink-0 opacity-90">{icon ?? cfg.icon}</span>
      <div className="min-w-0 flex-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        <div className={title ? "mt-1 text-sm opacity-95" : "text-sm"}>{children}</div>
        {action ? <div className="mt-3">{action}</div> : null}
      </div>
      {dismissable ? (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-lg p-1 opacity-70 hover:opacity-100"
          aria-label="Dismiss"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}

export default Alert;
