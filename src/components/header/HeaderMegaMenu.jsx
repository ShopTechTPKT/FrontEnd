import React from "react";
import { useTranslation } from "react-i18next";
import { getMegaMenuSections } from "./navData";
import msiSeries from "../../assets/images/msi_series.jpg";
import msiMonitor from "../../assets/images/msi_monitor.jpg";
import customBuild from "../../assets/images/custom_buid.webp";

/**
 * HeaderMegaMenu — Desktop product mega menu (4-column grid).
 * Pure presentational component.
 */
function HeaderMegaMenu({ onNavigate }) {
  const { t } = useTranslation();
  const sections = getMegaMenuSections();
  const prefetchedRef = React.useRef(false);

  const itemClass =
    "block w-full rounded-lg px-2 py-1.5 text-left text-sm text-gray-600 transition-colors hover:bg-indigo-50 hover:text-indigo-600 dark:text-gray-300 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-300";

  const previewCards = [
    {
      key: "laptop",
      title: t("categories.laptops"),
      subtitle: t("categories.allLaptops"),
      image: msiSeries,
      list: sections[0]?.items?.[0]?.list || [],
    },
    {
      key: "monitor",
      title: t("categories.monitor"),
      subtitle: t("nav.hotBadge"),
      image: msiMonitor,
      list: sections[2]?.items?.[0]?.list || [],
    },
    {
      key: "builder",
      title: t("nav.pcBuilder"),
      subtitle: t("categories.customBuilds") || "Custom build",
      image: customBuild,
      to: "/pc-builder",
    },
  ];

  const handlePrefetch = () => {
    if (prefetchedRef.current) return;
    prefetchedRef.current = true;
    import("../../pages/All_Products/All_Products");
  };

  return (
    <div
      className="invisible absolute left-1/2 top-full z-[var(--z-popover)] w-[820px] max-w-[calc(100vw-2rem)] -translate-x-1/2 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100"
      onMouseEnter={handlePrefetch}
    >
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-md shadow-gray-200/40 dark:border-gray-700 dark:bg-gray-900">
        <div className="grid grid-cols-[2fr_1fr] gap-5">
          <div className="grid grid-cols-4 gap-5">
            {sections.map((section) => (
              <div key={section.titleKey}>
                <h3 className="mb-2.5 px-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  {t(section.titleKey)}
                </h3>
                {section.items.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() =>
                      onNavigate("/products", {
                        list: item.list,
                        ...(item.brand && { brand: item.brand }),
                      })
                    }
                    className={itemClass}
                  >
                    {t(item.labelKey)}
                  </button>
                ))}
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {previewCards.map((card) => (
              <button
                key={card.key}
                onClick={() => {
                  if (card.to) {
                    onNavigate(card.to);
                    return;
                  }
                  onNavigate("/products", { list: card.list });
                }}
                className="w-full overflow-hidden rounded-lg border border-gray-100 text-left transition-colors hover:border-indigo-200 hover:bg-indigo-50/40 dark:border-gray-700 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/30"
              >
                <img src={card.image} alt={card.title} className="h-20 w-full object-cover" loading="lazy" />
                <div className="p-2.5">
                  <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">{card.title}</p>
                  <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">{card.subtitle}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * HeaderSupportMenu — Desktop support dropdown.
 */
function HeaderSupportMenu({ links, isCustomerService }) {
  const { t } = useTranslation();

  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 w-[220px] z-20 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200">
      <div className="bg-white border border-gray-200 rounded-xl shadow-md shadow-gray-200/40 py-2">
        {links.map((link) => (
          <a
            key={link.to}
            href={link.to}
            className="block px-4 py-2 text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            {t(link.labelKey)}
          </a>
        ))}
        {isCustomerService && (
          <>
            <div className="my-1 border-t border-gray-100" />
            <a
              href="/customer-service"
              className="block px-4 py-2 text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              {t("support.customerService")}
            </a>
          </>
        )}
      </div>
    </div>
  );
}

export { HeaderMegaMenu, HeaderSupportMenu };
