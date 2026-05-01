import React from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FaChartPie, FaDesktop, FaMicrochip, FaMemory, FaHdd, FaServer,
  FaProjectDiagram, FaPlug, FaCogs, FaHeadphones, FaRegSquare,
  FaGamepad, FaTabletAlt, FaLaptop, FaMobile, FaMouse, FaKeyboard,
  FaShoppingCart, FaTruck, FaUsers, FaStar, FaTicketAlt
} from "react-icons/fa";
import logoText from "../../../assets/logo-text.png";

const SECTIONS = [
  {
    label: "Tổng quan",
    items: [
      { name: "Dashboard", icon: FaChartPie, path: "/admin", key: "menu_dashboard" },
    ],
  },
  {
    label: "Sản phẩm",
    items: [
      { name: "Laptops",    icon: FaLaptop,         path: "/admin/products/laptops",    key: "menu_laptops" },
      { name: "Phone",      icon: FaMobile,         path: "/admin/products/phones",     key: "menu_phone" },
      { name: "Computers",  icon: FaDesktop,        path: "/admin/products/computers",  key: "menu_computers" },
      { name: "Processors", icon: FaMicrochip,      path: "/admin/products/processors", key: "menu_processors" },
      { name: "RAM",        icon: FaMemory,         path: "/admin/products/ram",        key: "menu_ram" },
      { name: "Storage",    icon: FaHdd,            path: "/admin/products/storage",    key: "menu_storage" },
      { name: "Case",       icon: FaServer,         path: "/admin/products/cases",      key: "menu_case" },
      { name: "Mainboard",  icon: FaProjectDiagram, path: "/admin/products/mainboards", key: "menu_mainboard" },
      { name: "Psu",        icon: FaPlug,           path: "/admin/products/psus",       key: "menu_psu" },
      { name: "PC",         icon: FaCogs,           path: "/admin/products/pcs",        key: "menu_pc" },
      { name: "Headphone",  icon: FaHeadphones,     path: "/admin/products/headphones", key: "menu_headphone" },
      { name: "Mousepad",   icon: FaRegSquare,      path: "/admin/products/mousepads",  key: "menu_mousepad" },
      { name: "GamingGear", icon: FaGamepad,        path: "/admin/products/gaminggear", key: "menu_gaming_gear" },
      { name: "Tablet",     icon: FaTabletAlt,      path: "/admin/products/tablets",    key: "menu_tablet" },
      { name: "Mouse",      icon: FaMouse,          path: "/admin/products/mouses",     key: "menu_mouse" },
      { name: "KeyBoard",   icon: FaKeyboard,       path: "/admin/products/keyboards",  key: "menu_keyboard" },
    ],
  },
  {
    label: "Quản lý",
    items: [
      { name: "Orders",        icon: FaShoppingCart, path: "/admin/orders",         key: "menu_orders" },
      { name: "ShippedOrders", icon: FaTruck,        path: "/admin/shipped-orders", key: "menu_shipped_orders" },
      { name: "Customers",     icon: FaUsers,        path: "/admin/customers",      key: "menu_customers" },
      { name: "Reviews",       icon: FaStar,         path: "/admin/reviews",        key: "menu_reviews" },
      { name: "Discounts",     icon: FaTicketAlt,    path: "/admin/discounts",      key: "menu_discounts" },
    ],
  },
];

export default function AdminSidebar({ isSidebarOpen, setIsSidebarOpen }) {
  const { t } = useTranslation("translation");

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 transform ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } lg:relative lg:translate-x-0 w-64 md:w-20 lg:w-64 h-full bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-700 flex flex-col shadow-lg transition-transform duration-300 ease-in-out`}
    >
      {/* Logo area */}
      <div className="relative p-5 flex items-center justify-center lg:justify-start border-b border-gray-100 dark:border-gray-700 h-[73px] overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-600 to-purple-500" />
        <img src={logoText} alt="Logo" className="h-8 lg:mr-3 object-contain" />
        <span className="text-base font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent hidden lg:block">
          {t("admin.techstore")}
        </span>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto">
        <nav className="px-3 py-4 space-y-5">
          {SECTIONS.map((section) => (
            <div key={section.label}>
              <p className="hidden lg:block px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                {section.label}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((menu) => (
                  <li key={menu.name}>
                    <NavLink
                      to={menu.path}
                      end={menu.path === "/admin"}
                      className={({ isActive }) =>
                        `flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 ${
                          isActive
                            ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md shadow-violet-200/60 dark:shadow-violet-900/40"
                            : "text-gray-600 dark:text-gray-400 hover:bg-violet-50 dark:hover:bg-gray-800 hover:text-violet-700"
                        }`
                      }
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <menu.icon className="text-base lg:mr-3 flex-shrink-0" />
                      <span className="text-sm font-medium hidden lg:block leading-none">
                        {t(`admin.${menu.key}`)}
                      </span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}
