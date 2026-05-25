import React, { useMemo, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useTranslation } from "react-i18next";
import ProductCard from "../product/ProductCard";
import { CATEGORY_IDS } from "../header/navData";

function toCardProduct(p) {
  if (!p?.item && !p?.productID) return null;
  const src = p.item || p;
  return {
    ...src,
    productID: p.productID ?? src.productID ?? src.id,
    productName: p.productName ?? src.productName ?? src.name,
    image: p.image ?? src.image ?? src.imageUrl,
    price: p.price ?? src.price ?? src.unitPrice,
    inStock: p.inStock ?? (src.stock ?? 0) > 0,
    stock: p.stock ?? src.stock,
    isNew: true,
    createdAt: src.createdAt,
  };
}

const FILTERS = [
  { key: "all", labelKey: "home.newAll", ids: null },
  { key: "laptop", labelKey: "categories.laptops", ids: CATEGORY_IDS.laptop },
  { key: "desktop", labelKey: "content.desktops", ids: [...CATEGORY_IDS.pc, ...CATEGORY_IDS.mainboard] },
  { key: "parts", labelKey: "categories.pcParts", ids: CATEGORY_IDS.pc },
];

export default function NewArrivalsSection({ products = [] }) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState(0);
  const f = FILTERS[filter];

  const list = useMemo(() => {
    const normalized = products.map(toCardProduct).filter(Boolean);
    const sorted = [...normalized].sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );
    if (!f.ids) return sorted.slice(0, 12);
    return sorted.filter((p) => f.ids.includes(p.categoryId)).slice(0, 12);
  }, [products, f]);

  const settings = {
    dots: false,
    infinite: list.length > 3,
    speed: 500,
    slidesToShow: Math.min(4, Math.max(1, list.length)),
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4500,
    arrows: true,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: Math.min(3, list.length) } },
      { breakpoint: 768, settings: { slidesToShow: Math.min(2, list.length) } },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ],
  };

  if (!list.length) return null;

  return (
    <section className="mx-auto max-w-screen-xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
            New
          </span>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            {t("home.newArrivals", { defaultValue: "Hàng mới về" })}
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((fl, i) => (
            <button
              key={fl.key}
              type="button"
              onClick={() => setFilter(i)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                filter === i
                  ? "bg-violet-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
              }`}
            >
              {t(fl.labelKey)}
            </button>
          ))}
        </div>
      </div>
      <div className="home-new-arrivals-slider -mx-1">
        <Slider {...settings}>
          {list.map((p) => (
            <div key={p.productID} className="px-2 pb-2">
              <ProductCard product={p} />
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
}
