import React, { useMemo, useState, useEffect, useContext } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FaChartPie,
  FaDesktop,
  FaMicrochip,
  FaMemory,
  FaHdd,
  FaServer,
  FaProjectDiagram,
  FaPlug,
  FaCogs,
  FaHeadphones,
  FaRegSquare,
  FaGamepad,
  FaTabletAlt,
  FaLaptop,
  FaMobile,
  FaMouse,
  FaKeyboard,
  FaShoppingCart,
  FaTruck,
  FaShippingFast,
  FaUndo,
  FaUsers,
  FaStar,
  FaTicketAlt,
  FaBullhorn,
  FaHeadset,
  FaRobot,
  FaBell,
  FaCalendarAlt,
  FaHistory,
  FaUserTie,
  FaCog,
  FaChevronDown,
  FaChevronRight,
  FaImage,
  FaPaperPlane,
  FaFolderOpen,
  FaUserShield,
  FaChartLine,
  FaClipboardList,
  FaStream,
  FaSearch,
  FaFileImport,
  FaBolt,
  FaGift,
} from "react-icons/fa";
import logoText from "../../../../assets/images/logo.svg";
import { UserContext } from "../../../../context/UserContext";

const SECTIONS = [
  {
    id: "dashboard",
    label: "Dashboard",
    collapsible: false,
    items: [
      {
        name: "Dashboard",
        icon: FaChartPie,
        path: "/admin",
        key: "menu_dashboard",
      },
    ],
  },
  {
    id: "products",
    label: "Sản phẩm",
    collapsible: true,
    subGroups: [
      {
        label: "Máy tính & Thiết bị",
        items: [
          { name: "Laptops", icon: FaLaptop, path: "/admin/products/laptops", key: "menu_laptops" },
          { name: "Computers", icon: FaDesktop, path: "/admin/products/computers", key: "menu_computers" },
          { name: "PC", icon: FaCogs, path: "/admin/products/pcs", key: "menu_pc" },
          { name: "Tablet", icon: FaTabletAlt, path: "/admin/products/tablets", key: "menu_tablet" },
          { name: "Phone", icon: FaMobile, path: "/admin/products/phones", key: "menu_phone" },
          { name: "Unified", icon: FaStream, path: "/admin/products/unified", key: "menu_products_unified" },
          { name: "Import CSV", icon: FaFileImport, path: "/admin/products/import", key: "menu_products_import" },
        ]
      },
      {
        label: "Linh kiện",
        items: [
          { name: "Processors", icon: FaMicrochip, path: "/admin/products/processors", key: "menu_processors" },
          { name: "RAM", icon: FaMemory, path: "/admin/products/ram", key: "menu_ram" },
          { name: "Storage", icon: FaHdd, path: "/admin/products/storage", key: "menu_storage" },
          { name: "Case", icon: FaServer, path: "/admin/products/cases", key: "menu_case" },
          { name: "Mainboard", icon: FaProjectDiagram, path: "/admin/products/mainboards", key: "menu_mainboard" },
          { name: "Psu", icon: FaPlug, path: "/admin/products/psus", key: "menu_psu" },
        ]
      },
      {
        label: "Gaming & Ngoại vi",
        items: [
          { name: "GamingGear", icon: FaGamepad, path: "/admin/products/gaminggear", key: "menu_gaming_gear" },
          { name: "KeyBoard", icon: FaKeyboard, path: "/admin/products/keyboards", key: "menu_keyboard" },
          { name: "Mouse", icon: FaMouse, path: "/admin/products/mouses", key: "menu_mouse" },
          { name: "Mousepad", icon: FaRegSquare, path: "/admin/products/mousepads", key: "menu_mousepad" },
          { name: "Headphone", icon: FaHeadphones, path: "/admin/products/headphones", key: "menu_headphone" },
        ]
      }
    ],
  },
  {
    id: "orders",
    label: "Đơn hàng",
    collapsible: true,
    items: [
      {
        name: "Orders",
        icon: FaShoppingCart,
        path: "/admin/orders",
        key: "menu_orders",
        badge: "pendingOrders",
      },
      {
        name: "Kanban",
        icon: FaClipboardList,
        path: "/admin/orders/kanban",
        key: "menu_orders_kanban",
      },
      {
        name: "ShippedOrders",
        icon: FaShippingFast,
        path: "/admin/shipped-orders",
        key: "menu_shipped_orders",
      },
      {
        name: "Returns",
        icon: FaUndo,
        path: "/admin/returns",
        key: "menu_return_requests",
      },
    ],
  },
  {
    id: "customers",
    label: "Khách hàng",
    collapsible: true,
    items: [
      {
        name: "Customers",
        icon: FaUsers,
        path: "/admin/customers",
        key: "menu_customers",
      },
      {
        name: "Reviews",
        icon: FaStar,
        path: "/admin/reviews",
        key: "menu_reviews",
      },
    ],
  },
  {
    id: "marketing",
    label: "Marketing",
    collapsible: true,
    items: [
      {
        name: "Discounts",
        icon: FaTicketAlt,
        path: "/admin/discounts",
        key: "menu_discounts",
      },
      {
        name: "Promotions",
        icon: FaBullhorn,
        path: "/admin/promotions",
        key: "menu_promotions",
      },
      {
        name: "Flash Sale",
        icon: FaBolt,
        path: "/admin/flash-sales",
        key: "menu_flash_sales",
      },
      {
        name: "Gift Cards",
        icon: FaGift,
        path: "/admin/gift-cards",
        key: "menu_gift_cards",
      },
      {
        name: "Referrals",
        icon: FaUsers,
        path: "/admin/referrals",
        key: "menu_referrals",
      },
      {
        name: "Categories",
        icon: FaFolderOpen,
        path: "/admin/categories",
        key: "menu_categories",
      },
      {
        name: "Banners",
        icon: FaImage,
        path: "/admin/banners",
        key: "menu_banners",
      },
      {
        name: "EmailCampaigns",
        icon: FaPaperPlane,
        path: "/admin/email-campaigns",
        key: "menu_email_campaigns",
      },
    ],
  },
  {
    id: "support",
    label: "Hỗ trợ",
    collapsible: true,
    items: [
      {
        name: "CustomerService",
        icon: FaHeadset,
        path: "/admin/customer-service",
        key: "menu_customer_service",
      },
      {
        name: "AIAnalytics",
        icon: FaRobot,
        path: "/admin/ai-analytics",
        key: "menu_ai_analytics",
      },
      {
        name: "Notifications",
        icon: FaBell,
        path: "/admin/notifications",
        key: "menu_notifications",
      },
      {
        name: "Calendar",
        icon: FaCalendarAlt,
        path: "/admin/calendar",
        key: "menu_calendar",
      },
      {
        name: "AuditLogs",
        icon: FaHistory,
        path: "/admin/audit-logs",
        key: "menu_audit_logs",
      },
    ],
  },
  {
    id: "staff",
    label: "Nhân sự",
    collapsible: true,
    items: [
      {
        name: "Staff",
        icon: FaUserTie,
        path: "/admin/staff",
        key: "menu_staff",
      },
      {
        name: "Roles",
        icon: FaUserShield,
        path: "/admin/permissions",
        key: "menu_roles",
      },
    ],
  },
  {
    id: "settings",
    label: "Cài đặt",
    collapsible: true,
    items: [
      {
        name: "Analytics",
        icon: FaChartLine,
        path: "/admin/analytics",
        key: "menu_analytics",
      },
      {
        name: "ShippingSettings",
        icon: FaTruck,
        path: "/admin/settings/shipping",
        key: "menu_shipping_settings",
      },
    ],
  },
];

export default function AdminSidebar({
  isSidebarOpen,
  setIsSidebarOpen,
  collapsed = false,
  onToggleCollapse,
  pendingOrders = 0,
}) {
  const { t } = useTranslation("translation");
  const { user } = useContext(UserContext);
  const [searchTerm, setSearchTerm] = useState("");
  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "AD";
  const displayName = user?.fullName || "Administrator";
  const displayRole = user?.role?.name || "Admin";

  const [openSections, setOpenSections] = useState(() => ({
    products: true,
    orders: true,
    customers: true,
    marketing: false,
    support: false,
    staff: false,
    settings: false,
  }));

  const badgeMap = useMemo(() => ({ pendingOrders }), [pendingOrders]);

  const toggleSection = (sectionId) => {
    setOpenSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const sectionBodyClass = (section) => {
    const closed = section.collapsible && !openSections[section.id];
    return [
      "sidebar-collapse-section",
      closed ? "max-h-0 opacity-0 pointer-events-none" : "max-h-[2000px] opacity-100",
    ].join(" ");
  };

  // Auto-expand all when searching
  useEffect(() => {
    if (searchTerm.trim()) {
      const allOpen = {};
      SECTIONS.forEach(s => allOpen[s.id] = true);
      setOpenSections(allOpen);
    }
  }, [searchTerm]);

  const filteredSections = useMemo(() => {
    if (!searchTerm.trim()) return SECTIONS;
    const term = searchTerm.toLowerCase();
    
    return SECTIONS.map(section => {
      if (section.subGroups) {
        const filteredSubGroups = section.subGroups.map(sg => {
          const filteredItems = sg.items.filter(item => 
            item.name.toLowerCase().includes(term) || t(`admin.${item.key}`, item.name).toLowerCase().includes(term)
          );
          return { ...sg, items: filteredItems };
        }).filter(sg => sg.items.length > 0);
        return { ...section, subGroups: filteredSubGroups };
      } else {
        const filteredItems = section.items.filter(item => 
          item.name.toLowerCase().includes(term) || t(`admin.${item.key}`, item.name).toLowerCase().includes(term)
        );
        return { ...section, items: filteredItems };
      }
    }).filter(section => 
      (section.items && section.items.length > 0) || 
      (section.subGroups && section.subGroups.length > 0)
    );
  }, [searchTerm, t]);

  const renderItem = (menu) => (
    <li key={menu.name} className="mb-0.5 relative group">
      <NavLink
        to={menu.path}
        end={menu.path === "/admin"}
        className={({ isActive }) =>
          [
            "relative flex items-center gap-0 rounded-xl transition-all duration-200 border-l-[3px]",
            isActive
              ? "bg-gradient-to-r from-[var(--color-primary-)] to-indigo-600 text-white shadow-md shadow-[var(--color-primary-)]/60 border-white pl-[9px] pr-3 py-2.5"
              : "border-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-subtle)] hover:text-[var(--color-primary)] px-3 py-2.5",
          ].join(" ")
        }
        onClick={() => setIsSidebarOpen(false)}
        title={t(`admin.${menu.key}`, menu.name)}
      >
        <menu.icon className="text-base lg:mr-3 flex-shrink-0" />
        <span className={`text-sm font-medium leading-none flex-1 text-left truncate ${collapsed ? "hidden" : "hidden lg:block"}`}>
          {t(`admin.${menu.key}`, menu.name)}
        </span>
        {menu.badge && badgeMap[menu.badge] > 0 ? (
          <span className={`ml-auto min-w-5 h-5 px-1.5 rounded-full text-[10px] font-semibold bg-red-500 text-white items-center justify-center admin-badge border border-white/20 ${collapsed ? "hidden" : "hidden lg:inline-flex"}`}>
            {badgeMap[menu.badge]}
          </span>
        ) : null}
      </NavLink>
      {/* Tooltip for collapsed mode */}
      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 lg:hidden whitespace-nowrap z-50 transition-opacity">
        {t(`admin.${menu.key}`, menu.name)}
      </div>
    </li>
  );

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 flex flex-col transform ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } lg:relative lg:translate-x-0 w-64 md:w-20 ${collapsed ? "lg:w-20" : "lg:w-64"} h-full bg-[var(--color-bg)] border-r border-[var(--color-border)] shadow-lg transition-all duration-300 ease-in-out`}
    >
      {/* Logo area */}
      <div className="relative p-5 flex items-center justify-center lg:justify-start border-b border-[var(--color-border)] h-[73px] overflow-hidden shrink-0">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[var(--color-primary-)] to-indigo-500" />
        <img src={logoText} alt="Logo" className="h-8 lg:mr-3 object-contain" />
        <span className={`text-base font-bold bg-gradient-to-r from-[var(--color-primary-)] to-indigo-600 bg-clip-text text-transparent ${collapsed ? "hidden" : "hidden lg:block"}`}>
          {t("admin.techstore")}
        </span>
      </div>

      {/* Search Bar - Only visible on desktop/expanded */}
      <div className={`px-4 pt-4 pb-2 ${collapsed ? "hidden" : "hidden lg:block"}`}>
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] text-sm" />
          <input
            type="text"
            placeholder={t("admin.search_menu", "Tìm kiếm menu...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-[var(--color-bg-subtle)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all text-[var(--color-text)] placeholder-[var(--color-text-muted)]"
          />
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-thin scroll-smooth">
        <nav className="px-3 py-2 space-y-2">
          {filteredSections.map((section) => (
            <div key={section.label}>
              <button
                type="button"
                onClick={() => section.collapsible && toggleSection(section.id)}
                className={`w-full items-center justify-between px-3 mb-1.5 mt-2 text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors group ${collapsed ? "hidden" : "hidden lg:flex"}`}
              >
                <div className="flex items-center gap-2">
                  <span>{section.label}</span>
                  {section.id === "products" && !searchTerm && (
                    <span className="bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] px-1.5 py-0.5 rounded text-[8px] group-hover:bg-[var(--color-primary-light)] transition-colors">
                      18
                    </span>
                  )}
                </div>
                {section.collapsible ? (
                  openSections[section.id] ? (
                    <FaChevronDown className="text-[10px]" />
                  ) : (
                    <FaChevronRight className="text-[10px]" />
                  )
                ) : null}
              </button>
              <div className={sectionBodyClass(section)}>
                {section.subGroups ? (
                  <div className="space-y-3 mt-1 mb-2">
                    {section.subGroups.map(sg => (
                      <div key={sg.label}>
                        <div className={`px-3 mb-1.5 items-center ${collapsed ? "hidden" : "hidden lg:flex"}`}>
                          <span className="text-[10px] font-semibold text-[var(--color-text-muted)] opacity-70 tracking-wide">{sg.label}</span>
                          <div className="h-px bg-[var(--color-border)] flex-1 ml-3" />
                        </div>
                        <ul className="space-y-0.5">
                          {sg.items.map(renderItem)}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <ul className="space-y-0.5">
                    {section.items.map(renderItem)}
                  </ul>
                )}
              </div>
            </div>
          ))}
          {filteredSections.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-[var(--color-text-muted)] hidden lg:block">
              {t("admin.no_results", "Không tìm thấy menu phù hợp")}
            </div>
          )}
        </nav>
      </div>

      {/* User block */}
      <div className="shrink-0 p-3 border-t border-[var(--color-border)] bg-[var(--color-bg-subtle)]/80">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden lg:flex items-center justify-center w-full py-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-subtle)] rounded-lg transition-colors mb-2"
        >
          {collapsed ? <FaChevronRight size={12} /> : <FaChevronDown size={12} />}
          {!collapsed && <span className="ml-2 text-xs">Thu gọn</span>}
        </button>
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] shadow-sm">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-primary-)] to-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[var(--color-bg)] rounded-full"></div>
          </div>
          <div className={`${collapsed ? "hidden" : "hidden lg:block"} min-w-0 flex-1`}>
            <div className="text-sm font-semibold text-[var(--color-text)] truncate">
              {displayName}
            </div>
            <div className="text-xs text-[var(--color-text-secondary)] truncate">
              {displayRole}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
