import React from "react";
import { Link, useLocation } from "react-router-dom";
import path from "../constant/path";
import { IconCart } from "./header/HeaderIcons";
import { useSelector } from "react-redux";
import { selectCartTotalItems } from "../utils/redux/selectors";

/**
 * Sticky bottom tab bar - mobile / tablet only (lg:hidden)
 */
export default function MobileBottomNav() {
  const location = useLocation();
  const cartQty = useSelector(selectCartTotalItems);
  const p = location.pathname;

  const vibrateTap = () => {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate(12);
    }
  };

  const Item = ({ to, label, icon, active }) => (
    <Link
      to={to}
      onClick={vibrateTap}
      className={`relative flex min-h-[48px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-medium transition-colors sm:text-xs ${
        active ? "text-violet-700 dark:text-violet-400" : "text-gray-500 dark:text-gray-400"
      }`}
    >
      <span className="relative [&>svg]:h-5 [&>svg]:w-5">
        {icon}
        {to === path.shoppingCart && cartQty > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-violet-600 px-0.5 text-[9px] font-bold text-white">
            {cartQty > 9 ? "9+" : cartQty}
          </span>
        ) : null}
      </span>
      <span className="truncate">{label}</span>
    </Link>
  );

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[var(--z-sticky)] flex border-t border-gray-200 bg-white/95 pb-[env(safe-area-inset-bottom)] pt-1 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] backdrop-blur-lg dark:border-gray-800 dark:bg-gray-950/95 lg:hidden"
      aria-label="Mobile navigation"
    >
      <Item
        to={path.home}
        label="Trang chủ"
        active={p === path.home || p === "/"}
        icon={
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        }
      />
      <Item
        to="/products"
        label="Danh mục"
        active={p === "/products"}
        icon={
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        }
      />
      <Item
        to={path.shoppingCart}
        label="Giỏ hàng"
        active={p.includes("shopping_card")}
        icon={<IconCart className="h-5 w-5" />}
      />
      <Item
        to="/userProfile?tab=notifications"
        label="Thông báo"
        active={p.includes("userProfile") && location.search.includes("tab=notifications")}
        icon={
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 11-6 0m6 0H9" />
          </svg>
        }
      />
      <Item
        to="/userProfile"
        label="Tài khoản"
        active={p.includes("userProfile") || p.includes("login")}
        icon={
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        }
      />
    </nav>
  );
}
