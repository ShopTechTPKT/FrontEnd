import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { IconCart, IconMenu, IconClose } from "./HeaderIcons";
import NotificationBell from "./NotificationBell";
import CartDrawer from "../CartDrawer";
import LanguageSwitcher from "../LanguageSwitcher";
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

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 md:hidden"
          onClick={() => setMobileSearchOpen(true)}
          aria-label={t("common.search", { defaultValue: "Tìm kiếm" })}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        <div className="flex items-center gap-1 lg:hidden">
          <LanguageSwitcher />
        </div>

        <NotificationBell />

        <div className="relative">
          <button
            type="button"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 transition-all hover:bg-slate-50 active:scale-95 dark:text-gray-300 dark:hover:bg-slate-900"
            onClick={() => setShowCartDrawer(true)}
          >
            <IconCart className="h-[18px] w-[18px]" />
            {cartQuantity > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-950">
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
            className="flex h-9 items-center justify-center rounded-xl px-3.5 text-xs font-semibold text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-95 dark:text-gray-200 dark:hover:bg-slate-900"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            {user ? t("account.myAccount") : t("account.loginRegister")}
          </button>

          {showDropdown && (
            <div className="absolute right-0 z-[var(--z-dropdown)] mt-1.5 w-56 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xl animate-fadeIn dark:border-slate-800 dark:bg-slate-950">
              <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-900">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {user ? `${t("header.hello")}, ${user.fullName}` : t("header.welcomeBack")}
                </p>
                <p className="mt-0.5 text-[10px] text-slate-400 dark:text-slate-500">
                  {user ? t("header.manageAccount") : t("header.pleaseLogin")}
                </p>
              </div>

              <div className="py-1">
                {user ? (
                  <>
                    {isCustomer && (
                      <Link to="/userProfile" onClick={handleMenuItemClick} className="block px-4 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900/60 dark:hover:text-slate-100">
                        {t("account.myAccount")}
                      </Link>
                    )}
                    {isAdmin && (
                      <Link to="/admin" onClick={handleMenuItemClick} className="block px-4 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900/60 dark:hover:text-slate-100">
                        {t("account.manage")}
                      </Link>
                    )}
                    {isCustomerService && (
                      <Link to="/cs" onClick={handleMenuItemClick} className="block px-4 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900/60 dark:hover:text-slate-100">
                        {t("account.staff")}
                      </Link>
                    )}
                    <Link to="/favorites" onClick={handleMenuItemClick} className="block px-4 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900/60 dark:hover:text-slate-100">
                      {t("nav.favorites")}
                    </Link>
                    <div className="my-1 border-t border-slate-100 dark:border-slate-900" />
                    <button type="button" onClick={() => { onLogout(); setShowDropdown(false); }} className="w-full px-4 py-2 text-left text-xs font-semibold text-red-500 transition-colors hover:bg-red-50/50 dark:hover:bg-red-950/20">
                      {t("account.signOut")}
                    </button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => { handleMenuItemClick(); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="block px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950 dark:text-slate-200 dark:hover:bg-slate-900">
                    {t("account.loginRegister")}
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 transition-all hover:bg-slate-50 active:scale-95 dark:text-gray-300 dark:hover:bg-slate-900 lg:hidden"
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
