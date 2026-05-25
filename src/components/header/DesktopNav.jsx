import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import path from "../../constant/path";
import { IconChevronDown } from "./HeaderIcons";
import { HeaderMegaMenu, HeaderSupportMenu } from "./HeaderMegaMenu";
import { getSupportLinks } from "./navData";

const DesktopNav = ({ onNavigate, isCustomerService }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const supportLinks = getSupportLinks();

  const isActive = (targetPath) => location.pathname === targetPath;

  const navLinkClass = (active) =>
    `px-3 py-2 rounded-lg transition-colors font-medium ${
      active
        ? "text-violet-700 bg-violet-50 border-b-2 border-violet-700 dark:text-violet-300 dark:bg-violet-950/50"
        : "text-gray-600 hover:text-violet-700 hover:bg-violet-50/60 dark:text-gray-300 dark:hover:bg-violet-950/30"
    }`;

  return (
    <ul className="flex flex-wrap items-center justify-center gap-1 text-sm font-medium">
      <li>
        <Link to={path.home} className={navLinkClass(isActive(path.home))}>
          {t("nav.home")}
        </Link>
      </li>
      <li className="group relative">
        <button type="button" className={`flex items-center gap-1 ${navLinkClass(location.pathname === "/products")}`}>
          <span>{t("nav.products")}</span>
          <IconChevronDown className="h-3 w-3 transition-transform duration-200 group-hover:rotate-180" />
        </button>
        <HeaderMegaMenu onNavigate={onNavigate} />
      </li>
      <li>
        <Link
          to="/pc-builder"
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
            isActive("/pc-builder")
              ? "text-white bg-violet-700"
              : "text-violet-700 hover:text-white hover:bg-violet-700 dark:text-violet-300"
          }`}
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
          <span>{t("nav.pcBuilder")}</span>
        </Link>
      </li>
      <li>
        <Link to="/deals" className={`relative ${navLinkClass(isActive("/deals"))}`}>
          {t("nav.deals")}
          <span className="absolute -top-1 -right-3 animate-pulse rounded-full bg-red-500 px-1 py-0.5 text-[8px] font-bold leading-none text-white">
            {t("nav.hotBadge")}
          </span>
        </Link>
      </li>
      <li>
        <Link to="/blog" className={navLinkClass(isActive("/blog"))}>
          {t("nav.blog")}
        </Link>
      </li>
      <li className="group relative">
        <button type="button" className="flex items-center gap-1 rounded-lg px-3 py-2 text-gray-700 transition-colors hover:bg-violet-50 hover:text-violet-700 dark:text-gray-200 dark:hover:bg-violet-950/40">
          <span>{t("nav.support")}</span>
          <IconChevronDown className="h-3 w-3 transition-transform duration-200 group-hover:rotate-180" />
        </button>
        <HeaderSupportMenu links={supportLinks} isCustomerService={isCustomerService} />
      </li>
    </ul>
  );
};

export default DesktopNav;
