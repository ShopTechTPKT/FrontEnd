import { useEffect, useState } from "react";


// import a1 from "../../assets/images/ProductDetail/a1.png";
// import a2 from "../../assets/images/ProductDetail/a2.png";
// import a3 from "../../assets/images/ProductDetail/a3.png";
// import a4 from "../../assets/images/ProductDetail/a4.png";
// import a5 from "../../assets/images/ProductDetail/a5.png";
// import a6 from "../../assets/images/ProductDetail/a6.png";
// import a7 from "../../assets/images/ProductDetail/a7.png";
import zip from "../../assets/images/ProductDetail/zip.png";

import axiosInstance from "../../custom/axios";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Loading from "../Loading";

export default function ProductDetail() {
  const { t } = useTranslation();

  const [expanded, setExpanded] = useState(false);
  const { id } = useParams();
  const [product, setProduct] = useState({});
  const [loading, setLoading] = useState(true);
  // Fetch product from API
  async function fetchProduct(productId) {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/products/${productId}`);
      const data = res?.data?.result || res?.data;
      setProduct(data || null);
    } catch (error) {
      console.error("Error fetching product:", error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProduct(id);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen py-20">
        <Loading fullScreen={false} size="lg" text="Đang tải thông tin sản phẩm..." className="py-20" />
      </div>
    );
  }

  return (
    <div className="bg-transparent">
      {/* Main Content Area - Cleaner Layout */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Section: Product Info */}
          <div>
            {/* Breadcrumb */}
            <div className="text-sm mb-4 text-gray-600">
              <span className="hover:text-indigo-600 transition cursor-pointer">
                Home / {product.categoryName} /{" "}
              </span>
              <span className="text-gray-400">{product.seriesName}</span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
              {product.productName}
            </h1>
            <p className="text-indigo-600 text-sm mb-6 hover:underline cursor-pointer">
              Be the first to review this product
            </p>

            {/* Attributes - pill chips */}
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2.5">Thong so noi bat</p>
              <div className="flex flex-wrap gap-2">
                {product.attributeList?.split("|").map((attr, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-xs font-medium text-indigo-800 leading-tight"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5 text-indigo-500 shrink-0">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    {attr.trim()}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-6 rounded-xl border border-indigo-200 bg-indigo-50 p-4">
              <p className="text-sm font-semibold text-indigo-900">
                Mua trên 10 sản phẩm? Nhận báo giá ưu đãi cho doanh nghiệp.
              </p>
              <p className="mt-1 text-xs text-indigo-700">
                Gửi yêu cầu nhanh, đội ngũ ShopPC sẽ phản hồi giá tốt nhất cho số lượng lớn.
              </p>
              <Link
                to={`/bulk-buy?productId=${product?.id || ""}&productName=${encodeURIComponent(product?.productName || "")}`}
                className="mt-3 inline-flex items-center rounded-lg bg-indigo-700 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-800"
              >
                Gửi yêu cầu báo giá
              </Link>
            </div>

            {/* Contact & SKU */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-center mb-2">
                <p className="text-sm text-gray-700">{t("product.have_a_question")}</p>
                <a href="#" className="text-indigo-600 text-sm ml-2 hover:underline">
                  {t("product.contact_us")}
                </a>
              </div>
              <p className="text-gray-500 text-xs">
                {t("product.sku_d33654")}
              </p>
            </div>

            {/* More Information */}
            <button
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
              onClick={() => setExpanded(!expanded)}
            >
              <svg
                viewBox="0 0 24 24" fill="none"
                className={`w-4 h-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="M19 9l-7 7-7-7"/>
              </svg>
              <span>{t("product.more_information")}</span>
            </button>
            {expanded && (
              <div className="mt-4 text-sm text-gray-600 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                Thong tin bo sung ve san pham se duoc hien thi tai day...
              </div>
            )}
          </div>

          {/* Right Section: Product Image & Icons */}
          <div className="flex flex-col items-center lg:items-end">
            <div className="flex flex-col lg:flex-row justify-between w-full h-full">
              {/* Social Icons */}
              <div className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 mb-4 lg:mb-0">
                <button className="bg-white rounded-full p-2.5 border border-gray-200 hover:border-indigo-400 hover:text-red-500 transition shadow-sm">
                  <IcHeart className="w-5 h-5 text-gray-500" />
                </button>
                <button className="bg-white rounded-full p-2.5 border border-gray-200 hover:border-indigo-400 hover:text-blue-500 transition shadow-sm">
                  <IcShare className="w-5 h-5 text-gray-500" />
                </button>
                <button className="bg-white rounded-full p-2.5 border border-gray-200 hover:border-indigo-400 hover:text-green-500 transition shadow-sm">
                  <IcMessage className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Product Image */}
              <div className="flex-1 flex justify-center items-center w-full lg:w-auto">
                <div className="relative w-full max-w-md bg-gray-50 rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6 group">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />
                  <img
                    src={product.image}
                    alt={product.productName}
                    className="w-full h-auto object-contain max-h-96 group-hover:scale-[1.03] transition-transform duration-500"
                  />
                </div>
              </div>
            </div>

            {/* Zip Payment & Dots */}
            <div className="w-full mt-6 pt-6 border-t border-gray-200">
              <div className="flex flex-col items-center space-y-3">
                <div className="flex items-center justify-center space-x-2">
                  <img
                    src={zip}
                    alt={t("product.zip_payment_option")}
                    className="h-5"
                  />
                  <p className="text-xs text-gray-600">
                    own it now, up to 6 months interest free{" "}
                    <a href="#" className="text-indigo-600 font-medium hover:underline">
                      {t("product.learn_more")}
                    </a>
                  </p>
                </div>

                <div className="flex justify-center space-x-2">
                  <span className="h-2 w-2 rounded-full bg-indigo-600"></span>
                  <span className="h-2 w-2 rounded-full bg-gray-300 hover:bg-gray-400 cursor-pointer transition"></span>
                  <span className="h-2 w-2 rounded-full bg-gray-300 hover:bg-gray-400 cursor-pointer transition"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// SVG Icons
const IcHeart = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);
const IcShare = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
  </svg>
);
const IcMessage = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);
