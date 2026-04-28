import { useEffect, useState, useRef } from "react";
import {
  AiOutlineHeart,
  AiFillHeart,
  AiOutlineShareAlt,
  AiOutlineMessage,
} from "react-icons/ai";
import { BiChevronDown, BiChevronUp } from "react-icons/bi";
//import dispatch từ redux
import { useDispatch } from "react-redux";
import {
  FaHeadset,
  FaUserCircle,
  FaPercentage,
  FaShoppingCart,
} from "react-icons/fa";
import zip from "../../assets/images/ProductDetail/zip.png";
import { FaPaypal } from "react-icons/fa";

// Import các dịch vụ và hooks cần thiết
import { getProductByIdWithDetails } from "../../services/MockProductService";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { addToCart } from "../../utils/redux/cartSlice.jsx";
import { getReviewsByProduct, createReview } from "../../apis/reviewProductApi.jsx";
import { getUserById } from "../../apis/userApis.jsx";
import Loading from "../Loading";
import ProductQASection from "./ProductQASection.jsx";
import { toast } from "react-toastify";
import logo from "../../assets/logo-text.png";
import notify from "../../utils/notify.js";
import { useFavorites } from "../../hooks/useFavorites";
import { useRecentlyViewed } from "../../hooks/useRecentlyViewed";
import ImageZoom from "./ImageZoom";
import StickyBuyBar from "./StickyBuyBar";
import axiosInstance from "../../custom/axios";
// Component cải thiện cho Bộ chọn số lượng - Đơn giản và UX tốt hơn
const QuantitySelector = ({ quantity, setQuantity }) => {
  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(q => q - 1);
    }
  };

  const handleIncrease = () => {
    setQuantity(q => q + 1);
  };

    const handleInputChange = e => {
    const val = e.target.value;
    if (val === "") {
      setQuantity(1);
      return;
    }
    const numVal = parseInt(val);
    if (!isNaN(numVal) && numVal >= 1) {
      setQuantity(numVal);
    }
  };

  return (
    <div className="inline-flex items-center border border-gray-300 rounded-md bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Decrease Button */}
      <button
        type="button"
        onClick={handleDecrease}
        disabled={quantity <= 1}
        className="px-4 py-2.5 text-gray-700 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium text-lg leading-none border-r border-gray-300"
        aria-label="Giảm số lượng"
      >
        −
      </button>
      
      {/* Quantity Input */}
      <input
        id="quantity-selector"
        type="number"
        value={quantity}
        onChange={handleInputChange}
        min="1"
        className="w-16 text-center text-gray-900 font-medium py-2.5 px-2 border-0 focus:ring-0 focus:outline-none bg-transparent text-base"
        aria-label="Số lượng"
      />
      
      {/* Increase Button */}
      <button
        type="button"
        onClick={handleIncrease}
        className="px-4 py-2.5 text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors font-medium text-lg leading-none border-l border-gray-300"
        aria-label="Tăng số lượng"
      >
        +
      </button>
    </div>
  );
};
//define dispatch

export default function ProductDetail() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { id } = useParams();
  const [product, setProduct] = useState({});
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1); // Thêm state cho số lượng
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [validationError, setValidationError] = useState("");
  const [activeTab, setActiveTab] = useState("reviews"); // "reviews" | "qa"
  const {
    isFavorited,
    loading: favoriteLoading,
    handleToggleFavorite,
  } = useFavorites(id);
  const { addItem: addToRecentlyViewed } = useRecentlyViewed();

  // Ref for sticky buy bar detection
  const buyBoxRef = useRef(null);

  // Delivery estimate state
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [deliveryLoading, setDeliveryLoading] = useState(false);

  // Fetch delivery estimate once product loads
  useEffect(() => {
    if (!product || !product.productID) return;
    const fetchDelivery = async () => {
      try {
        setDeliveryLoading(true);
        // Get city from user profile or default to HCM
        const savedUser = localStorage.getItem("user");
        const user = savedUser ? JSON.parse(savedUser) : null;
        const city = user?.city || user?.address?.city || "Ho Chi Minh";
        const res = await axiosInstance.get(`/delivery/estimate?city=${encodeURIComponent(city)}`);
        setDeliveryInfo(res.data);
      } catch {
        setDeliveryInfo({ minDays: 2, maxDays: 4, earliestDate: null, latestDate: null });
      } finally {
        setDeliveryLoading(false);
      }
    };
    fetchDelivery();
  }, [product?.productID]);

  // Track recently viewed product
  useEffect(() => {
    if (product && Object.keys(product).length > 0) {
      addToRecentlyViewed(product);
    }
  }, [product?.productID]);

// 🟡 Lấy review khi có productId
useEffect(() => {
  async function fetchReviews() {
    if (!id) return;

    const res = await getReviewsByProduct(id);
    if (res.EC === 1 && Array.isArray(res.DT)) {
      // Gọi API lấy thông tin user cho từng review
      const reviewsWithNames = await Promise.all(
        res.DT.map(async (review) => {
          if (review.userId) {
          const userRes = await getUserById(review.userId);
if (userRes.EC === 1 && userRes.DT) {
  const user = userRes.DT;
  return {
    ...review,
    reviewerName:
      user.fullName ||
      user.name ||
      user.username ||
      user.userName ||
      user.tenNguoiDung ||
      "Người dùng",
  };
}

          }
          return { ...review, reviewerName: "Người dùng ẩn danh" };
        })
      );

      setReviews(reviewsWithNames);

      // Tính trung bình rating
      if (reviewsWithNames.length > 0) {
        const avg =
          reviewsWithNames.reduce((sum, r) => sum + (r.rating || 0), 0) /
          reviewsWithNames.length;
        setAverageRating(avg);
      }
    }
  }

  fetchReviews();
}, [id]);
const handleFavoriteClick = async e => {
  // Kiểm tra đăng nhập
  e.stopPropagation();
  const user = getCurrentUser();
  if (!user) {
    // Chuyển đến trang login nếu chưa đăng nhập

    notify.error("Vui lòng đăng nhập để thêm yêu thích");
    return;
  }

  try {
    await handleToggleFavorite();

    // Hiển thị thông báo
    // const message = isFavorited
    //   ? "Đã xóa khỏi danh sách yêu thích"
    //   : "Đã thêm vào danh sách yêu thích";
    // toast(message, { type: isFavorited ? "info" : "success" });
    if (isFavorited) {
      notify.success("Đã xóa khỏi yêu thích");
    } else {
      notify.success("Đã thêm vào yêu thích");
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
    notify.error("Lỗi khi thêm/xóa yêu thích");
  }
};
// Helper function to get current user
const getCurrentUser = () => {
  try {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) return null;
    return JSON.parse(savedUser);
  } catch (e) {
    console.error("Lỗi khi đọc user từ localStorage:", e);
    return null;
  }
};

// Handle submit review
const handleSubmitReview = async () => {
  const user = getCurrentUser();
  
  // Kiểm tra đăng nhập
  if (!user) {
      toast.error(t('reviews.login_required_toast'));
      return;
  }

  // Kiểm tra rating và comment
  if (newRating === 0 || newComment.trim() === "") {
      toast.warning(t('reviews.rating_comment_required_toast'));
      return;
  }

  try {
      const reviewData = {
          rating: newRating,
          comment: newComment,
          productId: id,
          // Đảm bảo lấy đúng ID người dùng
          userId: user.id || user.customerID,
      };

      const res = await createReview(reviewData);

      // Kiểm tra nếu bình luận bị vi phạm
      if (res?.violate === true) {
          const violationReason = res.violationReason || t('reviews.inappropriate_content');
          const errorMsg = t('reviews.violation_warning', { violationReason });

          setValidationError(errorMsg);
          toast.warning(errorMsg, {
              autoClose: 4000,
              icon: "⚠️"
          });
          return;
      }

      // ✅ Nếu không vi phạm và có ID -> thành công
      if (res?.id) {
          const newReview = {
              ...res,
              // Lấy tên người dùng hiện tại hoặc mặc định "You" (t('reviews.you'))
              reviewerName: user.fullName || user.name || user.username || t('reviews.you'),
          };

          setReviews((prev) => [...prev, newReview]);

          // Cập nhật rating trung bình
          const allReviews = [...reviews, newReview];
          const avg =
              allReviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
              allReviews.length;
          setAverageRating(avg);

          setNewRating(5);
          setNewComment("");
          setValidationError(""); // Clear error on success
          toast.success(t('reviews.thank_you_toast'));
      } else {
          // Xử lý lỗi nếu API không trả về ID
          toast.error(t('reviews.error_sending_toast'));
      }
  } catch (err) {
      // Xử lý lỗi mạng hoặc lỗi API tổng quát
      console.error(t('reviews.error_on_send'), err.response || err);
      toast.error(t('reviews.error_occurred_toast'));
  }
};
  const handleAddToCart = () => {
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

    console.log("Adding to cart:", { userId, productId: product.productID, quantity });

    // Sử dụng addToCart với signature mới
      try {
      dispatch(
        addToCart({
          userId: userId,
          productId: product.productID,
          quantity: quantity,
          productData: {
            id: product.productID,
            name: product.productName,
            unitPrice: product.price || 0,
            imageUrl: product.image || "",
          },
        })
      );
    } catch (err) {
      console.error("Lỗi khi thêm vào giỏ hàng:", err);
    }
  };
  // Hàm mock để format tiền tệ (giả định dùng VND)
  const formatCurrency = value => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  //  Lấy sản phẩm từ Mock Data (Logic giữ nguyên)
  async function fetchProduct(id) {
    try {
      setLoading(true);
      const res = await getProductByIdWithDetails(id);
      if (res && res.DT && res.DT.length > 0) {
        // Giả định giá là một số (hoặc bạn sẽ cần parse nó)
        setProduct(res.DT[0]);
      } else {
        setProduct(null);
      }
    } catch (error) {
      console.error(error);
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

  if (!product || Object.keys(product).length === 0) {
    return (
      <div className="container mx-auto p-8 text-center text-xl text-gray-500">
        {t("product.loading_or_not_found")}
      </div>
    );
  }

  // Sử dụng unitPrice trực tiếp từ API thay vì parse từ string
  const price = product.unitPrice || 0;
  const originalPrice = price * 1.25; // Giả định giá gốc cao hơn 25%

  return (
    <>
    <div className="bg-transparent">
      {/* Breadcrumb & Social Icons */}
      <div className="flex justify-between items-center text-sm mb-6">
        <div className="text-gray-600">
          <span className="hover:text-violet-600 transition cursor-pointer">
            {t("product.home")} / {product.categoryName} /{" "}
          </span>
          <span className="text-gray-400">{product.seriesName}</span>
        </div>
        <div className="flex space-x-3">
        <button
            onClick={handleFavoriteClick}
            disabled={favoriteLoading}
            className={`transition-all duration-300 transform hover:scale-110 ${
              favoriteLoading
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            } ${
              isFavorited
                ? "text-red-500 hover:text-red-600"
                : "text-gray-500 hover:text-red-500"
            }`}
          >
            {favoriteLoading ? (
              <div className="w-5 h-5 animate-spin">
                <svg className="w-full h-full" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
            ) : isFavorited ? (
              <AiFillHeart className="w-5 h-5" />
            ) : (
              <AiOutlineHeart className="w-5 h-5" />
            )}
          </button>
          <button
            title="Copy link sản phẩm"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              notify.success("Đã copy link sản phẩm!");
            }}
            className="text-gray-500 hover:text-violet-600 transition p-2 hover:bg-violet-50 rounded-full"
          >
            <AiOutlineShareAlt className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Product Layout - Cleaner Design */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 bg-white p-6 rounded-lg border border-gray-100">
          {/* Column 1: Product Image & Gallery */}
          <div className="col-span-1 lg:col-span-1">
            <div className="relative rounded-xl p-6 bg-gray-50 border border-gray-200 hover:border-gray-300 transition">
              <ImageZoom
                src={product.image}
                alt={product.productName}
              />
            </div>
            {/* Gallery Thumbnails */}
            <div className="flex space-x-2 mt-4 overflow-x-auto justify-center">
              <div className="w-16 h-16 border-2 border-violet-500 rounded-lg cursor-pointer bg-gray-100 hover:border-violet-600 transition"></div>
              <div className="w-16 h-16 border border-gray-300 rounded-lg cursor-pointer bg-gray-200 hover:border-violet-400 transition"></div>
              <div className="w-16 h-16 border border-gray-300 rounded-lg cursor-pointer bg-gray-200 hover:border-violet-400 transition"></div>
            </div>
          </div>

          {/* Column 2: Product Details & Options */}
          <div className="col-span-1 lg:col-span-1 border-r border-gray-100 pr-6">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
              {product.productName}
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              SKU: {product.productID || "N/A"} | {t("product.in_stock")}
            </p>

            {/* Price Section - Simplified */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-baseline space-x-3 mb-2">
                <p className="text-gray-400 line-through text-base">
                  {formatCurrency(originalPrice)}
                </p>
                <p className="text-3xl lg:text-4xl font-bold text-red-600">
                  {formatCurrency(price)}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="bg-red-50 text-red-600 text-xs font-semibold px-2.5 py-1 rounded-full border border-red-200">
                  -25%
                </span>
                <p className="text-sm text-green-600 font-medium">
                  Khuyến mãi đặc biệt
                </p>
              </div>
            </div>

            {/* Options Selector */}
            <div className="space-y-5 mb-6">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Màu sắc:{" "}
                  <span className="font-normal text-violet-600">Xanh dương</span>
                </p>
                <div className="flex space-x-3">
                  <div
                    className="w-10 h-10 rounded-full bg-blue-900 border-2 border-violet-500 cursor-pointer ring-2 ring-violet-200 shadow-sm"
                    title="Blue"
                  ></div>
                  <div
                    className="w-10 h-10 rounded-full bg-red-600 border-2 border-gray-300 hover:border-violet-400 cursor-pointer transition"
                    title="Red"
                  ></div>
                  <div
                    className="w-10 h-10 rounded-full bg-gray-700 border-2 border-gray-300 hover:border-violet-400 cursor-pointer transition"
                    title="Gray"
                  ></div>
                </div>
              </div>
            </div>

            {/* Product Description - Cleaner */}
            <div>
              <h3 className="text-base font-semibold text-gray-800 mb-3">
                {t("product.info_title")}
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-gray-700 leading-relaxed text-sm">
                  {product.description || t("product.default_description")}
                </p>
              </div>
            </div>
          </div>

          {/* Column 3: Buy Box & Service/Payment Info */}
          <div className="col-span-1 lg:col-span-1 space-y-5">
            {/* Quantity and Action Buttons - Simplified */}
            <div ref={buyBoxRef} className="bg-white rounded-lg p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-5">
                <label htmlFor="quantity-selector" className="text-gray-700 font-medium text-sm cursor-pointer">
                  {t("product.quantity")}:
                </label>
                <QuantitySelector
                  quantity={quantity}
                  setQuantity={setQuantity}
                />
              </div>

              <button
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-violet-700 to-violet-600 text-white text-base font-semibold py-3 rounded-lg hover:opacity-90 transition-all duration-200 shadow-sm hover:shadow-md mb-3"
                onClick={() => handleAddToCart(product, quantity)}
              >
                <FaShoppingCart className="w-5 h-5" />
                <span>{t("product.add_to_cart")}</span>
              </button>
              
              <button className="w-full flex items-center justify-center space-x-2 bg-yellow-400 text-gray-900 text-base font-semibold py-3 rounded-lg hover:bg-yellow-500 transition-all duration-200 shadow-sm hover:shadow-md">
                <FaPaypal className="w-5 h-5" />
                <span>{t("product.pay_with_paypal")}</span>
              </button>
            </div>

            {/* Service & Support - Cleaner */}
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaHeadset className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{t("product.free_support")}</p>
                    <p className="text-xs text-gray-600">{t("product.service_24_7")}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaPercentage className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{t("product.best_price_guarantee")}</p>
                    <p className="text-xs text-gray-600">{t("product.lowest_price_online")}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Estimate */}
            {deliveryInfo && (
              <div className="bg-green-50 rounded-lg px-4 py-3 border border-green-100 flex items-start gap-2.5">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-green-600 mt-0.5 shrink-0">
                  <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M1 1h11l2.68 6.39a1 1 0 01.07.36L16 13h5l-2 4H9M1 1L3 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div>
                  <p className="text-xs font-semibold text-green-800">
                    {deliveryInfo.earliestDate && deliveryInfo.latestDate
                      ? `Giao hàng ${deliveryInfo.earliestDate} - ${deliveryInfo.latestDate}`
                      : `Giao trong ${deliveryInfo.minDays}-${deliveryInfo.maxDays} ngày`}
                  </p>
                  <p className="text-[11px] text-green-700 mt-0.5">Miễn phí vận chuyển</p>
                </div>
              </div>
            )}

            {/* Zip Payment */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <img
                src={zip}
                alt={t("product.zip_payment_option")}
                className="h-5"
              />
              <p className="text-xs text-gray-600 text-right">
                {t("product.own_it_now")}{" "}
                <a
                  href="#"
                  className="text-violet-600 font-medium hover:underline"
                >
                  {t("product.learn_more")}
                </a>
              </p>
            </div>
          </div>
        </div>
        {/* Product Reviews & Q&A Section */}
        <div className="mt-8 bg-white rounded-lg p-6 border border-gray-200">
          {/* Tabs */}
          <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
            <div className="inline-flex rounded-full bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => setActiveTab("reviews")}
                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                  activeTab === "reviews"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {t("reviews.title")}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("qa")}
                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                  activeTab === "qa"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Hỏi đáp
              </button>
            </div>

            {activeTab === "reviews" && (
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-yellow-500">
                  {averageRating?.toFixed(1) ?? "0.0"}
                </span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-sm ${
                        star <= Math.round(averageRating)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-sm text-gray-500">({reviews.length})</span>
              </div>
            )}
          </div>

          {/* Tab content */}
          {activeTab === "reviews" && (
            <>
              <div className="space-y-4 mb-6">
                {reviews.slice(0, showAll ? reviews.length : 3).map((review) => (
                  <div
                    key={review.id || review.reviewId}
                    className="pb-4 border-b last:border-0"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                          <span className="text-violet-600 font-semibold text-sm">
                            {(review.reviewerName || "A")[0].toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-gray-700 text-sm">
                          {review.reviewerName || "Ẩn danh"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`text-xs ${
                                star <= review.rating
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {review.comment}
                    </p>
                    {review.reply && (
                      <div className="mt-3 ml-8 pl-4 border-l-2 border-violet-200 bg-violet-50 rounded-r-lg p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <img
                            src={logo}
                            alt="Shop Solid Phere"
                            className="w-6 h-6 rounded object-contain"
                          />
                          <span className="font-semibold text-violet-700 text-sm">
                            Shop Solid Phere
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {review.reply}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {getCurrentUser() ? (
                <div className="pt-6 border-t">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">
                      {t("reviews.your_rating")}
                    </span>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className={`text-xl transition-colors ${
                            star <= newRating
                              ? "text-yellow-400 hover:text-yellow-500"
                              : "text-gray-300 hover:text-gray-400"
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    className={`w-full p-3 border rounded-lg text-sm focus:ring-1 outline-none transition-all ${
                      validationError
                        ? "border-red-300 focus:border-red-400 focus:ring-red-200"
                        : "border-gray-200 focus:border-violet-400 focus:ring-violet-200"
                    }`}
                    rows="3"
                    placeholder={t("reviews.placeholder_comment")}
                    value={newComment}
                    onChange={(e) => {
                      setNewComment(e.target.value);
                      if (validationError) setValidationError("");
                    }}
                  />

                  {validationError && (
                    <div className="mt-2 flex items-center space-x-2 text-xs text-red-600 bg-red-50 rounded px-3 py-2">
                      <span>⚠️</span>
                      <p>{validationError}</p>
                    </div>
                  )}

                  {!validationError && (
                    <p className="mt-2 text-xs text-gray-400">
                      {t("reviews.guideline")}
                    </p>
                  )}

                  <button
                    onClick={handleSubmitReview}
                    className="mt-3 px-4 py-2 bg-gradient-to-r from-violet-700 to-violet-600 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-colors"
                  >
                    {t("reviews.submit_button")}
                  </button>
                </div>
              ) : (
                <div className="pt-6 border-t text-center">
                  <p className="text-sm text-gray-600">
                    <a
                      href="/login"
                      className="text-violet-600 font-medium hover:underline"
                    >
                      {t("product.login")}
                    </a>{" "}
                    {t("reviews.to_write_review")}
                  </p>
                </div>
              )}

              {reviews.length > 3 && (
                <button
                  className="w-full py-2 text-sm text-violet-600 hover:text-violet-700 font-medium flex items-center justify-center space-x-1 transition-colors"
                  onClick={() => setShowAll(!showAll)}
                >
                  <span>
                    {showAll
                      ? t("reviews.hide_reviews")
                      : t("reviews.show_more", {
                          count: reviews.length - 3,
                        })}
                  </span>
                  {showAll ? <BiChevronUp /> : <BiChevronDown />}
                </button>
              )}
            </>
          )}

          {activeTab === "qa" && (
            <ProductQASection productId={id} />
          )}
        </div>
      </div>

      {/* Sticky Buy Bar — appears when user scrolls past the buy box */}
      <StickyBuyBar
        product={product}
        quantity={quantity}
        anchorRef={buyBoxRef}
      />
    </>
  );
}