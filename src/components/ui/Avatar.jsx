import React, { useState } from "react";

const sizeMap = {
  xs: "h-6 w-6 text-[10px] ring-2",
  sm: "h-8 w-8 text-xs ring-2",
  md: "h-10 w-10 text-sm ring-2",
  lg: "h-12 w-12 text-base ring-2",
  xl: "h-16 w-16 text-lg ring-4",
};

const statusRing = {
  online: "ring-emerald-500",
  offline: "ring-gray-400",
  busy: "ring-red-500",
  away: "ring-amber-400",
};

function initials(name) {
  if (!name || typeof name !== "string") return "?";
  const p = name.trim().split(/\s+/);
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

function Avatar({
  src,
  alt = "",
  name,
  size = "md",
  status,
  ringClass = "ring-white dark:ring-gray-900",
  className = "",
  loading = "lazy",
}) {
  const [err, setErr] = useState(false);
  const showImg = src && !err;

  return (
    <span className={`relative inline-flex shrink-0 ${className}`}>
      {showImg ? (
        <img
          src={src}
          alt={alt || name || "Avatar"}
          loading={loading}
          onError={() => setErr(true)}
          className={[
            "rounded-full object-cover",
            sizeMap[size] || sizeMap.md,
            ringClass,
            status ? statusRing[status] || "" : "",
          ].join(" ")}
        />
      ) : (
        <span
          className={[
            "flex items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-200",
            sizeMap[size] || sizeMap.md,
            ringClass,
            status ? statusRing[status] || "" : "",
          ].join(" ")}
          aria-hidden={!name}
        >
          {initials(name || alt)}
        </span>
      )}
      {status && (
        <span
          className={[
            "absolute bottom-0 right-0 block rounded-full border-2 border-white dark:border-gray-900",
            size === "xs" ? "h-1.5 w-1.5" : "h-2.5 w-2.5",
            status === "online"
              ? "bg-emerald-500"
              : status === "busy"
                ? "bg-red-500"
                : status === "away"
                  ? "bg-amber-400"
                  : "bg-gray-400",
          ].join(" ")}
        />
      )}
    </span>
  );
}

function AvatarGroup({ max = 4, size = "sm", className = "", children }) {
  const items = React.Children.toArray(children).filter(Boolean);
  const shown = items.slice(0, max);
  const extra = items.length - max;

  return (
    <div className={["flex -space-x-2", className].join(" ")}>
      {shown.map((child, i) =>
        React.isValidElement(child)
          ? React.cloneElement(child, {
              key: i,
              size,
              className: [child.props.className, "ring-2 ring-white dark:ring-gray-900"].filter(Boolean).join(" "),
            })
          : child
      )}
      {extra > 0 ? (
        <span
          className={[
            "flex items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300",
            sizeMap[size] || sizeMap.sm,
            "ring-2 ring-white dark:ring-gray-900",
          ].join(" ")}
        >
          +{extra}
        </span>
      ) : null}
    </div>
  );
}

Avatar.Group = AvatarGroup;

export default Avatar;
