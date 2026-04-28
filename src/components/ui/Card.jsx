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
  default:     "bg-white border border-gray-100 shadow-xs",
  flat:        "bg-white border border-gray-100",
  interactive: "bg-white border border-gray-100 shadow-xs hover:shadow-md hover:border-gray-200 transition-all duration-200 cursor-pointer active:scale-[0.995]",
};

function Card({
  variant = "default",
  padding = "p-5",
  rounded = "rounded-2xl",
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
