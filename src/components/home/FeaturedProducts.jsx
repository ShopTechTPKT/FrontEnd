import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ProductCard from "../product/ProductCard";
import Tabs from "../ui/Tabs";
import { ProductGridSkeleton } from "../ui";

function toCardProduct(p) {
  if (!p?.item && !p?.productID) return null;
  const src = p.item || p;
  return {
    ...src,
    productID: p.productID ?? src.productID ?? src.id,
    productName: p.productName ?? src.productName ?? src.name,
    image: p.image ?? src.image ?? src.imageUrl,
    price: p.price ?? src.price ?? src.unitPrice,
    inStock: p.inStock ?? (src.quantity ?? src.stock ?? 0) > 0,
    stock: p.stock ?? src.stock ?? src.quantity,
    rating: src.rating ?? src.averageRating,
    isHot: src.isHot,
    isNew: src.isNew,
  };
}

function FeaturedProducts({ products = [], loading = false }) {
  const { t } = useTranslation();
  const [tab, setTab] = useState(0);

  const list = useMemo(() => products.map(toCardProduct).filter(Boolean), [products]);

  const buckets = useMemo(() => {
    const best = [...list].slice(0, 8);
    const rated = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 8);
    const editors = [...list].reverse().slice(0, 8);
    return [best, rated, editors];
  }, [list]);

  const items = [
    {
      key: "best",
      label: t("home.tabBestSellers", { defaultValue: "Bán chạy" }),
      panel: () => (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {buckets[0].map((p) => (
            <ProductCard key={p.productID} product={p} />
          ))}
        </div>
      ),
    },
    {
      key: "rated",
      label: t("home.tabTopRated", { defaultValue: "Đánh giá cao" }),
      panel: () => (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {buckets[1].map((p) => (
            <ProductCard key={p.productID} product={p} />
          ))}
        </div>
      ),
    },
    {
      key: "editors",
      label: t("home.tabEditors", { defaultValue: "Biên tập viên chọn" }),
      panel: () => (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {buckets[2].map((p) => (
            <ProductCard key={p.productID} product={p} />
          ))}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <section className="mx-auto max-w-screen-xl px-4 py-10 sm:px-6">
        <ProductGridSkeleton count={8} />
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-screen-xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            {t("home.featuredTitle", { defaultValue: "Sản phẩm nổi bật" })}
          </h2>
        </div>
        <Link to="/products" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
          {t("common.view_all", { defaultValue: "Xem tất cả" })} →
        </Link>
      </div>
      <Tabs items={items} value={tab} onChange={setTab} variant="enclosed" lazy={false} className="flex flex-col gap-6" />
    </section>
  );
}

export default React.memo(FeaturedProducts);
