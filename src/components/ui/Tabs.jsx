import React, { useMemo, useState } from "react";

const listVariant = {
  line: "border-b border-gray-200 dark:border-gray-700 gap-1",
  enclosed: "rounded-xl bg-gray-100 p-1 dark:bg-gray-800 gap-0",
  "soft-rounded": "gap-2",
  "solid-rounded": "rounded-xl bg-violet-100/60 p-1 dark:bg-violet-950/40 gap-0",
};

const tabVariant = {
  line: "rounded-t-lg border-b-2 border-transparent px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-800 data-[active=true]:border-violet-600 data-[active=true]:text-violet-700 dark:text-gray-400 dark:hover:text-gray-100 dark:data-[active=true]:text-violet-300",
  enclosed:
    "rounded-lg px-4 py-2 text-sm font-medium text-gray-600 data-[active=true]:bg-white data-[active=true]:text-violet-700 data-[active=true]:shadow-sm dark:text-gray-300 dark:data-[active=true]:bg-gray-900 dark:data-[active=true]:text-violet-300",
  "soft-rounded":
    "rounded-full px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 data-[active=true]:bg-violet-600 data-[active=true]:text-white dark:text-gray-300 dark:hover:bg-gray-800",
  "solid-rounded":
    "rounded-lg px-4 py-2 text-sm font-medium text-violet-800/80 data-[active=true]:bg-violet-600 data-[active=true]:text-white dark:text-violet-200",
};

function Tabs({
  items = [],
  defaultIndex = 0,
  value,
  onChange,
  variant = "line",
  size = "md",
  orientation = "horizontal",
  fitted = false,
  lazy = true,
  className = "",
}) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(defaultIndex);
  const active = isControlled ? value : internal;
  const set = (i) => {
    if (!isControlled) setInternal(i);
    onChange?.(i);
  };

  const tabs = useMemo(
    () =>
      items.map((it, i) => ({
        key: it.key ?? i,
        label: it.label,
        icon: it.icon,
        badge: it.badge,
        panel: it.panel ?? it.children,
        disabled: it.disabled,
      })),
    [items]
  );

  const v = variant;
  const tabPad = size === "sm" ? "px-3 py-1.5 text-xs" : size === "lg" ? "px-5 py-3 text-base" : "";

  return (
    <div
      className={[
        orientation === "vertical" ? "flex gap-4" : "",
        className,
      ].join(" ")}
    >
      <div
        role="tablist"
        className={[
          "flex",
          orientation === "vertical" ? "min-w-[180px] flex-col" : "flex-row flex-wrap",
          listVariant[v] || listVariant.line,
          fitted && orientation === "horizontal" ? "w-full [&>button]:flex-1" : "",
        ].join(" ")}
      >
        {tabs.map((t, i) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={active === i}
            disabled={t.disabled}
            data-active={active === i}
            onClick={() => !t.disabled && set(i)}
            className={[
              tabVariant[v] || tabVariant.line,
              tabPad,
              t.disabled ? "cursor-not-allowed opacity-50" : "",
              "inline-flex items-center justify-center gap-2 transition-colors",
            ].join(" ")}
          >
            {t.icon}
            {t.label}
            {t.badge != null ? (
              <span className="rounded-full bg-violet-100 px-1.5 text-[10px] font-semibold text-violet-700 dark:bg-violet-900 dark:text-violet-200">
                {t.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1" role="tabpanel">
        {tabs.map((t, i) => {
          if (lazy && active !== i) return null;
          if (!lazy && active !== i) {
            return (
              <div key={t.key} hidden>
                {typeof t.panel === "function" ? t.panel() : t.panel}
              </div>
            );
          }
          return (
            <div key={t.key}>
              {typeof t.panel === "function" ? t.panel() : t.panel}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Tabs;
