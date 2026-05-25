import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Laptop, Monitor, Mouse, Smartphone, Tv2, Headphones } from "lucide-react";
import { fetchCategories } from "../../apis/categoryApi";
import { CATEGORY_IDS } from "../header/navData";

const FALLBACK = [
  { icon: Laptop, labelKey: "categories.laptops", list: CATEGORY_IDS.laptop, gradient: "from-violet-600 to-purple-600", count: null },
  { icon: Monitor, labelKey: "categories.pcParts", list: CATEGORY_IDS.pc, gradient: "from-violet-500 to-violet-700", count: null },
  { icon: Mouse, labelKey: "categories.gamingGear", list: [...CATEGORY_IDS.mouse, ...CATEGORY_IDS.keyboard], gradient: "from-purple-600 to-violet-700", count: null },
  { icon: Smartphone, labelKey: "categories.smartDevice", list: CATEGORY_IDS.phone, gradient: "from-violet-700 to-purple-700", count: null },
  { icon: Tv2, labelKey: "categories.monitor", list: CATEGORY_IDS.monitor, gradient: "from-violet-600 to-fuchsia-600", count: null },
  { icon: Headphones, labelKey: "categories.headphone", list: CATEGORY_IDS.headphone, gradient: "from-purple-700 to-violet-800", count: null },
];

function CategoryGrid() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [rows, setRows] = useState(FALLBACK);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const api = await fetchCategories();
      if (cancelled || !api?.length) return;
      const mapped = api
        .filter((c) => c && (c.name || c.categoryName))
        .slice(0, 8)
        .map((c, i) => ({
          icon: [Laptop, Monitor, Mouse, Smartphone, Tv2, Headphones][i % 6],
          label: c.name || c.categoryName,
          id: c.categoryId ?? c.id,
          productCount: c.productCount ?? c.count,
          gradient: "from-violet-600 to-purple-600",
        }));
      if (mapped.length >= 4) setRows(mapped);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="mx-auto max-w-screen-xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            {t("home.browseCategory", { defaultValue: "Danh mục nổi bật" })}
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t("home.browseCategorySub", { defaultValue: "Khám phá theo nhu cầu của bạn" })}
          </p>
        </div>
      </div>
      <div
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}
      >
        {rows.map((cat, idx) => {
          const Icon = cat.icon || Laptop;
          const label = cat.labelKey ? t(cat.labelKey) : cat.label;
          const onClick = () => {
            if (cat.list) navigate("/products", { state: { list: cat.list } });
            else if (cat.id) navigate("/products", { state: { list: [cat.id] } });
            else navigate("/products");
          };
          return (
            <button
              key={cat.labelKey || cat.label || idx}
              type="button"
              onClick={onClick}
              className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:hover:border-violet-700 motion-safe:animate-fadeInUp"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <div
                className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${cat.gradient || "from-violet-600 to-purple-600"} text-white shadow-md transition-transform duration-300 group-hover:scale-110`}
              >
                <Icon className="h-6 w-6" strokeWidth={1.75} />
              </div>
              <p className="line-clamp-2 text-sm font-semibold text-gray-900 dark:text-gray-100">{label}</p>
              {cat.productCount != null ? (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{cat.productCount}+ SP</p>
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default React.memo(CategoryGrid);
