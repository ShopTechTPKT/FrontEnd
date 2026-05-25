import { lazy, Suspense, useEffect, useState } from "react";
import { getHomeProducts } from "../../apis/productApi";
import { useTranslation } from "react-i18next";
import { StatusNotice, ProductGridSkeleton } from "../ui";
import HeroBanner from "../HeroBanner";
import FlashSaleStrip from "../FlashSaleStrip";

import logo1 from "../../assets/images/logo/logo_roccat.svg";
import logo2 from "../../assets/images/logo/logo_msi.svg";
import logo3 from "../../assets/images/logo/logo_razer.svg";
import logo4 from "../../assets/images/logo/logo_thermaltake.svg";
import logo5 from "../../assets/images/logo/logo_adata.svg";
import logo6 from "../../assets/images/logo/logo_hp.svg";
import logo7 from "../../assets/images/logo/logo_gigabytes.svg";

const CategoryGrid = lazy(() => import("../home/CategoryGrid"));
const FeaturedProducts = lazy(() => import("../home/FeaturedProducts"));
const PCBuilderPromo = lazy(() => import("../home/PCBuilderPromo"));
const BrandMarquee = lazy(() => import("../home/BrandMarquee"));
const SmartRecommendation = lazy(() => import("../home/SmartRecommendation"));
const QuickActions = lazy(() => import("../home/QuickActions"));

const BRAND_LOGOS = [logo1, logo2, logo3, logo4, logo5, logo6, logo7];

const HOME_PRODUCT_LIMIT = 24;

function SectionFallback() {
  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6">
      <ProductGridSkeleton count={4} />
    </div>
  );
}

function Content() {
  const { t } = useTranslation();

  const [homeProducts, setHomeProducts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setLoadError("");
        const data = await getHomeProducts();

        const normalize = (list) =>
          (list || []).map((item) => ({
            item,
            stock: item.stock ?? item.quantity ?? item.inventory ?? 0,
            categoryName: item.categoryName || item.category?.name || item.category,
            brandName: item.brandName || item.brand?.name || item.brand || "",
            seriesName: item.seriesName || item.series?.name || item.series || "",
            categoryId: item.categoryId,
            imageUrl: item.imageUrl || item.image_url || item.thumbnail || "",
            productID: item.productID || item.id,
            productName: item.productName || item.name,
            image: item.image || item.imageUrl || item.image_url || item.thumbnail || "",
            price: item.price ?? item.unitPrice ?? item.unit_price ?? 0,
            inStock: (item.stock ?? item.quantity ?? item.inventory ?? 0) > 0,
            createdAt: item.createdAt,
            rating: item.rating ?? item.averageRating,
            isHot: item.isHot,
            isNew: item.isNew,
          }));

        setHomeProducts({
          newProducts: normalize(data.newProducts).slice(0, HOME_PRODUCT_LIMIT),
          laptops: normalize(data.laptops).slice(0, HOME_PRODUCT_LIMIT),
          desktops: normalize(data.desktops).slice(0, HOME_PRODUCT_LIMIT),
          accessories: normalize(data.accessories).slice(0, HOME_PRODUCT_LIMIT),
        });
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoadError(t("common.load_error"));
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [t]);

  if (loading) {
    return (
      <div className="min-h-screen pt-4">
        <div className="mx-auto max-w-screen-xl px-4 py-6 sm:px-6">
          <ProductGridSkeleton count={8} />
        </div>
      </div>
    );
  }

  const products = homeProducts
    ? [
        ...homeProducts.newProducts,
        ...homeProducts.laptops,
        ...homeProducts.desktops,
        ...homeProducts.accessories,
      ]
    : [];

  return (
    <div className="space-y-0 mesh-gradient-home">
      <HeroBanner products={products} />

      <Suspense fallback={<SectionFallback />}>
        <QuickActions />
      </Suspense>

      <FlashSaleStrip />

      {loadError && (
        <div className="mx-auto mt-4 max-w-screen-xl px-4">
          <StatusNotice tone="warning" message={loadError} />
        </div>
      )}

      <Suspense fallback={<SectionFallback />}>
        <CategoryGrid />
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <FeaturedProducts products={products} />
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <SmartRecommendation products={products} />
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <PCBuilderPromo />
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <BrandMarquee logos={BRAND_LOGOS} />
      </Suspense>
    </div>
  );
}

export default Content;
