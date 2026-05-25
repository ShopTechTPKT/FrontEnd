import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { IconCart, IconMenu, IconClose } from "./HeaderIcons";
import NotificationBell from "./NotificationBell";
import CartDrawer from "../CartDrawer";
import LanguageSwitcher from "../LanguageSwitcher";
import ThemeToggle from "../ui/ThemeToggle";
import HeaderSearchBar from "./HeaderSearchBar";

const HeaderActions = ({
  user,
  cartQuantity,
  isCustomer,
  isAdmin,
  isCustomerService,
  onLogout,
  onNavigate,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  setMobileSearchOpen
}) => {
  const { t } = useTranslation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const dropdownRef = useRef(null);

  const openCommandPalette = () => {
    window.dispatchEvent(new Event("open-command-search"));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMouseEnter = () => setShowDropdown(true);
  const handleMouseLeave = () => {
    setTimeout(() => {
      if (dropdownRef.current && !dropdownRef.current.matches(":hover")) {
        setShowDropdown(false);
      }
    }, 100);
  };
  const handleMenuItemClick = () => setShowDropdown(false);

  return (
    <>
      <div className="mx-2 hidden min-w-0 flex-1 md:block">
        <HeaderSearchBar onNavigate={onNavigate} />
      </div>

      <button
        type="button"
        onClick={openCommandPalette}
        className="hidden h-10 items-center gap-2 rounded-xl border border-gray-200 px-3 text-sm text-gray-600 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 lg:flex"
        aria-label="Mở tìm kiếm nhanh"
        title="Tìm kiếm nhanh (Ctrl+K)"
      >
        <span>⌘</span>
        <span className="font-mono text-xs">Ctrl+K</span>
      </button>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 md:hidden"
          onClick={() => setMobileSearchOpen(true)}
          aria-label={t("common.search", { defaultValue: "Tìm kiếm" })}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        <div className="flex items-center gap-1 lg:hidden">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>

        <NotificationBell />

        <div className="relative">
          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 min-h-[44px] min-w-[44px]"
            onClick={() => setShowCartDrawer(true)}
          >
            <IconCart className="h-[18px] w-[18px]" />
            {cartQuantity > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-violet-700 px-1 text-[10px] font-bold text-white animate-pulse-subtle">
                {cartQuantity}
              </span>
            )}
          </button>
          <CartDrawer isOpen={showCartDrawer} onClose={() => setShowCartDrawer(false)} />
        </div>

        <div
          className="relative hidden sm:block"
          ref={dropdownRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button
            type="button"
            className="flex h-10 items-center justify-center rounded-xl px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-violet-50 hover:text-violet-700 dark:text-gray-200 dark:hover:bg-violet-950/50"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            {user ? t("account.myAccount") : t("account.loginRegister")}
          </button>

          {showDropdown && (
            <div className="absolute right-0 z-[var(--z-dropdown)] mt-2 w-60 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg animate-fadeIn dark:border-gray-700 dark:bg-gray-900">
              <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-800">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {user ? `${t("header.hello")}, ${user.fullName}` : t("header.welcomeBack")}
                </p>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  {user ? t("header.manageAccount") : t("header.pleaseLogin")}
                </p>
              </div>

              <div className="py-1">
                {user ? (
                  <>
                    {isCustomer && (
                      <Link to="/userProfile" onClick={handleMenuItemClick} className="block px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-violet-50 hover:text-violet-700 dark:text-gray-200 dark:hover:bg-violet-950/40">
                        {t("account.myAccount")}
                      </Link>
                    )}
                    {isAdmin && (
                      <Link to="/admin" onClick={handleMenuItemClick} className="block px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-violet-50 hover:text-violet-700 dark:text-gray-200 dark:hover:bg-violet-950/40">
                        {t("account.manage")}
                      </Link>
                    )}
                    {isCustomerService && (
                      <Link to="/cs" onClick={handleMenuItemClick} className="block px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-violet-50 hover:text-violet-700 dark:text-gray-200 dark:hover:bg-violet-950/40">
                        {t("account.staff")}
                      </Link>
                    )}
                    <Link to="/favorites" onClick={handleMenuItemClick} className="block px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-violet-50 hover:text-violet-700 dark:text-gray-200 dark:hover:bg-violet-950/40">
                      {t("nav.favorites")}
                    </Link>
                    <div className="my-1 border-t border-gray-100 dark:border-gray-800" />
                    <button type="button" onClick={() => { onLogout(); setShowDropdown(false); }} className="w-full px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30">
                      {t("account.signOut")}
                    </button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => { handleMenuItemClick(); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="block px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-violet-50 hover:text-violet-700 dark:text-gray-200 dark:hover:bg-violet-950/40">
                    {t("account.loginRegister")}
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-600 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800 lg:hidden min-h-[44px] min-w-[44px]"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          aria-label={isMobileMenuOpen ? t("header.closeMenu") : t("header.openMenu")}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <IconClose className="h-4 w-4" /> : <IconMenu className="h-4 w-4" />}
        </button>
      </div>
    </>
  );
};

export default HeaderActions;
