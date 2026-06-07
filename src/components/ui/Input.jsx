import React, { forwardRef, useId, useState } from "react";

const variantClasses = {
  outlined:
    "border bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500",
  filled:
    "border-0 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200/80 dark:hover:bg-gray-800/90",
  flushed:
    "border-0 border-b-2 rounded-none bg-transparent px-0 border-gray-200 dark:border-gray-600 focus:border-indigo-600",
};

const sizeClasses = {
  sm: "h-9 text-xs rounded-lg",
  md: "h-11 text-sm rounded-[10px]",
  lg: "h-12 text-base rounded-xl",
};

const Input = forwardRef(function Input(
  {
    type = "text",
    label,
    error,
    success = false,
    icon,
    leftAddon,
    rightAddon,
    clearable = false,
    onClear,
    showCount = false,
    maxLength,
    variant = "outlined",
    inputSize = "md",
    floatingLabel = false,
    search = false,
    className = "",
    wrapperClassName = "",
    value,
    defaultValue,
    onChange,
    ...props
  },
  ref
) {
  const id = useId();
  const [internal, setInternal] = useState(defaultValue ?? "");
  const isControlled = value !== undefined;
  const current = isControlled ? value : internal;
  const len = String(current ?? "").length;

  const handleChange = (e) => {
    if (!isControlled) setInternal(e.target.value);
    onChange?.(e);
  };

  const showClear =
    clearable &&
    String(current ?? "").length > 0 &&
    type !== "password";

  const left = search ? (
    <span className="pointer-events-none text-gray-400 [&>svg]:h-4 [&>svg]:w-4">
      {icon ?? (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )}
    </span>
  ) : icon ? (
    <span className="pointer-events-none text-gray-400 [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
  ) : (
    leftAddon
  );

  const padL = left ? "pl-11" : leftAddon ? "pl-11" : "pl-4";
  const padR =
    (rightAddon || showClear || showCount ? 1 : 0) +
      (success && !error ? 1 : 0) >
    0
      ? "pr-11"
      : "pr-4";

  const ringError = error ? "border-red-300 focus:border-red-400 focus:ring-red-500/20" : "";
  const ringOk =
    !error && success
      ? "border-emerald-300 focus:border-emerald-400 focus:ring-emerald-500/20"
      : "";
  const ringDefault =
    !error && !success
      ? "focus:border-indigo-500 focus:ring-indigo-500/25"
      : "";

  return (
    <div className={`w-full ${wrapperClassName}`}>
      {label && !floatingLabel && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <div className="relative">
        {floatingLabel && (
          <label
            htmlFor={id}
            className={[
              "pointer-events-none absolute left-4 z-10 origin-left text-gray-500 transition-all duration-200",
              String(current ?? "").length > 0 || props.placeholder === ""
                ? "top-2 text-[10px] font-medium"
                : "top-1/2 -translate-y-1/2 text-sm",
            ].join(" ")}
          >
            {label}
          </label>
        )}
        {left && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5">{left}</div>
        )}
        {!icon && !search && leftAddon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">{leftAddon}</div>
        )}
        <input
          ref={ref}
          id={id}
          type={type}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          maxLength={maxLength}
          aria-invalid={Boolean(error)}
          className={[
            "w-full border font-normal placeholder:text-gray-400 dark:placeholder:text-gray-500",
            "transition-colors duration-200",
            "focus:outline-none focus:ring-2 focus:ring-offset-0 dark:focus:ring-offset-gray-900",
            variantClasses[variant] || variantClasses.outlined,
            sizeClasses[inputSize] || sizeClasses.md,
            floatingLabel ? "pb-2 pt-6" : "",
            padL,
            padR,
            ringError || ringOk || ringDefault,
            className,
          ].join(" ")}
          {...props}
        />
        <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-2">
          {success && !error ? (
            <span className="text-emerald-500" aria-hidden>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </span>
          ) : null}
          {showClear ? (
            <button
              type="button"
              onClick={() => {
                onClear?.();
                if (!isControlled) setInternal("");
              }}
              className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
              aria-label="Clear"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : null}
          {rightAddon}
        </div>
      </div>
      <div className="mt-1.5 flex min-h-[1.25rem] items-center justify-between gap-2 text-sm">
        {error ? <p className="text-red-600 dark:text-red-400">{error}</p> : <span />}
        {showCount && maxLength != null ? (
          <p className="shrink-0 text-gray-400 tabular-nums">
            {len}/{maxLength}
          </p>
        ) : null}
      </div>
    </div>
  );
});

export default Input;
