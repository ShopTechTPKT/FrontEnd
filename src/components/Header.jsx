import React, { useContext, useEffect, useState, useRef } from "react";
import logo from "../assets/shop.svg";
import { Link, useLocation, useNavigate } from "react-router-dom";
import path from "../constant/path";
import { useDispatch, useSelector } from "react-redux";
import { UserContext } from "../context/UserContext";
import CartDropdown from "./CartDropdown";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { loadCartItems } from "../utils/redux/cartSlice";
import notify from "../utils/notify";

// Sub-components
import { IconChevronDown, IconCart, IconMenu, IconClose, IconFacebook } from "./header/HeaderIcons";
import { HeaderMegaMenu, HeaderSupportMenu } from "./header/HeaderMegaMenu";
import HeaderMobileMenu from "./header/HeaderMobileMenu";
import { getSupportLinks } from "./header/navData";

const Header = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout, isCustomer, isAdmin, isCustomerService } =
    useContext(UserContext);

  // ── State ──────────────────────────────────────────────────
  const [showDropdown, setShowDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showCartDropdown, setShowCartDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const dropdownRef = useRef(null);
  const cartDropdownRef = useRef(null);

  // ── Cart ───────────────────────────────────────────────────
  const cartQuantity = useSelector((state) =>
    state.cart.cartSummary ? state.cart.cartSummary.totalItems : 0
  );

  useEffect(() => {
    dispatch(loadCartItems());
  }, [dispatch]);

  // ── Navigation helpers ─────────────────────────────────────
  const handleNavigate = (targetPath, state) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    navigate(targetPath, { state });
  };

  const isActive = (targetPath) => location.pathname === targetPath;

  // ── Scroll tracking ────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── Click outside handlers ─────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (cartDropdownRef.current && !cartDropdownRef.current.contains(event.target)) {
        setShowCartDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── User dropdown handlers ─────────────────────────────────
  const handleMouseEnter = () => setShowDropdown(true);
  const handleMouseLeave = () => {
    setTimeout(() => {
      if (dropdownRef.current && !dropdownRef.current.matches(":hover")) {
        setShowDropdown(false);
      }
    }, 100);
  };
  const handleMenuItemClick = () => setShowDropdown(false);

  const handleLogoutConfirm = () => {
    logout();
    setShowDropdown(false);
    notify.success("Đăng xuất thành công!");
  };

  // ── Cart dropdown handlers ─────────────────────────────────
  const handleCartMouseEnter = () => setShowCartDropdown(true);
  const handleCartMouseLeave = () => {
    setTimeout(() => {
      if (cartDropdownRef.current && !cartDropdownRef.current.matches(":hover")) {
        setShowCartDropdown(false);
      }
    }, 100);
  };

  // ── Mobile menu handlers ───────────────────────────────────
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  useEffect(() => {
    closeMobileMenu();
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) closeMobileMenu();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const original = document.body.style.overflow;
    if (isMobileMenuOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [isMobileMenuOpen]);

  // ── Shared style classes ───────────────────────────────────
  const navLinkClass = (active) =>
    `px-3 py-2 rounded-lg transition-colors ${
      active
        ? "text-violet-700 bg-violet-50"
        : "text-gray-700 hover:text-violet-700 hover:bg-violet-50"
    }`;

  const supportLinks = getSupportLinks();

  // ── Render ─────────────────────────────────────────────────
  return (
    <header
      className={`font-sans fixed top-0 left-0 right-0 z-50 transition-shadow duration-300 ${
        isScrolled ? "shadow-sm" : ""
      }`}
    >
      {/* ── Top Bar ────────────────────────────────────────── */}
      <div
        className={`hidden md:flex bg-white text-xs items-center justify-between px-4 md:px-8 py-1.5 border-b border-gray-100 transition-all duration-300 ${
          isScrolled ? "!hidden" : ""
        }`}
      >
        <div className="flex items-center gap-2 text-gray-500">
          <span>{t("header.visitShop")}</span>
          <span className="text-gray-300">|</span>
          <Link to="/contact" className="text-gray-700 hover:text-gray-900 transition-colors">
            {t("header.contactUs")}
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-500">
            {t("header.call")}{" "}
            <strong className="text-gray-700">{t("header.inContactUs")}</strong>
          </span>
          <a href="#" className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors">
            <IconFacebook className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* ── Main Navigation Bar ────────────────────────────── */}
      <div
        className={`bg-white border-b border-gray-200 transition-all duration-300 ${
          isScrolled ? "py-2" : "py-3"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex items-center justify-between gap-3">
          {/* Logo */}
          <Link to={path.home} className="shrink-0">
            <img
              src={logo}
              alt={t("remaining.logo")}
              className={`transition-all duration-300 ${isScrolled ? "h-8" : "h-10"}`}
            />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex flex-1 justify-center">
            <ul className="flex items-center gap-1 text-sm font-medium">
              {/* Home */}
              <li>
                <Link to={path.home} className={navLinkClass(isActive(path.home))}>
                  {t("nav.home")}
                </Link>
              </li>

              {/* Products (with Mega Menu) */}
              <li className="relative group">
                <button className={`flex items-center gap-1 ${navLinkClass(location.pathname === "/products")}`}>
                  <span>{t("nav.products")}</span>
                  <IconChevronDown className="w-3 h-3 transition-transform duration-200 group-hover:rotate-180" />
                </button>
                <HeaderMegaMenu onNavigate={handleNavigate} />
              </li>

              {/* Deals */}
              <li>
                <Link to="/deals" className={`relative ${navLinkClass(isActive("/deals"))}`}>
                  {t("nav.deals")}
                  <span className="absolute -top-1 -right-3 bg-red-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-full leading-none">
                    {t("nav.hotBadge")}
                  </span>
                </Link>
              </li>

              {/* Blog */}
              <li>
                <Link to="/blog" className={navLinkClass(isActive("/blog"))}>
                  {t("nav.blog")}
                </Link>
              </li>

              {/* Support */}
              <li className="relative group">
                <button className="flex items-center gap-1 px-3 py-2 rounded-lg text-gray-700 hover:text-violet-700 hover:bg-violet-50 transition-colors">
                  <span>{t("nav.support")}</span>
                  <IconChevronDown className="w-3 h-3 transition-transform duration-200 group-hover:rotate-180" />
                </button>
                <HeaderSupportMenu links={supportLinks} isCustomerService={isCustomerService} />
              </li>
            </ul>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <LanguageSwitcher />

            {/* Cart */}
            <div
              className="relative"
              ref={cartDropdownRef}
              onMouseEnter={handleCartMouseEnter}
              onMouseLeave={handleCartMouseLeave}
            >
              <button
                className="relative w-9 h-9 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setShowCartDropdown(!showCartDropdown)}
              >
                <IconCart className="w-[18px] h-[18px]" />
                {cartQuantity > 0 && (
                  <span className="absolute -top-1 -right-1 bg-violet-700 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {cartQuantity}
                  </span>
                )}
              </button>
              <CartDropdown
                isOpen={showCartDropdown}
                onClose={() => setShowCartDropdown(false)}
              />
            </div>

            {/* User Account (desktop) */}
            <div
              className="relative hidden sm:block"
              ref={dropdownRef}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className="px-3 h-9 flex items-center justify-center text-sm font-medium rounded-lg text-gray-700 hover:text-violet-700 hover:bg-violet-50 transition-colors"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                {user ? t("account.myAccount") : t("account.loginRegister")}
              </button>

              {showDropdown && (
                <div className="absolute right-0 w-60 mt-2 bg-white border border-gray-200 rounded-xl shadow-md shadow-gray-200/40 z-10 overflow-hidden animate-fadeIn">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">
                      {user
                        ? `${t("header.hello")}, ${user.fullName}`
                        : t("header.welcomeBack")}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {user ? t("header.manageAccount") : t("header.pleaseLogin")}
                    </p>
                  </div>

                  <div className="py-1">
                    {user ? (
                      <>
                        {isCustomer && (
                          <Link to="/userProfile" onClick={handleMenuItemClick} className="block px-4 py-2 text-sm text-gray-700 hover:text-violet-700 hover:bg-violet-50 transition-colors">
                            {t("account.myAccount")}
                          </Link>
                        )}
                        {isAdmin && (
                          <Link to="/admin" onClick={handleMenuItemClick} className="block px-4 py-2 text-sm text-gray-700 hover:text-violet-700 hover:bg-violet-50 transition-colors">
                            {t("account.manage")}
                          </Link>
                        )}
                        {isCustomerService && (
                          <Link to="/customer-service" onClick={handleMenuItemClick} className="block px-4 py-2 text-sm text-gray-700 hover:text-violet-700 hover:bg-violet-50 transition-colors">
                            {t("account.staff")}
                          </Link>
                        )}
                        <Link to="/favorites" onClick={handleMenuItemClick} className="block px-4 py-2 text-sm text-gray-700 hover:text-violet-700 hover:bg-violet-50 transition-colors">
                          Yêu thích
                        </Link>
                        <div className="my-1 border-t border-gray-100" />
                        <button onClick={handleLogoutConfirm} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                          {t("account.signOut")}
                        </button>
                      </>
                    ) : (
                      <Link
                        to="/login"
                        onClick={() => { handleMenuItemClick(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        className="block px-4 py-2 text-sm font-medium text-gray-700 hover:text-violet-700 hover:bg-violet-50 transition-colors"
                      >
                        {t("account.loginRegister")}
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label={isMobileMenuOpen ? "Đóng menu" : "Mở menu"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <IconClose className="w-4 h-4" />
              ) : (
                <IconMenu className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ────────────────────────────────────── */}
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
