import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../custom/axios";
import { useTranslation } from 'react-i18next';
import Loading from "../Loading";
import zip from "../../assets/images/ProductDetail/zip.png";

export default function ProductSpeccs() {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const { id } = useParams();
  const [product, setProduct] = useState({});
  const [loading, setLoading] = useState(true);

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
      <div className="bg-white rounded-lg border border-gray-200 p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Section: Product Specs */}
          <div>
            <div className="text-sm mb-4 text-gray-600">
              <span className="hover:text-indigo-600 transition cursor-pointer">
                Home / {product.categoryName} /{"  "}
              </span>
              <span className="text-gray-400">{product.seriesName}</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
              {product.productName}
            </h1>
            <p className="text-indigo-600 text-sm mb-6 hover:underline cursor-pointer">
              Be the first to review this product
            </p>

            {/* Specifications Table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden mb-6 bg-white">
              {product.attributeList?.split("|").map((item, index, arr) => {
                const [key, value] = item.split(":");
                return (
                  <div
                    key={index}
                    className={`flex justify-between items-center p-4 ${
                      index !== arr.length - 1 ? "border-b border-gray-200" : ""
                    } ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100 transition`}
                  >
                    <span className="font-semibold text-sm text-gray-700">
                      {key?.trim() || "N/A"}
                    </span>
                    <span className="text-sm text-gray-600 text-right max-w-xs">
                      {value?.trim() || "N/A"}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Contact & SKU */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-center mb-2">
                <p className="text-sm text-gray-700">{t('product.have_a_question')}</p>
                <a href="#" className="text-indigo-600 text-sm ml-2 hover:underline">
                  {t('product.contact_us')}
                </a>
              </div>
              <p className="text-gray-500 text-xs">{t('product.sku_d33654')}</p>
            </div>

            {/* More Information */}
            <div>
              <button
                className="flex items-center text-sm font-medium text-gray-700 hover:text-indigo-600 transition"
                onClick={() => setExpanded(!expanded)}
              >
                <span className="mr-2 text-lg">{expanded ? "−" : "+"}</span>
                <span>{t('product.more_information')}</span>
              </button>
              {expanded && (
                <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  Thông tin bổ sung về thông số kỹ thuật sẽ được hiển thị tại đây...
                </div>
              )}
            </div>
          </div>

          {/* Right Section: Product Image & Icons */}
          <div className="flex flex-col items-center lg:items-end">
            <div className="flex flex-col lg:flex-row justify-between w-full h-full">
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

              <div className="flex-1 flex justify-center items-center w-full lg:w-auto">
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 max-w-md">
                  <img
                    src={product.image}
                    alt={product.productName}
                    className="w-full h-auto object-contain max-h-96"
                  />
                </div>
              </div>
            </div>

            <div className="w-full mt-6 pt-6 border-t border-gray-200">
              <div className="flex flex-col items-center space-y-3">
                <div className="flex items-center justify-center space-x-2">
                  <img src={zip} alt={t('product.zip_payment_option')} className="h-5" />
                  <p className="text-xs text-gray-600">
                    own it now, up to 6 months interest free{" "}
                    <a href="#" className="text-indigo-600 font-medium hover:underline">
                      {t('product.learn_more')}
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
