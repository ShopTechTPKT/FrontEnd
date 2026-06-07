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
    `px-3.5 py-1.5 rounded-lg transition-all duration-150 font-medium text-[13px] tracking-wide ${
      active
        ? "text-indigo-600 bg-indigo-50/80 font-semibold dark:text-indigo-400 dark:bg-indigo-950/45"
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-900/40"
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
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold text-[13px] tracking-wide transition-all active:scale-[0.96] ${
            isActive("/pc-builder")
              ? "text-white bg-indigo-600 shadow-sm shadow-indigo-500/10"
              : "text-indigo-600 bg-indigo-50/50 hover:text-white hover:bg-indigo-600 dark:text-indigo-300 dark:bg-indigo-950/30 dark:hover:bg-indigo-600 dark:hover:text-white"
          }`}
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
          <span>{t("nav.pcBuilder")}</span>
        </Link>
      </li>
      <li>
        <Link to="/deals" className={`relative ${navLinkClass(isActive("/deals"))}`}>
          {t("nav.deals")}
          <span className="absolute -top-0.5 -right-2 rounded-full bg-red-500 px-1 py-0.5 text-[8px] font-bold leading-none text-white shadow-sm shadow-red-500/20">
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
        <button type="button" className="flex items-center gap-1 rounded-lg px-3.5 py-1.5 text-[13px] tracking-wide font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-900/40 transition-all duration-150">
          <span>{t("nav.support")}</span>
          <IconChevronDown className="h-3 w-3 transition-transform duration-200 group-hover:rotate-180" />
        </button>
        <HeaderSupportMenu links={supportLinks} isCustomerService={isCustomerService} />
      </li>
    </ul>
  );
};

export default DesktopNav;
