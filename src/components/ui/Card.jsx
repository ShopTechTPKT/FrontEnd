import React from "react";

/**
 * Card — Consistent container for content sections.
 *
 * Variants: default | flat | interactive
 * - default:     white bg, border, subtle shadow
 * - flat:        white bg, border only, no shadow
 * - interactive: default + hover shadow lift
 */

const variantClasses = {
  default:     "bg-white border border-gray-200 shadow-xs",
  flat:        "bg-white border border-gray-200",
  interactive: "bg-white border border-gray-200 shadow-xs hover:shadow-md hover:border-gray-300 transition-shadow duration-200 cursor-pointer",
};

function Card({
  variant = "default",
  padding = "p-5",
  rounded = "rounded-xl",
  className = "",
  onClick,
  children,
}) {
  const Component = onClick ? "button" : "div";

  return (
    <Component
      onClick={onClick}
      className={[
        variantClasses[variant] || variantClasses.default,
        padding,
        rounded,
        onClick ? "text-left w-full" : "",
        className,
      ].join(" ")}
    >
      {children}
    </Component>
  );
}

export default Card;
