import React, { useMemo, useState, useEffect, useRef, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaHome, FaCalendar, FaBell, FaSearch, FaPlus, FaBoxOpen, FaTicketAlt, FaShoppingCart } from "react-icons/fa";
import LanguageSwitcher from "../../../../components/LanguageSwitcher";
import { UserContext } from "../../../../context/UserContext";

/** Every admin route that exists as a real URL (leaf paths). */
const ADMIN_LEAF_PATHS = new Set([
  "/admin",
  "/admin/dashboard",
  "/admin/products/unified",
  "/admin/products/laptops",
  "/admin/products/phones",
  "/admin/products/processors",
  "/admin/products/computers",
  "/admin/products/ram",
  "/admin/products/storage",
  "/admin/products/cases",
  "/admin/products/mainboards",
  "/admin/products/psus",
  "/admin/products/pcs",
  "/admin/products/headphones",
  "/admin/products/mousepads",
  "/admin/products/tablets",
  "/admin/products/keyboards",
  "/admin/products/mouses",
  "/admin/products/monitors",
  "/admin/products/gaminggear",
  "/admin/orders",
  "/admin/orders/kanban",
  "/admin/shipped-orders",
  "/admin/returns",
  "/admin/customers",
  "/admin/reviews",
  "/admin/discounts",
  "/admin/promotions",
  "/admin/flash-sales",
  "/admin/gift-cards",
  "/admin/referrals",
  "/admin/banners",
  "/admin/email-campaigns",
  "/admin/settings/shipping",
  "/admin/categories",
  "/admin/staff",
  "/admin/permissions",
  "/admin/customer-service",
  "/admin/notifications",
  "/admin/analytics",
  "/admin/ai-analytics",
  "/admin/calendar",
  "/admin/audit-logs",
]);

const SLUG_MENU_KEY = {
  dashboard: "menu_dashboard",
  unified: "menu_products_unified",
  laptops: "menu_laptops",
  phones: "menu_phone",
  processors: "menu_processors",
  computers: "menu_computers",
  ram: "menu_ram",
  storage: "menu_storage",
  cases: "menu_case",
  mainboards: "menu_mainboard",
  psus: "menu_psu",
  pcs: "menu_pc",
  headphones: "menu_headphone",
  mousepads: "menu_mousepad",
  tablets: "menu_tablet",
  keyboards: "menu_keyboard",
  mouses: "menu_mouse",
  monitors: "menu_computers",
  gaminggear: "menu_gaming_gear",
  orders: "menu_orders",
  kanban: "menu_orders_kanban",
  "shipped-orders": "menu_shipped_orders",
  returns: "menu_return_requests",
  customers: "menu_customers",
  reviews: "menu_reviews",
  discounts: "menu_discounts",
  promotions: "menu_promotions",
  "flash-sales": "menu_flash_sales",
  "gift-cards": "menu_gift_cards",
  referrals: "menu_referrals",
  categories: "menu_categories",
  banners: "menu_banners",
  "email-campaigns": "menu_email_campaigns",
  shipping: "menu_shipping_settings",
  staff: "menu_staff",
  permissions: "menu_roles",
  "customer-service": "menu_customer_service",
  notifications: "menu_notifications",
  analytics: "menu_analytics",
  "ai-analytics": "menu_ai_analytics",
  calendar: "menu_calendar",
  "audit-logs": "menu_audit_logs",
};

function prettySlug(slug) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function resolveCrumbHref(accPath) {
  if (ADMIN_LEAF_PATHS.has(accPath)) return accPath;
  if (accPath === "/admin/products") return "/admin/products/laptops";
  if (accPath === "/admin/settings") return "/admin/settings/shipping";
  return null;
}

function buildBreadcrumbs(pathname, t) {
  const normalized = (pathname || "/admin").replace(/\/+$/, "") || "/admin";

  if (normalized === "/admin" || normalized === "/admin/dashboard") {
    return [
      {
        label: t("admin.breadcrumb_admin", "Admin"),
        href: "/admin",
      },
      {
        label: t("admin.menu_dashboard"),
        href: null,
      },
    ];
  }

  const segments = normalized.split("/").filter(Boolean);
  if (segments[0] !== "admin") {
    return [{ label: t("admin.techstore"), href: null }];
  }

  const crumbs = [];
  let acc = "";

  for (let i = 0; i < segments.length; i++) {
    acc += `/${segments[i]}`;
    const slug = segments[i];
    const isLast = i === segments.length - 1;

    let label;
    if (slug === "admin") {
      label = t("admin.breadcrumb_admin", "Admin");
    } else if (slug === "products") {
      label = t("admin.breadcrumb_products", "Sản phẩm");
    } else if (slug === "settings") {
      label = t("admin.breadcrumb_settings", "Cài đặt");
    } else if (SLUG_MENU_KEY[slug]) {
      label = t(`admin.${SLUG_MENU_KEY[slug]}`, prettySlug(slug));
    } else {
      label = prettySlug(slug);
    }

    const href = !isLast ? resolveCrumbHref(acc) : null;
    crumbs.push({ label, href });
  }

  return crumbs;
}

export default function AdminHeader({
  setIsSidebarOpen,
  pendingOrders = 0,
}) {
  const { t } = useTranslation("translation");
  const { user } = useContext(UserContext);
  const initials = user?.fullName
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "AD";
  const navigate = useNavigate();
  const location = useLocation();
  const [searchUi, setSearchUi] = useState("");
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const breadcrumbs = useMemo(
    () => buildBreadcrumbs(location.pathname, t),
    [location.pathname, t],
  );

  const iconBtn =
    "relative w-9 h-9 flex items-center justify-center rounded-xl text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-subtle)] hover:text-[var(--color-primary)] transition-all duration-200";

  return (
    <header className="relative z-10 flex flex-wrap items-center justify-between gap-3 px-4 lg:px-6 py-3 lg:py-4 border-b border-[var(--color-border)] admin-header-glass shadow-sm overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--color-primary-)]/40 to-transparent" />

      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          type="button"
          className={`lg:hidden ${iconBtn}`}
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="min-w-0 flex-1">
          <nav
            aria-label={t("admin.breadcrumb_nav_label", "Breadcrumb")}
            className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm"
          >
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <React.Fragment key={`${crumb.label}-${index}`}>
                  {index > 0 ? (
                    <span
                      className="text-[var(--color-text-muted)]/60 select-none"
                      aria-hidden
                    >
                      /
                    </span>
                  ) : null}
                  {crumb.href && !isLast ? (
                    <button
                      type="button"
                      onClick={() => navigate(crumb.href)}
                      className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] font-medium truncate max-w-[10rem] sm:max-w-none transition-colors text-left"
                    >
                      {crumb.label}
                    </button>
                  ) : (
                    <span
                      className={`truncate max-w-[14rem] sm:max-w-[min(36rem,55vw)] ${
                        isLast
                          ? "text-base font-bold text-[var(--color-text)]"
                          : "text-[var(--color-text-secondary)] font-medium"
                      }`}
                      aria-current={isLast ? "page" : undefined}
                    >
                      {crumb.label}
                    </span>
                  )}
                </React.Fragment>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap justify-end">
        
        {/* Quick Actions */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowQuickActions(!showQuickActions)}
            onBlur={() => setTimeout(() => setShowQuickActions(false), 200)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[var(--color-primary-)] to-indigo-600 hover:from-[var(--color-primary-)] hover:to-indigo-700 shadow-md shadow-[var(--color-primary-)]/50 transition-all"
          >
            <FaPlus size={12} />
            Mới
          </button>
          
          {/* Dropdown */}
          {showQuickActions && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl shadow-lg z-50 overflow-hidden animate-fadeIn">
              <div className="py-1">
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-primary-subtle)] hover:text-[var(--color-primary)] transition-colors text-left">
                  <FaBoxOpen className="text-[var(--color-text-muted)]" /> Thêm sản phẩm
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-primary-subtle)] hover:text-[var(--color-primary)] transition-colors text-left">
                  <FaTicketAlt className="text-[var(--color-text-muted)]" /> Tạo khuyến mãi
                </button>
                <div className="h-px bg-[var(--color-border)] my-1" />
                <button onClick={() => navigate("/admin/orders")} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-primary-subtle)] hover:text-[var(--color-primary)] transition-colors text-left">
                  <FaShoppingCart className="text-[var(--color-text-muted)]" /> Xem đơn mới
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="relative hidden md:block w-44 lg:w-56 xl:w-64 group">
          <FaSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none group-focus-within:text-[var(--color-primary)] transition-colors"
            size={14}
          />
          <input
            ref={searchInputRef}
            type="search"
            value={searchUi}
            onChange={(e) => setSearchUi(e.target.value)}
            placeholder={t("admin.header_search_placeholder", "Tìm kiếm (⌘K)")}
            className="admin-input w-full pl-9 pr-12 py-1.5 text-sm bg-[var(--color-bg-subtle)] focus:bg-[var(--color-bg)] transition-colors"
            aria-label={t("admin.header_search_placeholder", "Tìm kiếm (⌘K)")}
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
            <span className="text-[10px] font-bold text-[var(--color-text-muted)] border border-[var(--color-border)] rounded px-1.5 py-0.5 bg-[var(--color-bg)] shadow-sm">⌘K</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/audit-logs")}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-subtle)] hover:text-[var(--color-primary)] transition-all"
        >
          Audit Logs
        </button>
        <button
          type="button"
          onClick={() => navigate("/")}
          className={iconBtn}
          title={t("admin.go_to_homepage")}
        >
          <FaHome size={16} />
        </button>
        <button
          type="button"
          onClick={() => navigate("/admin/calendar")}
          className={iconBtn}
          title={t("admin.view_calendar")}
        >
          <FaCalendar size={16} />
        </button>

        <div 
          className="relative"
          onMouseEnter={() => setShowNotifications(true)}
          onMouseLeave={() => setShowNotifications(false)}
        >
          <button
            type="button"
            onClick={() => navigate("/admin/orders")}
            className={iconBtn}
            title={t("admin.menu_orders")}
            aria-label={t("admin.menu_orders")}
          >
            <FaBell size={16} />
            {pendingOrders > 0 ? (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold bg-red-500 text-white flex items-center justify-center border-2 border-[var(--color-bg)] admin-badge animate-pulse">
                {pendingOrders > 99 ? "99+" : pendingOrders}
              </span>
            ) : null}
          </button>
          
          {/* Notification Preview */}
          {showNotifications && (
            <div className="absolute top-full right-0 mt-2 w-72 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl shadow-lg z-50 overflow-hidden animate-fadeIn">
              <div className="px-4 py-3 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-bg-subtle)]">
                <span className="text-sm font-semibold text-[var(--color-text)]">Thông báo</span>
                <span className="text-xs text-[var(--color-primary)] cursor-pointer hover:underline font-medium">Đánh dấu đã đọc</span>
              </div>
              <div className="py-2">
                {pendingOrders > 0 ? (
                  <div 
                    className="px-4 py-3 hover:bg-[var(--color-bg-subtle)] cursor-pointer transition-colors border-l-4 border-[var(--color-primary-)] bg-[var(--color-primary-subtle)]/30"
                    onClick={() => navigate("/admin/orders")}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-semibold text-[var(--color-text)]">Đơn hàng mới</p>
                      <span className="w-2 h-2 rounded-full bg-[var(--color-primary-)] mt-1.5"></span>
                    </div>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1 leading-relaxed">Bạn có {pendingOrders} đơn hàng đang chờ xác nhận.</p>
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-2 font-medium">Vừa xong</p>
                  </div>
                ) : (
                  <div className="px-4 py-8 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-full bg-[var(--color-bg-subtle)] flex items-center justify-center mb-3">
                      <FaBell className="text-xl text-[var(--color-text-muted)] opacity-50" />
                    </div>
                    <p className="text-sm font-medium text-[var(--color-text-secondary)]">Không có thông báo mới</p>
                  </div>
                )}
              </div>
              <div className="border-t border-[var(--color-border)]">
                <button onClick={() => navigate("/admin/notifications")} className="w-full px-4 py-2.5 text-xs font-semibold text-center text-[var(--color-primary)] hover:bg-[var(--color-primary-subtle)] transition-colors">
                  Xem tất cả thông báo
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="relative ml-1 cursor-pointer hover:opacity-90 transition-opacity">
          <div
            className="hidden sm:flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-primary-)] to-indigo-600 text-white text-xs font-bold shadow-md ring-2 ring-[var(--color-bg)] shrink-0"
            title={t("admin.breadcrumb_admin", "Admin")}
            role="img"
            aria-label={t("admin.breadcrumb_admin", "Admin")}
          >
            {initials}
          </div>
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[var(--color-bg)] rounded-full hidden sm:block"></div>
        </div>
        
        <div className="ml-1 sm:ml-2">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
