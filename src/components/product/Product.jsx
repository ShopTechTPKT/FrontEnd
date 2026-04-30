import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useParams } from "react-router-dom";
import a1 from "../../assets/images/ProductDetail/a1.png";
import a2 from "../../assets/images/ProductDetail/a2.png";
import a3 from "../../assets/images/ProductDetail/a3.png";
import a4 from "../../assets/images/ProductDetail/a4.png";
import a5 from "../../assets/images/ProductDetail/a5.png";
import a6 from "../../assets/images/ProductDetail/a6.png";
import a7 from "../../assets/images/ProductDetail/a7.png";
import zip from "../../assets/images/ProductDetail/zip.png";
import axiosInstance from "../../custom/axios";
import { useDispatch } from "react-redux";
import { addToCart } from "../../utils/redux/cartSlice";
import formatCurrency from "../../utils/formatCurrency";
import notify from "../../utils/notify";
import { useTranslation } from "react-i18next";
import Loading from "../Loading";

export default function Product() {
  const { t } = useTranslation();

  // const [expanded, setExpanded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const location = useLocation();
  const { id } = useParams();
  const [product, setProduct] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Determine active tab based on current route
  const getActiveTab = () => {
    const pathname = location.pathname;
    if (pathname.includes("productDetail")) return "detail";
    if (pathname.includes("productSpeccs")) return "specs";
    return "about"; // default to "about"
  };
  const activeNav = getActiveTab();
  // Fetch product from API
  async function fetchProduct(productId) {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/products/${productId}`);
      const data = res?.data?.result || res?.data;
      setProduct(data ? { ...data, quantity: 1 } : null);
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

  const dispatch = useDispatch();

  const handleClickAddToCart = (product) => {

    // Lấy userId từ localStorage
    const getCurrentUserId = () => {
      try {
        const savedUser = localStorage.getItem("user");
        if (!savedUser) return null;
        const parsed = JSON.parse(savedUser);
        return parsed?.customerID ?? parsed?.id ?? parsed?.customerId ?? null;
      } catch (e) {
        console.error("Lỗi khi đọc user từ localStorage:", e);
        return null;
      }
    };

    const userId = getCurrentUserId();

    // Thêm hàm xử lý sự kiện khi nhấn nút
    notify.success("Add to cart successfully!");
    dispatch(
      addToCart({
        userId: userId,
        productId: product.id || product.productID,
        quantity: quantity,
        productData: {
          id: product.id || product.productID,
          name: product.name || product.productName,
          unitPrice: product.unitPrice || product.price || 0,
          imageUrl: product.imageUrl || product.image || ''
        }
      })
    );
  };

  //   Hàm tăng giảm số lượng sản phẩm
  const handleIncrease = () => {
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    setProduct(prevProduct => ({
      ...prevProduct,
      quantity: newQuantity,
    }));
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      // Không cho giảm dưới 1
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      setProduct(prevProduct => ({
        ...prevProduct,
        quantity: newQuantity,
      }));
    }
  };
  const calculateTotal = (product, quantity) => {
    const unitPrice = product?.unitPrice || 0;
    return formatCurrency(unitPrice * quantity);
  };

  // Show loading while fetching product
  if (loading) {
    return (
      <div className="min-h-screen py-20">
        <Loading fullScreen={false} size="lg" text="Đang tải thông tin sản phẩm..." className="py-20" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Modern Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between py-4 gap-4">
            {/* Navigation Tabs - Modern Design */}
            <div className="flex items-center space-x-1 bg-gray-50 p-1 rounded-lg w-full lg:w-auto overflow-x-auto">
              <Link
                to={`/product/${id}/productAbout`}
                className={`relative px-4 lg:px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  activeNav === "about"
                    ? "bg-white text-violet-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {t("product.about_product")}
                {activeNav === "about" && (
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-violet-600 rounded-full"></span>
                )}
              </Link>
              <Link
                to={`/product/${id}/productDetail`}
                className={`relative px-4 lg:px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  activeNav === "detail"
                    ? "bg-white text-violet-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {t("common.details")}
                {activeNav === "detail" && (
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-violet-600 rounded-full"></span>
                )}
              </Link>
              <Link
                to={`/product/${id}/productSpeccs`}
                className={`relative px-4 lg:px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  activeNav === "specs"
                    ? "bg-white text-violet-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {t("product.specs")}
                {activeNav === "specs" && (
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-violet-600 rounded-full"></span>
                )}
              </Link>
            </div>

            {/* Quick Actions Bar - Only show on Detail and Specs tabs */}
            {activeNav !== "about" && (
              <div className="hidden lg:flex items-center space-x-4">
                {/* Price */}
                <div className="flex items-baseline space-x-2">
                  <span className="text-sm text-gray-500">
                    {t("product.price")}:
                  </span>
                  <span className="text-xl font-bold text-red-600">
                    {calculateTotal(product, quantity)}
                  </span>
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-2 py-1">
                  <button
                    onClick={handleDecrease}
                    disabled={quantity <= 1}
                    className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-violet-600 hover:bg-white rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <IcMinus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center text-base font-medium text-gray-700">
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncrease}
                    className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-violet-600 hover:bg-white rounded transition"
                  >
                    <IcPlus className="w-4 h-4" />
                  </button>
                </div>

                {/* Action Buttons */}
                <button
                  onClick={() => handleClickAddToCart(product)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-violet-700 to-violet-600 text-white px-5 py-2.5 rounded-lg hover:opacity-90 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <span className="text-sm font-medium">
                    {t("common.add_to_cart")}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-6">
        <Outlet />
      </div>

      {/* Outplay the Competition Section */}
      <div className="bg-black text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center mb-12">
            <h2 className="text-3xl font-bold mb-2">
              {t("product.outplay_the_competition")}
            </h2>
            <p className="max-w-lg text-center text-gray-300">
              Experience a 40% boost in computing from last generation. MSI
              Desktop equips the 10th Gen. Intel Core i7 processor with the
              upmost computing power to bring you an unparalleled gaming
              experience.
            </p>
            <p className="text-xs text-gray-400 mt-4">
              *Performance compared to i7-9700. Specs varies by model.
            </p>
          </div>

          <div className="flex justify-center mb-10">
            <img
              src={a2}
              alt={t("product.intel_core_i7_processor")}
              className="max-w-full"
            />
          </div>

          <div className="flex justify-center mt-6">
            <div className="flex space-x-2">
              <span className="h-2 w-2 rounded-full bg-white mx-1"></span>
              <span className="h-2 w-2 rounded-full bg-gray-600 mx-1"></span>
              <span className="h-2 w-2 rounded-full bg-gray-600 mx-1"></span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            {/* Left Section: Support Options */}
            <div className="md:w-1/2 mb-8 md:mb-0">
              <div className="max-w-md">
                <div className="bg-white rounded-lg shadow-sm">
                  <button className="w-full flex items-center justify-between p-4 border-b border-gray-200">
                    <span className="font-medium">
                      {t("product.product_support")}
                    </span>
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      ></path>
                    </svg>
                  </button>

                  <button className="w-full flex items-center justify-between p-4 border-b border-gray-200">
                    <span className="font-medium">{t("remaining.faq")}</span>
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      ></path>
                    </svg>
                  </button>

                  <button className="w-full flex items-center justify-between p-4">
                    <span className="font-medium">
                      {t("product.our_buyer_guide")}
                    </span>
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      ></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Section: Customer Support Image */}
            <div className="md:w-1/2 flex justify-center md:justify-end">
              <img
                src={a3}
                alt={t("product.customer_support")}
                className="rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-black text-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            {t("remaining.features")}
          </h2>
          <p className="text-center max-w-3xl mx-auto mb-16 text-gray-300">
            The MSI series brings out the best in gamers by allowing full
            expression in color with advanced RGB lighting control and
            synchronization.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="bg-black rounded-full p-4 mb-4">
                <img src={a4} alt={t("product.intel")} className="mx-auto" />
              </div>
              <h3 className="text-lg font-bold mb-2">
                INTEL Core™ i7 processor
              </h3>
              <p className="text-sm text-gray-400">
                with the upmost computing power to bring you an unparalleled
                gaming experience.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="bg-black rounded-full p-4 mb-4">
                <img src={a5} alt={t("remaining.rtx")} className="mx-auto" />
              </div>
              <h3 className="text-lg font-bold mb-2">
                The new GeForce RTX SUPER™
              </h3>
              <p className="text-sm text-gray-400">
                Series has more cores and higher clocks for superior performance
                compared to previous gen RTX.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="bg-black rounded-full p-4 mb-4">
                <img src={a6} alt={t("remaining.ssd")} className="mx-auto" />
              </div>
              <h3 className="text-lg font-bold mb-2">
                Unleash the full potential with the latest SSD technology
              </h3>
              <p className="text-sm text-gray-400">
                the NVMe transfer, 6 times faster than traditional SATA SSD.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="bg-black rounded-full p-4 mb-4">
                <img src={a7} alt={t("product.ddr4")} className="mx-auto" />
              </div>
              <h3 className="text-lg font-bold mb-2">
                Featuring the latest 10th Gen Intel® Core™ i7 processors
              </h3>
              <p className="text-sm text-gray-400">
                memory can support up to DDR4 2666MHz to boost your gaming
                experience.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Service Icons Section */}
      <div className="bg-white py-12 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-600 rounded-full p-4 mb-4">
                <IcHeadset className="text-white w-6 h-6" />
              </div>
              <h3 className="font-bold mb-2">{t("product.product_support")}</h3>
              <p className="text-sm text-gray-600">
                Up to 3 years on-site service and available for your peace of
                mind.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-600 rounded-full p-4 mb-4">
                <IcUserCircle className="text-white w-6 h-6" />
              </div>
              <h3 className="font-bold mb-2">
                {t("product.personal_account")}
              </h3>
              <p className="text-sm text-gray-600">
                With big discounts, free delivery and a dedicated support
                specialist.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-600 rounded-full p-4 mb-4">
                <IcPercentage className="text-white w-6 h-6" />
              </div>
              <h3 className="font-bold mb-2">{t("product.amazing_savings")}</h3>
              <p className="text-sm text-gray-600">
                Up to 70% off new products, you can be sure of the best price.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// SVG Icons
const IcMinus = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
  </svg>
);
const IcPlus = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);
const IcHeadset = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4a8 8 0 00-8 8v1.5a2.5 2.5 0 002.5 2.5h1.5v-6a2 2 0 012-2h4a2 2 0 012 2v6h1.5a2.5 2.5 0 002.5-2.5V12a8 8 0 00-8-8z" />
  </svg>
);
const IcUserCircle = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IcPercentage = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M17 17h.01M5 19L19 5" />
  </svg>
);
