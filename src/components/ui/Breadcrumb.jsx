import React from "react";
import { Link } from "react-router-dom";

/**
 * Breadcrumb — Consistent navigation breadcrumb.
 *
 * Usage:
 *   <Breadcrumb items={[
 *     { label: "Trang chủ", to: "/" },
 *     { label: "Sản phẩm", to: "/products" },
 *     { label: "Laptop ABC" },  // last item = current page (no link)
 *   ]} />
 */

function Breadcrumb({ items = [], className = "" }) {
  if (!items.length) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-1.5 text-sm ${className}`}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <span className="text-gray-300 select-none" aria-hidden>/</span>
            )}
            {isLast || !item.to ? (
              <span className="text-gray-800 font-medium truncate">
                {item.label}
              </span>
            ) : (
              <Link
                to={item.to}
                className="text-gray-500 hover:text-violet-700 transition-colors truncate"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

export default Breadcrumb;
