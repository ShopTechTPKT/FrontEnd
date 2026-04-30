import { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import zip from "../../assets/images/ProductDetail/zip.png";

// Import các dịch vụ và hooks cần thiết
import { getUserById } from "../../apis/userApi";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { addToCart } from "../../utils/redux/cartSlice.jsx";
import { getReviewsByProduct, createReview } from "../../apis/reviewProductApi.jsx";
import formatCurrency from "../../utils/formatCurrency";
import Loading from "../Loading";
import ProductQASection from "./ProductQASection.jsx";
import notify from "../../utils/notify.js";
import { useFavorites } from "../../hooks/useFavorites";
import { useRecentlyViewed } from "../../hooks/useRecentlyViewed";
import ImageGallery from "./ImageGallery";
import StickyBuyBar from "./StickyBuyBar";
import axiosInstance from "../../custom/axios";
import NotifyMeButton from "./NotifyMeButton";
import RecommendationPanel from "./RecommendationPanel";
import ProductBundlePanel from "./ProductBundlePanel";
import InstallmentCalculatorPanel from "./InstallmentCalculatorPanel";
import { getActiveBundles } from "../../apis/bundleApi";
import {
  getProductRecommendations,
  getPopularProducts,
} from "../../apis/productApi";
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
  const REVIEW_PHOTO_STORAGE_KEY = "reviewPhotoByReviewId";
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
  const [newReviewPhotos, setNewReviewPhotos] = useState([]);
  const [validationError, setValidationError] = useState("");
  const [verifiedUsers, setVerifiedUsers] = useState({});
  const [reviewPhotoMap, setReviewPhotoMap] = useState({});
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
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [bundle, setBundle] = useState(null);
  const [bundleLoading, setBundleLoading] = useState(false);
  const [addingBundle, setAddingBundle] = useState(false);

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

  useEffect(() => {
    if (!product?.productID) return;
    const loadRecommendations = async () => {
      setRecommendationLoading(true);
      try {
        const data = await getProductRecommendations(product.productID, 8);
        const mapped = (data || []).map((p) => ({
          productID: p.id,
          productName: p.name,
          price: p.unitPrice || 0,
          image: p.imageUrl || "",
        }));
        setRecommendations(mapped.filter((x) => x.productID !== product.productID));
      } catch {
        try {
          const fallback = await getPopularProducts(8);
          const mapped = (fallback || []).map((p) => ({
            productID: p.id,
            productName: p.name,
            price: p.unitPrice || 0,
            image: p.imageUrl || "",
          }));
          setRecommendations(mapped.filter((x) => x.productID !== product.productID));
        } catch {
          setRecommendations([]);
        }
      } finally {
        setRecommendationLoading(false);
      }
    };
    loadRecommendations();
  }, [product?.productID]);

  useEffect(() => {
    if (!product?.productID) return;
    const loadBundle = async () => {
      setBundleLoading(true);
      try {
        const bundles = await getActiveBundles();
        const match = bundles.find((b) =>
          (b?.items || []).some((item) => {
            const pid = Number(item?.product?.id ?? item?.product?.productID ?? item?.productId ?? 0);
            return pid === Number(product.productID);
          })
        );
        setBundle(match || null);
      } catch {
        setBundle(null);
      } finally {
        setBundleLoading(false);
      }
    };
    loadBundle();
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
      notify.error(t('reviews.login_required_toast'));
      return;
  }

  // Kiểm tra rating và comment
  if (newRating === 0 || newComment.trim() === "") {
      notify.warning(t('reviews.rating_comment_required_toast'));
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
          notify.warning(errorMsg);
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

          if (newReviewPhotos.length > 0) {
            setReviewPhotoMap((prev) => {
              const next = { ...prev, [res.id]: newReviewPhotos };
              localStorage.setItem(REVIEW_PHOTO_STORAGE_KEY, JSON.stringify(next));
              return next;
            });
          }
          setNewRating(5);
          setNewComment("");
          setNewReviewPhotos([]);
          setValidationError(""); // Clear error on success
          notify.success(t('reviews.thank_you_toast'));
      } else {
          // Xử lý lỗi nếu API không trả về ID
          notify.error(t('reviews.error_sending_toast'));
      }
  } catch (err) {
      notify.error(t('reviews.error_occurred_toast'));
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

  const handleAddBundleToCart = async (bundleData) => {
    const items = Array.isArray(bundleData?.items) ? bundleData.items : [];
    if (!items.length) return;
    setAddingBundle(true);
    try {
      const savedUser = localStorage.getItem("user");
      const parsed = savedUser ? JSON.parse(savedUser) : null;
      const userId = parsed?.customerID ?? parsed?.id ?? parsed?.customerId ?? null;

      for (const item of items) {
        const productId = Number(
          item?.product?.id ?? item?.product?.productID ?? item?.productId ?? 0
        );
        if (!productId) continue;
        const qty = Number(item?.quantity || 1);
        await dispatch(
          addToCart({
            userId,
            productId,
            quantity: qty,
            productData: {
              id: productId,
              name: item?.product?.productName || item?.product?.name || "",
              unitPrice: item?.product?.unitPrice || item?.product?.price || 0,
              imageUrl: item?.product?.image || item?.product?.imageUrl || "",
            },
          })
        );
      }
      notify.success("Đã thêm trọn bộ vào giỏ hàng");
    } catch {
      notify.error("Không thể thêm trọn bộ vào giỏ hàng");
    } finally {
      setAddingBundle(false);
    }
  };


  // Lấy sản phẩm từ API
  async function fetchProduct(productId) {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/products/${productId}`);
      const data = res?.data?.result || res?.data;
      if (data) {
        setProduct(data);
      } else {
        setProduct(null);
      }
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

  useEffect(() => {
    try {
      const stored = JSON.parse(
        localStorage.getItem(REVIEW_PHOTO_STORAGE_KEY) || "{}"
      );
      setReviewPhotoMap(stored && typeof stored === "object" ? stored : {});
    } catch {
      setReviewPhotoMap({});
    }
  }, []);

  useEffect(() => {
    const loadVerifiedPurchaseMap = async () => {
      const users = [...new Set((reviews || []).map((r) => r.userId).filter(Boolean))];
      if (!users.length || !product?.productID) {
        setVerifiedUsers({});
        return;
      }
      const checks = await Promise.all(
        users.map(async (userId) => {
          try {
            const response = await axiosInstance.get(`/order-details/user/${userId}`);
            const details = Array.isArray(response?.data) ? response.data : [];
            const purchased = details.some(
              (detail) => Number(detail.productId) === Number(product.productID)
            );
            return [userId, purchased];
          } catch {
            return [userId, false];
          }
        })
      );
      setVerifiedUsers(Object.fromEntries(checks));
    };
    loadVerifiedPurchaseMap();
  }, [reviews, product?.productID]);

  const handleSelectReviewPhotos = async (event) => {
    const files = Array.from(event.target.files || []).slice(0, 3);
    if (!files.length) return;
    const encoded = await Promise.all(
      files.map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(file);
          })
      )
    );
    setNewReviewPhotos(encoded.filter(Boolean));
  };

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
  const stockValue = Number(
    product.quantity ?? product.stock ?? product.stockQuantity ?? 1
  );
  const isOutOfStock =
    product.inStock === false ||
    String(product.availability || "").toLowerCase().includes("out") ||
    stockValue <= 0;

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
              <IcHeartFilled className="w-5 h-5" />
            ) : (
              <IcHeart className="w-5 h-5" />
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
            <IcShare className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Product Layout - Cleaner Design */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 bg-white p-6 rounded-lg border border-gray-100">
          {/* Column 1: Product Image & Gallery */}
          <div className="col-span-1 lg:col-span-1">
            <div className="relative rounded-xl p-6 bg-gray-50 border border-gray-200 hover:border-gray-300 transition">
              <ImageGallery
                images={[
                  product.image,
                  product.imageUrl,
                  ...(Array.isArray(product.images) ? product.images : []),
                  ...(Array.isArray(product.gallery) ? product.gallery : []),
                ].filter(Boolean)}
                alt={product.productName}
              />
            </div>
          </div>

          {/* Column 2: Product Details & Options */}
          <div className="col-span-1 lg:col-span-1 border-r border-gray-100 pr-6">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
              {product.productName}
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              SKU: {product.productID || "N/A"} |{" "}
              {isOutOfStock ? t("product.check_availability") : t("product.in_stock")}
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

              {isOutOfStock ? (
                <NotifyMeButton productId={product.productID} className="mb-3" />
              ) : (
                <button
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-violet-700 to-violet-600 text-white text-base font-semibold py-3 rounded-lg hover:opacity-90 transition-all duration-200 shadow-sm hover:shadow-md mb-3"
                  onClick={() => handleAddToCart(product, quantity)}
                >
                  <IcCart className="w-5 h-5" />
                  <span>{t("product.add_to_cart")}</span>
                </button>
              )}
              
              <button className="w-full flex items-center justify-center space-x-2 bg-yellow-400 text-gray-900 text-base font-semibold py-3 rounded-lg hover:bg-yellow-500 transition-all duration-200 shadow-sm hover:shadow-md">
                <IcPaypal className="w-5 h-5" />
                <span>{t("product.pay_with_paypal")}</span>
              </button>
            </div>

            {/* Service & Support - Cleaner */}
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <IcHeadset className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{t("product.free_support")}</p>
                    <p className="text-xs text-gray-600">{t("product.service_24_7")}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <IcPercentage className="w-5 h-5 text-violet-600" />
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
            <InstallmentCalculatorPanel price={price} />
          </div>
        </div>
        <RecommendationPanel
          title="Có thể bạn thích"
          products={recommendations}
          loading={recommendationLoading}
        />
        <ProductBundlePanel
          bundle={bundle}
          loading={bundleLoading}
          adding={addingBundle}
          onAddBundleToCart={handleAddBundleToCart}
        />
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
                        {verifiedUsers[review.userId] && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                            <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth="2">
                              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Đã mua
                          </span>
                        )}
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
                    {((Array.isArray(review.imageUrls) && review.imageUrls.length > 0) ||
                      (Array.isArray(reviewPhotoMap[review.id]) && reviewPhotoMap[review.id].length > 0)) && (
                      <div className="mt-2 flex gap-2 overflow-x-auto">
                        {(Array.isArray(review.imageUrls) && review.imageUrls.length > 0
                          ? review.imageUrls
                          : reviewPhotoMap[review.id] || []
                        )
                          .slice(0, 3)
                          .map((img, idx) => (
                            <img
                              key={`${review.id}-${idx}`}
                              src={img}
                              alt="review"
                              className="w-16 h-16 rounded-md border border-gray-200 object-cover"
                            />
                          ))}
                      </div>
                    )}
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
                      <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 shrink-0" stroke="currentColor" strokeWidth="2">
                        <path d="M12 9v4m0 4h.01" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M10.3 3.5 1.8 18a1.5 1.5 0 0 0 1.3 2.2h17.8a1.5 1.5 0 0 0 1.3-2.2L13.7 3.5a1.5 1.5 0 0 0-2.6 0Z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p>{validationError}</p>
                    </div>
                  )}

                  {!validationError && (
                    <p className="mt-2 text-xs text-gray-400">
                      {t("reviews.guideline")}
                    </p>
                  )}

                  <div className="mt-3">
                    <label className="inline-flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2">
                        <path d="M4 8a2 2 0 0 1 2-2h2l1.2-1.4A2 2 0 0 1 10.7 4h2.6a2 2 0 0 1 1.5.6L16 6h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="12" r="3.2" />
                      </svg>
                      Thêm ảnh đánh giá (tối đa 3 ảnh)
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleSelectReviewPhotos}
                      />
                    </label>
                    {newReviewPhotos.length > 0 && (
                      <div className="mt-2 flex gap-2">
                        {newReviewPhotos.map((photo, index) => (
                          <img
                            key={`preview-${index}`}
                            src={photo}
                            alt="preview"
                            className="w-14 h-14 rounded border border-gray-200 object-cover"
                          />
                        ))}
                      </div>
                    )}
                  </div>

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
                  {showAll ? <IcChevronUp className="w-5 h-5" /> : <IcChevronDown className="w-5 h-5" />}
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

// SVG Icons
const IcHeart = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);
const IcHeartFilled = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);
const IcShare = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
  </svg>
);
const IcCart = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);
const IcPaypal = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M7.076 21.337H2.47a.641.641 0 01-.633-.74L4.944 3.72a.641.641 0 01.633-.538h6.883c4.148 0 6.002 2.016 5.565 5.344-.343 2.617-2.28 4.393-4.706 4.793-1.045.17-1.858.204-2.883.204h-1.4a.64.64 0 00-.632.536L7.076 21.337z"/>
  </svg>
);
const IcHeadset = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4a8 8 0 00-8 8v1.5a2.5 2.5 0 002.5 2.5h1.5v-6a2 2 0 012-2h4a2 2 0 012 2v6h1.5a2.5 2.5 0 002.5-2.5V12a8 8 0 00-8-8z" />
  </svg>
);
const IcPercentage = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M17 17h.01M5 19L19 5" />
  </svg>
);
const IcChevronUp = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
);
const IcChevronDown = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);