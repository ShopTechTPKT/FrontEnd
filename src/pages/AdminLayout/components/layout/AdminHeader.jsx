import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaHome, FaCalendar } from "react-icons/fa";
import LanguageSwitcher from "../../../components/LanguageSwitcher";

export default function AdminHeader({ setIsSidebarOpen }) {
  const { t } = useTranslation("translation");
  const navigate = useNavigate();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/admin") return t("admin.menu_dashboard");
    if (path.includes("/laptops")) return t("admin.menu_laptops");
    if (path.includes("/phones")) return t("admin.menu_phone");
    if (path.includes("/computers")) return t("admin.menu_computers");
    if (path.includes("/processors")) return t("admin.menu_processors");
    if (path.includes("/ram")) return t("admin.menu_ram");
    if (path.includes("/storage")) return t("admin.menu_storage");
    if (path.includes("/cases")) return t("admin.menu_case");
    if (path.includes("/mainboards")) return t("admin.menu_mainboard");
    if (path.includes("/psus")) return t("admin.menu_psu");
    if (path.includes("/pcs")) return t("admin.menu_pc");
    if (path.includes("/headphones")) return t("admin.menu_headphone");
    if (path.includes("/mousepads")) return t("admin.menu_mousepad");
    if (path.includes("/gaminggear")) return t("admin.menu_gaming_gear");
    if (path.includes("/tablets")) return t("admin.menu_tablet");
    if (path.includes("/mouses")) return t("admin.menu_mouse");
    if (path.includes("/keyboards")) return t("admin.menu_keyboard");
    if (path.includes("/orders")) return t("admin.menu_orders");
    if (path.includes("/shipped-orders")) return t("admin.menu_shipped_orders");
    if (path.includes("/customers")) return t("admin.menu_customers");
    if (path.includes("/reviews")) return t("admin.menu_reviews");
    if (path.includes("/discounts")) return t("admin.menu_discounts");
    return t("admin.techstore");
  };

  const iconBtn = "w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 dark:text-gray-400 hover:bg-violet-50 dark:hover:bg-gray-800 hover:text-violet-700 dark:hover:text-violet-400 transition-all duration-200";

  return (
    <header className="relative flex items-center justify-between px-4 lg:px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
      {/* Gradient accent top strip */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-400/40 to-transparent" />

      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          className={`lg:hidden ${iconBtn}`}
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Page title */}
        <div className="flex items-center gap-2">
          <span className="hidden sm:block text-xs font-medium text-gray-400 dark:text-gray-500">Admin</span>
          <span className="hidden sm:block text-gray-300 dark:text-gray-600">/</span>
          <h1 className="text-base font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => navigate("/admin/audit-logs")}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-500 dark:text-gray-400 hover:bg-violet-50 dark:hover:bg-gray-800 hover:text-violet-700 transition-all"
        >
          Audit Logs
        </button>
        <button
          onClick={() => navigate("/")}
          className={iconBtn}
          title={t("admin.go_to_homepage")}
        >
          <FaHome size={16} />
        </button>
        <button
          onClick={() => navigate("/admin/calendar")}
          className={iconBtn}
          title={t("admin.view_calendar")}
        >
          <FaCalendar size={16} />
        </button>
        <div className="ml-1">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}

