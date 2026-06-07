import { Link, useLocation, Outlet } from "react-router-dom";
import path from "../../constant/path";
import { useTranslation } from "react-i18next";
import { Breadcrumb } from "../../components/ui";

/**
 * ProfileLayout — User dashboard layout with sidebar navigation.
 * Uses violet accent color + shared Breadcrumb component.
 */

const NAV_ITEMS = [
  { to: path.profile, labelKey: "account.myAccount", exact: true },
  { to: `${path.profile}/info`, labelKey: "account.account_information" },
  { to: `${path.profile}/my-orders`, labelKey: "account.my_orders" },
  { to: `${path.profile}/my-favourite`, labelKey: "account.favourite_products" },
  { to: `${path.profile}/my-discounts`, labelKey: "account.my_discounts" },
  { to: `${path.profile}/order-tracking`, labelKey: "account.order_tracking" },
];

function ProfileLayout() {
  const { t } = useTranslation();
  const location = useLocation();

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.to;
    return location.pathname.startsWith(item.to);
  };

  return (
    <div className="bg-gray-50/30 min-h-screen font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-white to-indigo-50/30 border-b border-gray-200">
        <div className="max-w-screen-xl mx-auto py-6 px-4 sm:px-6">
          <Breadcrumb
            items={[
              { label: t("product.home"), to: path.home },
              { label: t("account.myAccount") },
            ]}
          />
          <h1 className="mt-3 text-2xl font-semibold text-gray-900 tracking-tight">
            {t("account.myAccount")}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-screen-xl mx-auto py-8 px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <nav className="bg-white rounded-2xl shadow-xs overflow-hidden">
              {NAV_ITEMS.map((item, idx) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center px-4 py-3 text-sm font-medium transition-colors border-l-[3px] ${
                    isActive(item)
                      ? "border-indigo-700 bg-indigo-50 text-indigo-700"
                      : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  } ${idx > 0 ? "border-t border-t-gray-50" : ""}`}
                >
                  {t(item.labelKey)}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default ProfileLayout;
