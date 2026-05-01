import Slideshow from "../Slideshow";
import ProductSlider from "../product/ProductSlider";
import CategoriesProduct from "../product/CategoriesProduct";
import customer_builds from "../../assets/images/custom_buid.webp";
import msi_series from "../../assets/images/msi_series.jpg";
import desktops from "../../assets/images/desktop.jpg";
import monitors from "../../assets/images/msi_monitor.jpg";
import slide from "../../assets/images/slide.png";
import CardNews from "../info/CardNews";
import TestimonialSlider from "../info/TestimonialSlider";
import HeroBanner from "../HeroBanner";
import FlashSaleStrip from "../FlashSaleStrip";
import TrustBadges from "../TrustBadges";
import { Laptop, Monitor, Mouse, Smartphone, Tv2, Headphones } from "lucide-react";
import RecentlyViewed from "../product/RecentlyViewed";

// Brand logos
import logo1 from "../../assets/images/logo/logo_roccat.svg";
import logo2 from "../../assets/images/logo/logo_msi.svg";
import logo3 from "../../assets/images/logo/logo_razer.svg";
import logo4 from "../../assets/images/logo/logo_thermaltake.svg";
import logo5 from "../../assets/images/logo/logo_adata.svg";
import logo6 from "../../assets/images/logo/logo_hp.svg";
import logo7 from "../../assets/images/logo/logo_gigabytes.svg";

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getHomeProducts } from "../../apis/productApi";
import { useTranslation } from "react-i18next";
import { StatusNotice, ProductGridSkeleton } from "../ui";
import { CATEGORY_IDS } from "../header/navData";

/* ── Derived category groups ── */
const ID_DESKTOP = [
  ...CATEGORY_IDS.mainboard,
  ...CATEGORY_IDS.ram,
  ...CATEGORY_IDS.mouse,
  ...CATEGORY_IDS.storage,
];

const HOME_PRODUCT_LIMIT = 15;

/* ── Quick category icons (SVG inline) ── */
const QUICK_CATEGORIES = [
  { icon: Laptop,     labelKey: "categories.laptops",     list: CATEGORY_IDS.laptop,  gradient: "from-violet-500 to-purple-600",  ring: "ring-violet-200" },
  { icon: Monitor,    labelKey: "categories.pcParts",      list: CATEGORY_IDS.pc,       gradient: "from-blue-500 to-cyan-600",     ring: "ring-blue-200" },
  { icon: Mouse,      labelKey: "categories.gamingGear",   list: [...CATEGORY_IDS.mouse, ...CATEGORY_IDS.keyboard, ...CATEGORY_IDS.gamingGear], gradient: "from-emerald-500 to-teal-600", ring: "ring-emerald-200" },
  { icon: Smartphone, labelKey: "categories.smartDevice",  list: CATEGORY_IDS.phone,    gradient: "from-orange-500 to-amber-500",  ring: "ring-orange-200" },
  { icon: Tv2,        labelKey: "categories.monitor",      list: CATEGORY_IDS.monitor,  gradient: "from-pink-500 to-rose-600",    ring: "ring-pink-200" },
  { icon: Headphones, labelKey: "categories.headphone",    list: CATEGORY_IDS.headphone,gradient: "from-indigo-500 to-violet-600",ring: "ring-indigo-200" },
];

const BRAND_LOGOS = [logo1, logo2, logo3, logo4, logo5, logo6, logo7];

/* ══════════════════════════════════════════════════════════════
   Content — Homepage main content
   ══════════════════════════════════════════════════════════════ */
function Content() {
  const { t } = useTranslation();
  const navigate = useNavigate();

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
            brandName: item.name || item.brand?.name || item.brand || "",
            seriesName: item.seriesName || item.series?.name || item.series || "",
            imageUrl: item.imageUrl || item.image_url || item.thumbnail || "",
            productID: item.productID || item.id,
            productName: item.productName || item.name,
            image: item.image || item.imageUrl || item.image_url || item.thumbnail || "",
            price: item.price ?? item.unitPrice ?? item.unit_price ?? 0,
            inStock: (item.stock ?? item.quantity ?? item.inventory ?? 0) > 0,
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
  }, []);

  /* ── Loading State ── */
  if (loading) {
    return (
      <div className="pt-4 min-h-screen">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
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

  const filterByCategory = (ids, fallback = products) => {
    const list = products.filter((p) => ids.includes(p.item.categoryId));
    return list.length ? list : fallback.slice(0, 20);
  };

  const handleCategoryClick = (list) => {
    navigate("/products", { state: { list } });
  };

  /* ── Render ── */
  return (
    <div className="space-y-0">
      {/* ════ 1. Hero Banner Slider ════ */}
      <HeroBanner products={products} />

      {/* ════ 2. Flash Sale Strip ════ */}
      <FlashSaleStrip />

      {/* ════ 3. Trust Badges ════ */}
      <TrustBadges />

      {/* Error notice */}
      {loadError && (
        <div className="max-w-screen-xl mx-auto px-4 mt-4">
          <StatusNotice tone="warning" message={loadError} />
        </div>
      )}

      {/* ════ 2. Category Quick Links ════ */}
      <section className="max-w-screen-xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">{t("common.shop_by_category") || "Danh mục nổi bật"}</h2>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {QUICK_CATEGORIES.map((cat, idx) => {
            const IconComp = cat.icon;
            return (
              <button
                key={idx}
                onClick={() => handleCategoryClick(cat.list)}
                className={`group flex flex-col items-center gap-3 py-5 px-2 rounded-2xl bg-white border border-gray-100 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 ring-0 hover:${cat.ring}`}
              >
                <span className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                  <IconComp className="w-5 h-5 text-white" strokeWidth={1.8} />
                </span>
                <span className="text-xs font-semibold text-gray-700 group-hover:text-gray-900 text-center leading-tight">
                  {t(cat.labelKey)}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ════ 3. Banner Slideshow ════ */}
      <Slideshow />

      {/* ════ 4. Minigame CTA ════ */}
      {(() => {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const hasPlays = user?.numberOfPlaysAllowed > 0 && user?.numberOfGamesPlayed < user?.numberOfPlaysAllowed;
        if (!hasPlays) return null;
        return (
          <section className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4">
            <a
              href="/minigame"
              className="group relative flex items-center gap-5 p-5 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-violet-700 shadow-lg hover:shadow-violet-300/40 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
            >
              {/* Decorative glow */}
              <div className="absolute right-0 top-0 w-48 h-full bg-white/5 blur-2xl pointer-events-none" />
              <div className="w-14 h-14 rounded-xl bg-white/15 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200">
                {/* Gamepad SVG */}
                <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-white" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="6" width="20" height="12" rx="4"/>
                  <path d="M6 12h4M8 10v4"/>
                  <circle cx="16" cy="11" r="1" fill="currentColor" stroke="none"/>
                  <circle cx="18" cy="13" r="1" fill="currentColor" stroke="none"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-base">{t("minigame.playButton")}</p>
                <p className="text-violet-200 text-sm mt-0.5">{t("minigame.description")}</p>
              </div>
              <div className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-white/15 rounded-xl text-white text-sm font-semibold backdrop-blur-sm group-hover:bg-white/25 transition-colors">
                <span>Choi ngay</span>
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </div>
            </a>
          </section>
        );
      })()}

      {/* ════ 5. Sản phẩm nổi bật (Laptops) ════ */}
      <ProductSection
        title={t("common.new_products")}
        products={filterByCategory(CATEGORY_IDS.laptop)}
        linkTo="/products"
        linkState={{ list: CATEGORY_IDS.laptop }}
        t={t}
      />

      {/* ════ 6. Promo Banner ════ */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4">
        <img
          src={slide}
          alt="Promotion banner"
          className="w-full rounded-2xl object-cover shadow-xs hover:shadow-md transition-shadow duration-300"
          loading="lazy"
        />
      </div>

      {/* ════ 7. PC & Custom Builds ════ */}
      <section className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-5">
          <div className="hidden md:block w-[200px] shrink-0">
            <CategoriesProduct image={customer_builds} listID={CATEGORY_IDS.pc} />
          </div>
          <div className="flex-1 overflow-hidden">
            <ProductSlider
              products={filterByCategory(CATEGORY_IDS.pc)}
              autoPlay
              interval={4000}
              visibleCount={4}
            />
          </div>
        </div>
      </section>

      {/* ════ 8. Laptops ════ */}
      <section className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-5">
          <div className="hidden md:block w-[200px] shrink-0">
            <CategoriesProduct
              image={msi_series}
              text={t("content.laptops")}
              listID={CATEGORY_IDS.laptop}
            />
          </div>
          <div className="flex-1 overflow-hidden">
            <ProductSlider
              products={filterByCategory(CATEGORY_IDS.laptop)}
              autoPlay
              interval={4000}
              visibleCount={4}
            />
          </div>
        </div>
      </section>

      {/* ════ 9. Desktops & Components ════ */}
      <section className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-5">
          <div className="hidden md:block w-[200px] shrink-0">
            <CategoriesProduct
              image={desktops}
              text={t("content.desktops")}
              listID={ID_DESKTOP}
            />
          </div>
          <div className="flex-1 overflow-hidden">
            <ProductSlider
              products={filterByCategory(ID_DESKTOP)}
              autoPlay
              interval={4000}
              visibleCount={4}
            />
          </div>
        </div>
      </section>

      {/* ════ 10. Monitors ════ */}
      <section className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-5">
          <div className="hidden md:block w-[200px] shrink-0">
            <CategoriesProduct
              image={monitors}
              text={t("content.gaming_monitors")}
              listID={CATEGORY_IDS.monitor}
            />
          </div>
          <div className="flex-1 overflow-hidden">
            <ProductSlider
              products={filterByCategory(CATEGORY_IDS.monitor)}
              autoPlay
              interval={4000}
              visibleCount={4}
            />
          </div>
        </div>
      </section>

      {/* ════ 11. Brand Logos — Infinite Marquee ════ */}
      <section className="max-w-screen-xl mx-auto px-4 sm:px-6 py-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 text-center mb-6">{t("content.trusted_brands") || "Thương hiệu đối tác"}</p>
        <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-xs py-7">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
          <div
            className="flex gap-12 w-max"
            style={{ animation: "marqueeScroll 22s linear infinite" }}
          >
            {[...BRAND_LOGOS, ...BRAND_LOGOS].map((logo, idx) => (
              <img
                key={idx}
                src={logo}
                alt={`Brand ${idx + 1}`}
                className="h-8 object-contain grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-pointer"
                loading="lazy"
              />
            ))}
          </div>
        </div>
      </section>

      {/* ════ 12. News ════ */}
      <section className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        <SectionHeader title={t("news.sectionTitle")} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {NEWS_ARTICLES.slice(0, 3).map((article, index) => (
            <a key={index} href={article.url} target="_blank" rel="noopener noreferrer">
              <CardNews
                title={t(article.titleKey)}
                excerpt={t(article.excerptKey)}
                date={article.date}
                imageUrl={article.imageUrl}
              />
            </a>
          ))}
        </div>
      </section>

      {/* ════ 13. Testimonials ════ */}
      <section className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        <TestimonialSlider autoPlay interval={3000} />
      </section>

      {/* ════ 14. Support Cards ════ */}
      <section className="py-12 bg-gradient-to-b from-violet-50/30 to-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SUPPORT_ITEMS.map((item, index) => (
              <SupportCard key={index} icon={item.icon} titleKey={item.titleKey} descKey={item.descKey} />
            ))}
          </div>
        </div>
      </section>

      {/* ════ 15. Recently Viewed ════ */}
      <RecentlyViewed />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Sub-components — kept in same file for simplicity
   ══════════════════════════════════════════════════════════════ */

/** Section header with optional "See all" link */
function SectionHeader({ title, linkTo, linkState, t }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        {/* Violet accent bar */}
        <span className="inline-block w-1 h-6 rounded-full bg-gradient-to-b from-violet-600 to-purple-500" />
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h2>
      </div>
      {linkTo && (
        <Link
          to={linkTo}
          state={linkState}
          className="text-sm text-violet-700 hover:text-violet-800 font-semibold transition-colors flex items-center gap-1 group"
        >
          {t?.("common.view_all") || "Xem tat ca"}
          <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}
    </div>
  );
}

/** Product section with title + slider */
function ProductSection({ title, products, linkTo, linkState, t }) {
  return (
    <section className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
      <SectionHeader title={title} linkTo={linkTo} linkState={linkState} t={t} />
      <div className="overflow-hidden">
        <ProductSlider products={products.slice(0, 20)} autoPlay interval={4000} visibleCount={5} />
      </div>
    </section>
  );
}

/** Support card */
function SupportCard({ icon, titleKey, descKey }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
      <div className="mb-4 w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-sm shadow-violet-200/50 group-hover:scale-110 transition-transform duration-200">
        {icon}
      </div>
      <h3 className="text-sm font-bold text-gray-900 mb-1.5">{t(titleKey)}</h3>
      <p className="text-xs text-gray-500 leading-relaxed">{t(descKey)}</p>
    </div>
  );
}

/* ── Static Data ── */

const SUPPORT_ITEMS = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    titleKey: "content.product_support",
    descKey: "content.product_support_desc",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    titleKey: "content.personal_account",
    descKey: "content.personal_account_desc",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    titleKey: "content.amazing_savings",
    descKey: "content.amazing_savings_desc",
  },
];

const NEWS_ARTICLES = [
  {
    titleKey: "news.cards.1.title",
    excerptKey: "news.cards.1.excerpt",
    date: "2025-04-20",
    imageUrl: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=250&fit=crop",
    url: "https://www.anandtech.com/show/21369/nvidia-geforce-rtx-5090",
  },
  {
    titleKey: "news.cards.2.title",
    excerptKey: "news.cards.2.excerpt",
    date: "2025-04-15",
    imageUrl: "https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=400&h=250&fit=crop",
    url: "https://www.tomshardware.com/reviews/amd-ryzen-9-9950x",
  },
  {
    titleKey: "news.cards.3.title",
    excerptKey: "news.cards.3.excerpt",
    date: "2025-04-10",
    imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=250&fit=crop",
    url: "https://www.techradar.com/news/ddr6-memory",
  },
];

export default Content;
