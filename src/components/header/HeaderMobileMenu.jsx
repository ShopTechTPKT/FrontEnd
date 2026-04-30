import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getMegaMenuSections, getSupportLinks } from "./navData";
import { IconChevronDown } from "./HeaderIcons";

/**
 * HeaderMobileMenu — Full-screen mobile nav overlay.
 * Handles accordion expand/collapse for Products and Support.
 */
function HeaderMobileMenu({
  isOpen,
  onClose,
  onNavigate,
  isActive,
  user,
  isCustomer,
  isAdmin,
  isCustomerService,
  onLogout,
}) {
  const { t } = useTranslation();
  const [showProducts, setShowProducts] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const touchStartX = useRef(null);
  const touchCurrentX = useRef(null);

  if (!isOpen) return null;

  const sections = getMegaMenuSections();
  const supportLinks = getSupportLinks();

  const handleNav = (targetPath, state) => {
    onClose();
    onNavigate(targetPath, state);
  };

  const mobileItemClass =
    "block w-full text-left rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-white hover:text-gray-900 transition-colors";

  const mobileLinkClass = (active) =>
    `block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
      active ? "text-violet-700 bg-violet-50" : "text-gray-700 hover:bg-gray-50"
    }`;

  const getSectionIcon = (titleKey) => {
    if (titleKey === "categories.laptops") return "💻";
    if (titleKey === "categories.gamingGear") return "🎮";
    if (titleKey === "categories.pcParts") return "🧩";
    if (titleKey === "categories.smartDevice") return "📱";
    return "•";
  };

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchCurrentX.current = e.touches[0].clientX;
  };

  const onTouchMove = (e) => {
    touchCurrentX.current = e.touches[0].clientX;
  };

  const onTouchEnd = () => {
    if (touchStartX.current == null || touchCurrentX.current == null) return;
    const deltaX = touchCurrentX.current - touchStartX.current;
    if (deltaX > 70) onClose(); // swipe right to close
    touchStartX.current = null;
    touchCurrentX.current = null;
  };

  return (
    <>
      {/* Backdrop */}
      <button
        type="button"
        className="lg:hidden fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
        aria-label={t("header.closeMenu") || "Đóng menu"}
      />

      {/* Menu panel */}
      <div
        className="lg:hidden absolute top-full left-0 right-0 border-t border-gray-200 bg-white shadow-lg z-50 animate-slideInRight"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="max-h-[calc(100vh-7rem)] overflow-y-auto px-4 py-3 space-y-1">
          {/* Home */}
          <Link to="/" onClick={onClose} className={mobileLinkClass(isActive("/"))}>
            {t("nav.home")}
          </Link>

          {/* Products Accordion */}
          <div className="rounded-lg border border-gray-100 overflow-hidden">
            <button
              type="button"
              className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setShowProducts((prev) => !prev)}
              aria-expanded={showProducts}
              aria-controls="mobile-products-panel"
            >
              <span>{t("nav.products")}</span>
              <IconChevronDown
                className={`w-3 h-3 transition-transform duration-200 ${showProducts ? "rotate-180" : ""}`}
              />
            </button>
            <div
              id="mobile-products-panel"
              className={`grid transition-all duration-300 ease-in-out ${
                showProducts ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="border-t border-gray-100 bg-gray-50/50 px-3 py-3 space-y-3">
                {sections.map((section) => (
                  <div key={section.titleKey}>
                    <h3 className="px-2 text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-1.5">
                      <span aria-hidden>{getSectionIcon(section.titleKey)}</span>
                      {t(section.titleKey)}
                    </h3>
                    <div className="space-y-0.5">
                      {section.items.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() =>
                            handleNav("/products", {
                              list: item.list,
                              ...(item.brand && { brand: item.brand }),
                            })
                          }
                          className={mobileItemClass}
                        >
                          {t(item.labelKey)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              </div>
            </div>
          </div>

          {/* Deals */}
          <Link
            to="/deals"
            onClick={onClose}
            className={`flex items-center justify-between ${mobileLinkClass(isActive("/deals"))}`}
          >
            <span>{t("nav.deals")}</span>
            <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              {t("nav.hotBadge")}
            </span>
          </Link>

          {/* Blog */}
          <Link to="/blog" onClick={onClose} className={mobileLinkClass(isActive("/blog"))}>
            {t("nav.blog")}
          </Link>

          {/* Support Accordion */}
          <div className="rounded-lg border border-gray-100 overflow-hidden">
            <button
              type="button"
              className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setShowSupport((prev) => !prev)}
              aria-expanded={showSupport}
              aria-controls="mobile-support-panel"
            >
              <span>{t("nav.support")}</span>
              <IconChevronDown
                className={`w-3 h-3 transition-transform duration-200 ${showSupport ? "rotate-180" : ""}`}
              />
            </button>
            <div
              id="mobile-support-panel"
              className={`grid transition-all duration-300 ease-in-out ${
                showSupport ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="border-t border-gray-100 bg-gray-50/50 p-2 space-y-0.5">
                {supportLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={onClose}
                    className="block rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-white hover:text-violet-700 transition-colors"
                  >
                    {t(link.labelKey)}
                  </Link>
                ))}
                {isCustomerService && (
                  <Link
                    to="/customer-service"
                    onClick={onClose}
                    className="block rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-white hover:text-violet-700 transition-colors"
                  >
                    {t("support.customerService")}
                  </Link>
                )}
              </div>
              </div>
            </div>
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
                    <Link to="/userProfile" onClick={onClose} className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors">
                      {t("account.myAccount")}
                    </Link>
                  )}
                  {isAdmin && (
                    <Link to="/admin" onClick={onClose} className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors">
                      {t("account.manage")}
                    </Link>
                  )}
                  {isCustomerService && (
                    <Link to="/customer-service" onClick={onClose} className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors">
                      {t("account.staff")}
                    </Link>
                  )}
                  <Link to="/favorites" onClick={onClose} className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors">
                    Yêu thích
                  </Link>
                  <button
                    type="button"
                    onClick={() => { onClose(); onLogout(); }}
                    className="block w-full text-left rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    {t("account.signOut")}
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => { onClose(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
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
  );
}

export default HeaderMobileMenu;
