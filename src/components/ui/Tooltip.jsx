import React, { useCallback, useRef, useState } from "react";

const posClass = {
  top: "bottom-full left-1/2 mb-2 -translate-x-1/2",
  bottom: "top-full left-1/2 mt-2 -translate-x-1/2",
  left: "right-full top-1/2 mr-2 -translate-y-1/2",
  right: "left-full top-1/2 ml-2 -translate-y-1/2",
};

const arrowClass = {
  top: "left-1/2 top-full -translate-x-1/2 border-x-transparent border-t-gray-900 dark:border-t-gray-700",
  bottom: "bottom-full left-1/2 -translate-x-1/2 border-x-transparent border-b-gray-900 dark:border-b-gray-700",
  left: "left-full top-1/2 -translate-y-1/2 border-y-transparent border-l-gray-900 dark:border-l-gray-700",
  right: "right-full top-1/2 -translate-y-1/2 border-y-transparent border-r-gray-900 dark:border-r-gray-700",
};

function Tooltip({
  content,
  children,
  position = "top",
  delayShow = 200,
  delayHide = 100,
  theme = "dark",
  maxWidth = "max-w-xs",
  showArrow = true,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const showT = useRef(null);
  const hideT = useRef(null);

  const clearTimers = () => {
    if (showT.current) window.clearTimeout(showT.current);
    if (hideT.current) window.clearTimeout(hideT.current);
  };

  const onEnter = useCallback(() => {
    clearTimers();
    showT.current = window.setTimeout(() => setOpen(true), delayShow);
  }, [delayShow]);

  const onLeave = useCallback(() => {
    clearTimers();
    hideT.current = window.setTimeout(() => setOpen(false), delayHide);
  }, [delayHide]);

  const panelTheme =
    theme === "light"
      ? "border border-gray-200 bg-white text-gray-900 shadow-md"
      : "bg-gray-900 text-white dark:bg-gray-700";

  return (
    <span
      className={["relative inline-flex", className].join(" ")}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
    >
      {children}
      {open && content ? (
        <span
          role="tooltip"
          className={[
            "pointer-events-none absolute z-[var(--z-tooltip)] whitespace-normal rounded-lg px-2.5 py-1.5 text-xs font-medium shadow-lg",
            posClass[position] || posClass.top,
            maxWidth,
            panelTheme,
            "animate-fadeIn",
          ].join(" ")}
        >
          {content}
          {showArrow ? (
            <span
              className={["absolute h-0 w-0 border-4", arrowClass[position] || arrowClass.top].join(" ")}
              aria-hidden
            />
          ) : null}
        </span>
      ) : null}
    </span>
  );
}

export default Tooltip;
