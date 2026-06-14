import React, { useContext, useEffect, useState, useRef, useCallback } from "react";
import logo from "../assets/shop.svg";
import { Link, useLocation, useNavigate } from "react-router-dom";
import path from "../constant/path";
import { useDispatch, useSelector } from "react-redux";
import { UserContext } from "../context/UserContext";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { loadCartItems } from "../utils/redux/cartSlice";
import { selectCartTotalItems } from "../utils/redux/selectors";
import notify from "../utils/notify";

import { IconFacebook } from "./header/HeaderIcons";
import HeaderMobileMenu from "./header/HeaderMobileMenu";
import HeaderSearchBar from "./header/HeaderSearchBar";
import DesktopNav from "./header/DesktopNav";
import HeaderActions from "./header/HeaderActions";

const Header = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout, isCustomer, isAdmin, isCustomerService } = useContext(UserContext);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hideOnScrollMobile, setHideOnScrollMobile] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const lastScrollYRef = useRef(0);
  const cartQuantity = useSelector(selectCartTotalItems);

  const cartLoaded = useRef(false);
  useEffect(() => {
    if (!cartLoaded.current) {
      dispatch(loadCartItems());
      cartLoaded.current = true;
    }
  }, [dispatch]);

  const handleNavigate = useCallback((targetPath, state) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    navigate(targetPath, { state });
  }, [navigate]);

  const isActive = (targetPath) => location.pathname === targetPath;

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;
          setIsScrolled(currentY > 50);

          if (window.innerWidth < 1024) {
            const isScrollingDown = currentY > lastScrollYRef.current;
            const shouldHide =
              isScrollingDown &&
              currentY > 120 &&
              !isMobileMenuOpen &&
              !mobileSearchOpen;
            setHideOnScrollMobile(shouldHide);
          } else {
            setHideOnScrollMobile(false);
          }

          lastScrollYRef.current = currentY;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobileMenuOpen, mobileSearchOpen]);

  const handleLogoutConfirm = useCallback(() => {
    logout();
    notify.success(t("header.logoutSuccess"));
  }, [logout, t]);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  useEffect(() => {
    closeMobileMenu();
    setMobileSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      setHideOnScrollMobile(false);
    }
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) closeMobileMenu();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const original = document.body.style.overflow;
    if (isMobileMenuOpen || mobileSearchOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [isMobileMenuOpen, mobileSearchOpen]);

  return (
    <header
      className={`font-sans fixed left-0 right-0 top-0 z-[var(--z-sticky)] transition-all duration-300 lg:translate-y-0 ${
        hideOnScrollMobile ? "-translate-y-full" : "translate-y-0"
      } ${isScrolled ? "shadow-sm" : ""}`}
    >
      {/* Top bar đơn giản - desktop lg+ */}
      <div
        className={`hidden border-b border-slate-100 bg-white/40 backdrop-blur-xs text-[11px] transition-all duration-300 dark:border-slate-800/60 dark:bg-slate-900/20 lg:flex lg:items-center lg:justify-between lg:px-8 lg:py-1 ${
          isScrolled ? "!hidden" : ""
        }`}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3 text-slate-500 dark:text-gray-400">
          <span className="font-medium text-slate-500 dark:text-gray-400 text-[11px] tracking-wide flex items-center gap-1.5">
            <svg className="h-3 w-3 text-indigo-500 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Miễn phí vận chuyển từ 500.000đ
          </span>
          <span className="h-3 w-[1px] bg-slate-200 dark:bg-slate-800" />
          <span className="font-medium text-slate-500 dark:text-gray-400 text-[11px] tracking-wide flex items-center gap-1.5">
            <svg className="h-3 w-3 text-indigo-500 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Đổi trả trong 7 ngày
          </span>
          <span className="h-3 w-[1px] bg-slate-200 dark:bg-slate-800 hidden xl:inline" />
          <Link to="/contact" className="hidden shrink-0 text-slate-500 hover:text-indigo-600 dark:text-gray-400 xl:inline transition-colors">
            Liên hệ hỗ trợ
          </Link>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="hidden text-slate-500 md:inline dark:text-gray-400">
            Hotline: <strong className="font-semibold text-slate-700 dark:text-slate-200">1900 1234</strong>
          </span>
          <a
            href="#"
            className="flex h-6 w-6 items-center justify-center text-slate-400 transition-colors hover:text-indigo-500"
            aria-label="Facebook"
          >
            <IconFacebook className="h-3.5 w-3.5" />
          </a>
          <LanguageSwitcher />
        </div>
      </div>

      <div
        className={`relative border-b border-slate-100 transition-colors duration-300 dark:border-slate-900 ${
          isScrolled ? "bg-white/80 backdrop-blur-md py-1.5 dark:bg-slate-950/80 shadow-sm" : "bg-white/80 backdrop-blur-md py-2.5 dark:bg-slate-950/80"
        }`}
      >
        <div className="container-app flex flex-col gap-2">
          <div className="flex items-center justify-between gap-4">
            <Link to={path.home} className="group shrink-0 transition-transform duration-200 active:scale-95">
              <img
                src={logo}
                alt={t("remaining.logo")}
                className={`transition-all duration-300 ${isScrolled ? "h-7" : "h-8 lg:h-[34px]"}`}
              />
            </Link>

            <HeaderActions
              user={user}
              cartQuantity={cartQuantity}
              isCustomer={isCustomer}
              isAdmin={isAdmin}
              isCustomerService={isCustomerService}
              onLogout={handleLogoutConfirm}
              onNavigate={handleNavigate}
              isMobileMenuOpen={isMobileMenuOpen}
              setIsMobileMenuOpen={setIsMobileMenuOpen}
              setMobileSearchOpen={setMobileSearchOpen}
            />
          </div>

          <nav className="hidden border-t border-slate-100 pt-1 dark:border-slate-900 lg:block">
            <DesktopNav onNavigate={handleNavigate} isCustomerService={isCustomerService} />
          </nav>
        </div>
      </div>

      {mobileSearchOpen && (
        <div
          className="fixed inset-0 z-[var(--z-modal)] flex flex-col bg-white p-4 dark:bg-[var(--color-bg)] md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label={t("common.search", { defaultValue: "Tìm kiếm" })}
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t("common.search", { defaultValue: "Tìm kiếm" })}</p>
            <button
              type="button"
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setMobileSearchOpen(false)}
              aria-label={t("header.closeMenu")}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <HeaderSearchBar
            autoFocus
            className="max-w-none"
            onNavigate={(p) => {
              setMobileSearchOpen(false);
              handleNavigate(p);
            }}
          />
        </div>
      )}

      <HeaderMobileMenu
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
        onNavigate={handleNavigate}
        isActive={isActive}
        user={user}
        isCustomer={isCustomer}
        isAdmin={isAdmin}
        isCustomerService={isCustomerService}
        onLogout={handleLogoutConfirm}
      />
    </header>
  );
};

export default Header;
