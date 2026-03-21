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

const IconChevronDown = ({ className = "" }) => (
  <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
    <path
      d="M5 7.5L10 12.5L15 7.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconCart = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M3 4H5L7.2 14.5C7.3 15 7.8 15.4 8.3 15.4H17.8C18.3 15.4 18.8 15 18.9 14.5L20.3 8.5H6.2"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="9.2" cy="19" r="1.4" fill="currentColor" />
    <circle cx="17.2" cy="19" r="1.4" fill="currentColor" />
  </svg>
);

const IconMenu = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M4 7H20M4 12H20M4 17H20"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const IconClose = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M6 6L18 18M18 6L6 18"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const IconFacebook = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M13.5 22V13.8H16.2L16.6 10.7H13.5V8.7C13.5 7.8 13.8 7.2 15.1 7.2H16.7V4.4C16.4 4.3 15.5 4.3 14.5 4.3C12.4 4.3 11 5.6 11 8V10.7H8.5V13.8H11V22H13.5Z" />
  </svg>
);

const Header = () => {
  const { t } = useTranslation();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showCartDropdown, setShowCartDropdown] = useState(false);
  const cartDropdownRef = useRef(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMobileProducts, setShowMobileProducts] = useState(false);
  const [showMobileSupport, setShowMobileSupport] = useState(false);
  const dispatch = useDispatch();

  const { user, logout, isCustomer, isAdmin, isCustomerService } =
    useContext(UserContext);

  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (targetPath, state) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    navigate(targetPath, { state });
  };

  const handleMouseEnter = () => setShowDropdown(true);

  const handleMouseLeave = () => {
    setTimeout(() => {
      if (dropdownRef.current && !dropdownRef.current.matches(":hover")) {
        setShowDropdown(false);
      }
    }, 100);
  };

  useEffect(() => {
    dispatch(loadCartItems());
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (
        cartDropdownRef.current &&
        !cartDropdownRef.current.contains(event.target)
      ) {
        setShowCartDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuItemClick = () => setShowDropdown(false);

  const handleLogoutConfirm = () => {
    logout();
    setShowDropdown(false);
    notify.success("Đăng xuất thành công!");
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClickCart = () => setShowCartDropdown(!showCartDropdown);

  const handleCartMouseEnter = () => setShowCartDropdown(true);

  const handleCartMouseLeave = () => {
    setTimeout(() => {
      if (
        cartDropdownRef.current &&
        !cartDropdownRef.current.matches(":hover")
      ) {
        setShowCartDropdown(false);
      }
    }, 100);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setShowMobileProducts(false);
    setShowMobileSupport(false);
  };

  const handleMobileNavigate = (targetPath, state) => {
    closeMobileMenu();
    handleNavigate(targetPath, state);
  };

  const cartQuantity = useSelector(state =>
    state.cart.cartSummary ? state.cart.cartSummary.totalItems : 0
  );

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
    const originalOverflow = document.body.style.overflow;
    if (isMobileMenuOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isMobileMenuOpen]);

  const isActive = targetPath => location.pathname === targetPath;

  const dropdownItemClass =
    "block w-full text-left px-2 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors";

  const mobileItemClass =
    "block w-full text-left rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-white hover:text-gray-900 transition-colors";

  return (
    <header
      className={`font-sans fixed top-0 left-0 right-0 z-50 transition-shadow duration-300 ${
        isScrolled ? "shadow-sm" : ""
      }`}
    >
      {/* Top Bar */}
      <div
        className={`hidden md:flex bg-white text-xs items-center justify-between px-4 md:px-8 py-1.5 border-b border-gray-100 transition-all duration-300 ${
          isScrolled ? "!hidden" : ""
        }`}
      >
        <div className="flex items-center gap-2 text-gray-500">
          <span>{t("header.visitShop")}</span>
          <span className="text-gray-300">|</span>
          <Link
            to="/contact"
            className="text-gray-700 hover:text-gray-900 transition-colors"
          >
            {t("header.contactUs")}
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-500">
            {t("header.call")}{" "}
            <strong className="text-gray-700">{t("header.inContactUs")}</strong>
          </span>
          <a
            href="#"
            className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
          >
            <IconFacebook className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Main Navigation */}
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
              className={`transition-all duration-300 ${
                isScrolled ? "h-8" : "h-10"
              }`}
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex flex-1 justify-center">
            <ul className="flex items-center gap-1 text-sm font-medium">
              {/* Home */}
              <li>
                <Link
                  to={path.home}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    isActive(path.home)
                      ? "text-violet-700 bg-violet-50"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {t("nav.home")}
                </Link>
              </li>

              {/* Products Dropdown */}
              <li className="relative group">
                <button
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                    location.pathname === "/products"
                      ? "text-violet-700 bg-violet-50"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <span>{t("nav.products")}</span>
                  <IconChevronDown className="w-3 h-3 transition-transform duration-200 group-hover:rotate-180" />
                </button>

                {/* Mega Menu */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 w-[680px] max-w-[calc(100vw-2rem)] z-20 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <div className="bg-white border border-gray-200 rounded-xl shadow-md shadow-gray-200/40 p-5">
                    <div className="grid grid-cols-4 gap-5">
                      {/* Laptops */}
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2.5 px-2">
                          {t("categories.laptops")}
                        </h3>
                        <button
                          onClick={() =>
                            handleNavigate("/products", {
                              list: [45, 46, 47, 48, 49, 50, 51],
                            })
                          }
                          className={dropdownItemClass}
                        >
                          {t("categories.allLaptops")}
                        </button>
                      </div>

                      {/* Gaming Gear */}
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2.5 px-2">
                          {t("categories.gamingGear")}
                        </h3>
                        <button
                          onClick={() =>
                            handleNavigate("/products", {
                              list: [6, 7, 8, 9, 10],
                            })
                          }
                          className={dropdownItemClass}
                        >
                          {t("categories.mouse")}
                        </button>
                        <button
                          onClick={() =>
                            handleNavigate("/products", {
                              list: [1, 2, 3, 4, 5],
                            })
                          }
                          className={dropdownItemClass}
                        >
                          {t("categories.keyboard")}
                        </button>
                        <button
                          onClick={() =>
                            handleNavigate("/products", {
                              list: [14, 15, 16],
                            })
                          }
                          className={dropdownItemClass}
                        >
                          {t("categories.gameGear")}
                        </button>
                        <button
                          onClick={() =>
                            handleNavigate("/products", {
                              list: [11, 12, 13],
                            })
                          }
                          className={dropdownItemClass}
                        >
                          {t("categories.mousePad")}
                        </button>
                        <button
                          onClick={() =>
                            handleNavigate("/products", { list: [42, 43] })
                          }
                          className={dropdownItemClass}
                        >
                          {t("categories.headphone")}
                        </button>
                      </div>

                      {/* PC Parts */}
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2.5 px-2">
                          {t("categories.pcParts")}
                        </h3>
                        <button
                          onClick={() =>
                            handleNavigate("/products", {
                              list: [36, 37, 38, 39],
                            })
                          }
                          className={dropdownItemClass}
                        >
                          {t("categories.monitor")}
                        </button>
                        <button
                          onClick={() =>
                            handleNavigate("/products", { list: [17] })
                          }
                          className={dropdownItemClass}
                        >
                          {t("categories.case")}
                        </button>
                        <button
                          onClick={() =>
                            handleNavigate("/products", { list: [18, 19] })
                          }
                          className={dropdownItemClass}
                        >
                          {t("categories.cpu")}
                        </button>
                        <button
                          onClick={() =>
                            handleNavigate("/products", {
                              list: [20, 21, 22],
                            })
                          }
                          className={dropdownItemClass}
                        >
                          {t("categories.mainboard")}
                        </button>
                        <button
                          onClick={() =>
                            handleNavigate("/products", {
                              list: [23, 24, 25, 26],
                            })
                          }
                          className={dropdownItemClass}
                        >
                          {t("categories.psu")}
                        </button>
                        <button
                          onClick={() =>
                            handleNavigate("/products", {
                              list: [27, 28, 29],
                            })
                          }
                          className={dropdownItemClass}
                        >
                          {t("categories.storage")}
                        </button>
                        <button
                          onClick={() =>
                            handleNavigate("/products", {
                              list: [30, 31, 32],
                            })
                          }
                          className={dropdownItemClass}
                        >
                          {t("categories.ram")}
                        </button>
                      </div>

                      {/* Smart Devices */}
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2.5 px-2">
                          {t("categories.smartDevice")}
                        </h3>
                        <button
                          onClick={() =>
                            handleNavigate("/products", {
                              list: [52, 53, 54],
                              brand: "iPhone",
                            })
                          }
                          className={dropdownItemClass}
                        >
                          {t("categories.iphone")}
                        </button>
                        <button
                          onClick={() =>
                            handleNavigate("/products", {
                              list: [52, 53, 54],
                              brand: "Samsung",
                            })
                          }
                          className={dropdownItemClass}
                        >
                          {t("categories.samsung")}
                        </button>
                        <button
                          onClick={() =>
                            handleNavigate("/products", {
                              list: [52, 53, 54],
                              brand: "Xiaomi",
                            })
                          }
                          className={dropdownItemClass}
                        >
                          {t("categories.xiaomi")}
                        </button>
                        <button
                          onClick={() =>
                            handleNavigate("/products", { list: [44] })
                          }
                          className={dropdownItemClass}
                        >
                          {t("categories.ipad")}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>

              {/* Deals */}
              <li>
                <Link
                  to="/deals"
                  className={`relative px-3 py-2 rounded-lg transition-colors ${
                    isActive("/deals")
                      ? "text-gray-900 bg-gray-100"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {t("nav.deals")}
                  <span className="absolute -top-1 -right-3 bg-red-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-full leading-none">
                    {t("nav.hotBadge")}
                  </span>
                </Link>
              </li>

              {/* Blog */}
              <li>
                <Link
                  to="/blog"
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    isActive("/blog")
                      ? "text-gray-900 bg-gray-100"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {t("nav.blog")}
                </Link>
              </li>

              {/* Support Dropdown */}
              <li className="relative group">
                <button className="flex items-center gap-1 px-3 py-2 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                  <span>{t("nav.support")}</span>
                  <IconChevronDown className="w-3 h-3 transition-transform duration-200 group-hover:rotate-180" />
                </button>

                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 w-[220px] z-20 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <div className="bg-white border border-gray-200 rounded-xl shadow-md shadow-gray-200/40 py-2">
                    <Link
                      to="/track-order"
                      className="block px-4 py-2 text-sm text-gray-600 hover:text-violet-700 hover:bg-violet-50 transition-colors"
                    >
                      {t("support.trackOrder")}
                    </Link>
                    <Link
                      to="/faq"
                      className="block px-4 py-2 text-sm text-gray-600 hover:text-violet-700 hover:bg-violet-50 transition-colors"
                    >
                      {t("support.faq")}
                    </Link>
                    <Link
                      to="/contact"
                      className="block px-4 py-2 text-sm text-gray-600 hover:text-violet-700 hover:bg-violet-50 transition-colors"
                    >
                      {t("support.contactUs")}
                    </Link>
                    <Link
                      to="/warranty"
                      className="block px-4 py-2 text-sm text-gray-600 hover:text-violet-700 hover:bg-violet-50 transition-colors"
                    >
                      {t("support.warranty")}
                    </Link>
                    <Link
                      to="/returns"
                      className="block px-4 py-2 text-sm text-gray-600 hover:text-violet-700 hover:bg-violet-50 transition-colors"
                    >
                      {t("support.returns")}
                    </Link>
                    {isCustomerService && (
                      <>
                        <div className="my-1 border-t border-gray-100"></div>
                        <Link
                          to="/customer-service"
                          className="block px-4 py-2 text-sm text-gray-600 hover:text-violet-700 hover:bg-violet-50 transition-colors"
                        >
                          {t("support.customerService")}
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </li>
            </ul>
          </nav>

          {/* Right: Icons */}
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
                onClick={handleClickCart}
              >
                <IconCart className="w-[18px] h-[18px]" />
                {cartQuantity > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {cartQuantity}
                  </span>
                )}
              </button>
              <CartDropdown
                isOpen={showCartDropdown}
                onClose={() => setShowCartDropdown(false)}
              />
            </div>

            {/* User Account */}
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
                      {user
                        ? t("header.manageAccount")
                        : t("header.pleaseLogin")}
                    </p>
                  </div>

                  <div className="py-1">
                    {user ? (
                      <>
                        {isCustomer && (
                          <Link
                            to="/userProfile"
                            onClick={handleMenuItemClick}
                            className="block px-4 py-2 text-sm text-gray-700 hover:text-violet-700 hover:bg-violet-50 transition-colors"
                          >
                            {t("account.myAccount")}
                          </Link>
                        )}
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={handleMenuItemClick}
                            className="block px-4 py-2 text-sm text-gray-700 hover:text-violet-700 hover:bg-violet-50 transition-colors"
                          >
                            {t("account.manage")}
                          </Link>
                        )}
                        {isCustomerService && (
                          <Link
                            to="/customer-service"
                            onClick={handleMenuItemClick}
                            className="block px-4 py-2 text-sm text-gray-700 hover:text-violet-700 hover:bg-violet-50 transition-colors"
                          >
                            {t("account.staff")}
                          </Link>
                        )}
                        <Link
                          to="/favorites"
                          onClick={handleMenuItemClick}
                          className="block px-4 py-2 text-sm text-gray-700 hover:text-violet-700 hover:bg-violet-50 transition-colors"
                        >
                          Yêu thích
                        </Link>
                        <div className="my-1 border-t border-gray-100"></div>
                        <button
                          onClick={handleLogoutConfirm}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          {t("account.signOut")}
                        </button>
                      </>
                    ) : (
                      <Link
                        to="/login"
                        onClick={() => {
                          handleMenuItemClick();
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
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
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
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

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <>
          <button
            type="button"
            className="lg:hidden fixed inset-0 bg-black/20"
            onClick={closeMobileMenu}
            aria-label="Đóng menu"
          />
          <div className="lg:hidden absolute top-full left-0 right-0 border-t border-gray-200 bg-white shadow-lg z-10">
            <div className="max-h-[calc(100vh-7rem)] overflow-y-auto px-4 py-3 space-y-1">
              {/* Home */}
              <Link
                to={path.home}
                onClick={closeMobileMenu}
                className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive(path.home)
                    ? "text-violet-700 bg-violet-50"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {t("nav.home")}
              </Link>

              {/* Products Accordion */}
              <div className="rounded-lg border border-gray-100 overflow-hidden">
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setShowMobileProducts(prev => !prev)}
                >
                  <span>{t("nav.products")}</span>
                  <IconChevronDown
                    className={`w-3 h-3 transition-transform duration-200 ${
                      showMobileProducts ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {showMobileProducts && (
                  <div className="border-t border-gray-100 bg-gray-50/50 px-3 py-3 space-y-3">
                    {/* Laptops */}
                    <div>
                      <h3 className="px-2 text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                        {t("categories.laptops")}
                      </h3>
                      <button
                        onClick={() =>
                          handleMobileNavigate("/products", {
                            list: [45, 46, 47, 48, 49, 50, 51],
                          })
                        }
                        className={mobileItemClass}
                      >
                        {t("categories.allLaptops")}
                      </button>
                    </div>

                    {/* Gaming Gear */}
                    <div>
                      <h3 className="px-2 text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                        {t("categories.gamingGear")}
                      </h3>
                      <div className="space-y-0.5">
                        {[
                          {
                            list: [6, 7, 8, 9, 10],
                            label: t("categories.mouse"),
                          },
                          {
                            list: [1, 2, 3, 4, 5],
                            label: t("categories.keyboard"),
                          },
                          {
                            list: [14, 15, 16],
                            label: t("categories.gameGear"),
                          },
                          {
                            list: [11, 12, 13],
                            label: t("categories.mousePad"),
                          },
                          {
                            list: [42, 43],
                            label: t("categories.headphone"),
                          },
                        ].map((item, idx) => (
                          <button
                            key={idx}
                            onClick={() =>
                              handleMobileNavigate("/products", {
                                list: item.list,
                              })
                            }
                            className={mobileItemClass}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* PC Parts */}
                    <div>
                      <h3 className="px-2 text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                        {t("categories.pcParts")}
                      </h3>
                      <div className="space-y-0.5">
                        {[
                          {
                            list: [36, 37, 38, 39],
                            label: t("categories.monitor"),
                          },
                          { list: [17], label: t("categories.case") },
                          { list: [18, 19], label: t("categories.cpu") },
                          {
                            list: [20, 21, 22],
                            label: t("categories.mainboard"),
                          },
                          {
                            list: [23, 24, 25, 26],
                            label: t("categories.psu"),
                          },
                          {
                            list: [27, 28, 29],
                            label: t("categories.storage"),
                          },
                          { list: [30, 31, 32], label: t("categories.ram") },
                        ].map((item, idx) => (
                          <button
                            key={idx}
                            onClick={() =>
                              handleMobileNavigate("/products", {
                                list: item.list,
                              })
                            }
                            className={mobileItemClass}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Smart Devices */}
                    <div>
                      <h3 className="px-2 text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                        {t("categories.smartDevice")}
                      </h3>
                      <div className="space-y-0.5">
                        {[
                          {
                            list: [52, 53, 54],
                            brand: "iPhone",
                            label: t("categories.iphone"),
                          },
                          {
                            list: [52, 53, 54],
                            brand: "Samsung",
                            label: t("categories.samsung"),
                          },
                          {
                            list: [52, 53, 54],
                            brand: "Xiaomi",
                            label: t("categories.xiaomi"),
                          },
                          { list: [44], label: t("categories.ipad") },
                        ].map((item, idx) => (
                          <button
                            key={idx}
                            onClick={() =>
                              handleMobileNavigate("/products", {
                                list: item.list,
                                ...(item.brand && { brand: item.brand }),
                              })
                            }
                            className={mobileItemClass}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Deals */}
              <Link
                to="/deals"
                onClick={closeMobileMenu}
                className={`flex items-center justify-between rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive("/deals")
                    ? "text-violet-700 bg-violet-50"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span>{t("nav.deals")}</span>
                <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  {t("nav.hotBadge")}
                </span>
              </Link>

              {/* Blog */}
              <Link
                to="/blog"
                onClick={closeMobileMenu}
                className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive("/blog")
                    ? "text-violet-700 bg-violet-50"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {t("nav.blog")}
              </Link>

              {/* Support Accordion */}
              <div className="rounded-lg border border-gray-100 overflow-hidden">
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setShowMobileSupport(prev => !prev)}
                >
                  <span>{t("nav.support")}</span>
                  <IconChevronDown
                    className={`w-3 h-3 transition-transform duration-200 ${
                      showMobileSupport ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {showMobileSupport && (
                  <div className="border-t border-gray-100 bg-gray-50/50 p-2 space-y-0.5">
                    {[
                      { to: "/track-order", label: t("support.trackOrder") },
                      { to: "/faq", label: t("support.faq") },
                      { to: "/contact", label: t("support.contactUs") },
                      { to: "/warranty", label: t("support.warranty") },
                      { to: "/returns", label: t("support.returns") },
                    ].map(item => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={closeMobileMenu}
                        className="block rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-white hover:text-violet-700 transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                    {isCustomerService && (
                      <Link
                        to="/customer-service"
                        onClick={closeMobileMenu}
                        className="block rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-white hover:text-violet-700 transition-colors"
                      >
                        {t("support.customerService")}
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* Account Section */}
              <div className="rounded-lg border border-gray-100 p-3 mt-2">
                <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {user ? t("account.myAccount") : t("account.loginRegister")}
                </p>
                <div className="space-y-0.5">
                  {user ? (
                    <>
                      {isCustomer && (
                        <Link
                          to="/userProfile"
                          onClick={closeMobileMenu}
                          className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                        >
                          {t("account.myAccount")}
                        </Link>
                      )}
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={closeMobileMenu}
                          className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                        >
                          {t("account.manage")}
                        </Link>
                      )}
                      {isCustomerService && (
                        <Link
                          to="/customer-service"
                          onClick={closeMobileMenu}
                          className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                        >
                          {t("account.staff")}
                        </Link>
                      )}
                      <Link
                        to="/favorites"
                        onClick={closeMobileMenu}
                        className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                      >
                        Yêu thích
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          closeMobileMenu();
                          handleLogoutConfirm();
                        }}
                        className="block w-full text-left rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        {t("account.signOut")}
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/login"
                      onClick={() => {
                        closeMobileMenu();
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                    >
                      {t("account.loginRegister")}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;
