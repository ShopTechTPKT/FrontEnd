import React from "react";

const variantClasses = {
  primary:
    "bg-gradient-to-r from-purple-700 via-purple-500 to-fuchsia-500 text-white shadow-sm hover:opacity-90 hover:shadow-lg",
  outline:
    "bg-white text-purple-700 border border-purple-200 shadow-sm hover:bg-purple-50 hover:shadow-md",
  ghost:
    "bg-transparent text-purple-700 border border-transparent hover:bg-purple-50",
};

const sizeClasses = {
  sm: "px-3 py-2 text-sm rounded-lg",
  md: "px-4 py-2.5 text-sm rounded-xl",
  lg: "px-5 py-3 text-base rounded-xl",
};

function Button({
  type = "button",
  variant = "primary",
  size = "md",
  className = "",
  onClick,
  disabled = false,
  icon,
  children,
}) {
  const variantClass = variantClasses[variant] || variantClasses.primary;
  const sizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 font-medium transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 ${variantClass} ${sizeClass} ${className}`}
    >
      {icon ? <span className="flex h-4 w-4 items-center justify-center">{icon}</span> : null}
      <span>{children}</span>
    </button>
  );
}

export default Button;
