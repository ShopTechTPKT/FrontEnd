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
import HeroSearchSection from "../HeroSearchSection";

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
  { icon: "💻", labelKey: "categories.laptops", list: CATEGORY_IDS.laptop },
  { icon: "🖥️", labelKey: "categories.pcParts", list: CATEGORY_IDS.pc },
  { icon: "🖱️", labelKey: "categories.gamingGear", list: [...CATEGORY_IDS.mouse, ...CATEGORY_IDS.keyboard, ...CATEGORY_IDS.gamingGear] },
  { icon: "📱", labelKey: "categories.smartDevice", list: CATEGORY_IDS.phone },
  { icon: "🖲️", labelKey: "categories.monitor", list: CATEGORY_IDS.monitor },
  { icon: "🎧", labelKey: "categories.headphone", list: CATEGORY_IDS.headphone },
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
        setLoadError("Không load được data từ server. Vui lòng thử lại sau.");
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
      {/* ════ 1. Hero Search ════ */}
      <HeroSearchSection product={products} />

      {/* Error notice */}
      {loadError && (
        <div className="max-w-screen-xl mx-auto px-4 mt-4">
          <StatusNotice tone="warning" message={loadError} />
        </div>
      )}

      {/* ════ 2. Category Quick Links ════ */}
      <section className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {QUICK_CATEGORIES.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => handleCategoryClick(cat.list)}
              className="group flex flex-col items-center gap-2 py-4 px-2 rounded-xl border border-gray-100 bg-white hover:border-violet-200 hover:bg-violet-50/50 transition-all duration-200"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
                {cat.icon}
              </span>
              <span className="text-xs font-medium text-gray-700 group-hover:text-violet-700 text-center leading-tight">
                {t(cat.labelKey)}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ════ 3. Banner Slideshow ════ */}
      <Slideshow />

      {/* ════ 4. Minigame CTA ════ */}
      <section className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col items-center">
          {(() => {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            const hasPlays =
              user?.numberOfPlaysAllowed > 0 &&
              user?.numberOfGamesPlayed < user?.numberOfPlaysAllowed;

            return hasPlays ? (
              <a
                href="/minigame"
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-violet-700 rounded-lg hover:bg-violet-800 transition-colors"
              >
                🎮 {t("minigame.playButton")}
              </a>
            ) : (
              <div className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed">
                ❌ {t("minigame.noPlaysLeft")}
              </div>
            );
          })()}
          <p className="text-gray-500 text-xs mt-2">{t("minigame.description")}</p>
        </div>
      </section>

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
          className="w-full rounded-xl object-cover"
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

      {/* ════ 11. Brand Logos ════ */}
      <section className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-center gap-8 flex-wrap">
          {BRAND_LOGOS.map((logo, idx) => (
            <img
              key={idx}
              src={logo}
              alt={`Brand ${idx + 1}`}
              className="h-10 object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
              loading="lazy"
            />
          ))}
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
      <section className="py-12 bg-gray-50">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SUPPORT_ITEMS.map((item, index) => (
              <SupportCard key={index} icon={item.icon} titleKey={item.titleKey} descKey={item.descKey} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Sub-components — kept in same file for simplicity
   ══════════════════════════════════════════════════════════════ */

/** Section header with optional "See all" link */
function SectionHeader({ title, linkTo, linkState, t }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {linkTo && (
        <Link
          to={linkTo}
          state={linkState}
          className="text-sm text-violet-700 hover:text-violet-800 font-medium transition-colors"
        >
          {t?.("common.view_all") || "Xem tất cả"} →
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
    <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow duration-200">
      <div className="mb-4 p-3 bg-violet-50 rounded-full text-violet-700">{icon}</div>
      <h3 className="text-base font-semibold text-gray-900 mb-1.5">{t(titleKey)}</h3>
      <p className="text-sm text-gray-500">{t(descKey)}</p>
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
