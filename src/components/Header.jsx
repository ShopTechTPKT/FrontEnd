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
import ThemeToggle from "./ui/ThemeToggle";

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
      } ${isScrolled ? "shadow-md" : ""}`}
    >
      {/* Top bar đơn giản - desktop lg+ */}
      <div
        className={`hidden border-b border-gray-100/80 bg-white/95 text-xs transition-all duration-300 dark:border-[var(--color-border)] dark:bg-[var(--color-bg)]/95 lg:flex lg:items-center lg:justify-between lg:px-8 lg:py-1.5 ${
          isScrolled ? "!hidden" : ""
        }`}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2 text-gray-600 dark:text-gray-300">
          <span className="rounded-full border border-violet-100 bg-violet-50 px-2.5 py-1 font-medium text-violet-700 dark:border-violet-900/60 dark:bg-violet-950/40 dark:text-violet-300">
            Miễn phí vận chuyển từ 500.000đ
          </span>
          <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
            Đổi trả trong 7 ngày
          </span>
          <Link to="/contact" className="hidden shrink-0 text-gray-600 hover:text-violet-700 dark:text-gray-300 xl:inline">
            Liên hệ hỗ trợ
          </Link>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="hidden text-gray-500 md:inline dark:text-gray-400">
            Hotline: <strong className="text-gray-800 dark:text-gray-200">1900 1234</strong>
          </span>
          <a
            href="#"
            className="flex h-6 w-6 items-center justify-center text-gray-400 transition-colors hover:text-violet-600"
            aria-label="Facebook"
          >
            <IconFacebook className="h-3.5 w-3.5" />
          </a>
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>

      <div
        className={`relative border-b border-gray-200/80 transition-all duration-300 dark:border-[var(--color-border)] ${
          isScrolled ? "bg-white/90 py-2 backdrop-blur-xl dark:bg-[var(--color-bg)]/90" : "bg-white py-2 dark:bg-[var(--color-bg)]"
        }`}
      >
        <div className="container-app flex flex-col gap-2 lg:gap-3">
          <div className="flex items-center justify-between gap-2 lg:gap-4">
            <Link to={path.home} className="group shrink-0 transition-transform duration-300 hover:scale-[1.02]">
              <img
                src={logo}
                alt={t("remaining.logo")}
                className={`transition-all duration-300 ${isScrolled ? "h-8" : "h-9 lg:h-10"}`}
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

          <nav className="hidden border-t border-gray-100 pt-1 dark:border-[var(--color-border)] lg:block">
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
