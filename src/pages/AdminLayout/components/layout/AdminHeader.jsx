import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaHome, FaCalendar } from "react-icons/fa";
import LanguageSwitcher from "../../../components/LanguageSwitcher";

export default function AdminHeader({ setIsSidebarOpen, darkMode }) {
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

  const borderColor = "border-gray-200 dark:border-gray-700";

  return (
    <header className={`flex items-center justify-between px-4 lg:px-6 py-4 border-b ${borderColor} bg-white dark:bg-gray-900 shadow-sm`}>
      <div className="flex items-center gap-4">
        <button
          className="lg:hidden text-gray-500 dark:text-gray-300 hover:text-violet-600 focus:outline-none"
          onClick={() => setIsSidebarOpen(true)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
          {getPageTitle()}
        </h1>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => navigate("/admin/audit-logs")}
          className="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
        >
          Audit Logs
        </button>
        <button
          onClick={() => navigate("/")}
          className="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title={t("admin.go_to_homepage")}
        >
          <FaHome size={18} />
        </button>
        <button
          onClick={() => navigate("/admin/calendar")}
          className="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title={t("admin.view_calendar")}
        >
          <FaCalendar size={18} />
        </button>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
