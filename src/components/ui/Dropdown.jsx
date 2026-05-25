import React, { useEffect, useRef, useState } from "react";

const placementClass = {
  "bottom-start": "left-0 top-full mt-1",
  "bottom-end": "right-0 top-full mt-1",
  "top-start": "bottom-full left-0 mb-1",
  "top-end": "bottom-full right-0 mb-1",
};

function Dropdown({
  trigger,
  children,
  placement = "bottom-start",
  align = "start",
  className = "",
  menuClassName = "",
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const place =
    placementClass[placement] ||
    (align === "end" ? placementClass["bottom-end"] : placementClass["bottom-start"]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={rootRef} className={["relative inline-block text-left", className].join(" ")}>
      <div onClick={() => setOpen((v) => !v)} className="cursor-pointer">
        {typeof trigger === "function" ? trigger({ open, setOpen }) : trigger}
      </div>
      {open ? (
        <div
          className={[
            "absolute z-[var(--z-dropdown)] min-w-[10rem] origin-top rounded-xl border border-gray-100 bg-white py-1 shadow-lg animate-fadeIn dark:border-gray-700 dark:bg-gray-900",
            place || placementClass[key],
            menuClassName,
          ].join(" ")}
          role="menu"
        >
          {typeof children === "function" ? children({ close: () => setOpen(false) }) : children}
        </div>
      ) : null}
    </div>
  );
}

function Item({ icon, danger, onClick, children, className = "" }) {
  return (
    <button
      type="button"
      role="menuitem"
      className={[
        "flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800",
        danger ? "text-red-600 dark:text-red-400" : "",
        className,
      ].join(" ")}
      onClick={onClick}
    >
      {icon ? <span className="shrink-0 opacity-70 [&>svg]:h-4 [&>svg]:w-4">{icon}</span> : null}
      {children}
    </button>
  );
}

function Divider() {
  return <div className="my-1 h-px bg-gray-100 dark:bg-gray-800" role="separator" />;
}

Dropdown.Item = Item;
Dropdown.Divider = Divider;

export default Dropdown;
