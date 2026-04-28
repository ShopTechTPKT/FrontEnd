import React, { forwardRef } from "react";

/**
 * Input — Unified form input for the entire app.
 *
 * Replaces ModernInput in LoginWave.jsx and inline inputs elsewhere.
 * Supports: icon, error message, all native input props.
 */

const Input = forwardRef(function Input(
  {
    type = "text",
    label,
    error,
    icon,
    className = "",
    wrapperClassName = "",
    ...props
  },
  ref
) {
  return (
    <div className={`w-full ${wrapperClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          type={type}
          aria-invalid={Boolean(error)}
          className={[
            "w-full h-11 rounded-[10px] border bg-white text-gray-900 text-sm",
            "placeholder:text-gray-400",
            "transition-colors duration-200",
            "focus:outline-none focus:ring-2 focus:ring-offset-0",
            icon ? "pl-11 pr-4" : "px-4",
            error
              ? "border-red-300 focus:border-red-400 focus:ring-red-500/20"
              : "border-gray-200 hover:border-gray-300 focus:border-violet-400 focus:ring-violet-500/20",
            className,
          ].join(" ")}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

export default Input;
