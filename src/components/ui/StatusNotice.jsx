import React from "react";

const toneClasses = {
  error: "border-red-200 bg-red-50 text-red-700",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  info: "border-blue-200 bg-blue-50 text-blue-800",
  neutral: "border-gray-200 bg-gray-50 text-gray-700",
};

const iconByTone = {
  error: "⚠️",
  warning: "⚠️",
  info: "ℹ️",
  neutral: "🛈",
};

function StatusNotice({
  tone = "neutral",
  title = "",
  message,
  actionText,
  onAction,
  className = "",
}) {
  const classes = toneClasses[tone] || toneClasses.neutral;
  const icon = iconByTone[tone] || iconByTone.neutral;

  return (
    <div className={`rounded-lg border px-4 py-3 ${classes} ${className}`}>
      <div className="flex items-start gap-3">
        <span className="text-base leading-6">{icon}</span>
        <div className="min-w-0 flex-1">
          {title ? <p className="font-semibold">{title}</p> : null}
          <p className={title ? "mt-1" : ""}>{message}</p>
          {actionText && onAction ? (
            <button
              type="button"
              onClick={onAction}
              className="mt-3 rounded-md border border-current px-3 py-1.5 text-sm font-medium transition-opacity hover:opacity-90"
            >
              {actionText}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default StatusNotice;
