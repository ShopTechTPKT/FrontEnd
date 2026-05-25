import React from "react";

const variantClasses = {
  elevated:
    "bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-md",
  outlined:
    "bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 shadow-none",
  filled:
    "bg-gray-50 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700 shadow-none",
  glass:
    "bg-white/80 dark:bg-gray-900/70 backdrop-blur-xl border border-white/40 dark:border-gray-700/60 shadow-lg",
  default:
    "bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs",
  flat: "bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800",
  interactive:
    "bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs hover:shadow-md hover:border-violet-200 dark:hover:border-violet-800 transition-all duration-200 cursor-pointer active:scale-[0.995]",
};

const hoverEffects = {
  none: "",
  lift: "hover:-translate-y-1 hover:shadow-lg",
  glow: "hover:shadow-[0_0_24px_-4px_rgba(109,40,217,0.35)]",
  "border-highlight": "hover:border-violet-400 dark:hover:border-violet-500",
};

function CardRoot({
  variant = "default",
  hover = "none",
  padding = "p-5",
  rounded = "rounded-2xl",
  className = "",
  onClick,
  aspectClass = "",
  children,
}) {
  const Component = onClick ? "button" : "div";
  const v = variantClasses[variant] || variantClasses.default;
  const h = hoverEffects[hover] || "";

  return (
    <Component
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={[
        v,
        h,
        padding,
        rounded,
        aspectClass,
        onClick ? "text-left w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </Component>
  );
}

function CardHeader({ className = "", children }) {
  return (
    <div
      className={["border-b border-gray-100 dark:border-gray-800 pb-4 mb-4 -mx-5 -mt-1 px-5 pt-1", className].join(" ")}
    >
      {children}
    </div>
  );
}

function CardBody({ className = "", children }) {
  return <div className={className}>{children}</div>;
}

function CardFooter({ className = "", children }) {
  return (
    <div
      className={["border-t border-gray-100 dark:border-gray-800 pt-4 mt-4 -mx-5 -mb-1 px-5 pb-1", className].join(" ")}
    >
      {children}
    </div>
  );
}

const Card = CardRoot;
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
