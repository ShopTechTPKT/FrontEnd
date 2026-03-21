import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../utils/redux/cartSlice';
import notify from '../../utils/notify';
import { addFavorite, removeFavorite, checkIsFavorited } from '../../apis/favoriteApi';

const ProductCard = ({ product }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isCheckingFavorite, setIsCheckingFavorite] = useState(false);

  // Helper: lấy userId (Long) từ localStorage
  const getCurrentUserId = () => {
    try {
      const savedUser = localStorage.getItem("user");
      if (!savedUser) return null;
      const parsed = JSON.parse(savedUser);
      const raw =
        parsed?.id ??
        parsed?.customerId ??
        parsed?.customerID ??
        parsed?.userId ??
        null;
      if (raw == null) return null;
      const idNum = typeof raw === "number" ? raw : Number(raw);
      return Number.isFinite(idNum) ? idNum : null;
    } catch (e) {
      console.error("Lỗi khi đọc user từ localStorage:", e);
      return null;
    }
  };

  // Check if product is favorited
  useEffect(() => {
    const userId = getCurrentUserId();
    if (userId && product?.productID) {
      setIsCheckingFavorite(true);
      checkIsFavorited(userId, product.productID)
        .then(setIsFavorited)
        .finally(() => setIsCheckingFavorite(false));
    }
  }, [product?.productID]);

  const handleClick = () => {
    navigate(`/product/${product.productID}/productAbout`);
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    
    const userId = getCurrentUserId();
    
    try {
      await dispatch(addToCart({
        userId,
        productId: product.productID,
        quantity: 1,
        productData: {
          id: product.productID,
          name: product.productName,
          unitPrice: product.price || 0,
          imageUrl: product.image || ''
        }
      })).unwrap();
      
      notify.success("Đã thêm sản phẩm vào giỏ hàng!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      notify.error("Lỗi khi thêm sản phẩm vào giỏ hàng!");
    }
  };

  const handleAddToWishlist = async (e) => {
    e.stopPropagation();
    const userId = getCurrentUserId();
    
    if (!userId) {
      notify.error("Vui lòng đăng nhập để thêm yêu thích");
      return;
    }

    try {
      if (isFavorited) {
        await removeFavorite(userId, product.productID);
        setIsFavorited(false);
        notify.success("Đã xóa khỏi yêu thích");
      } else {
        await addFavorite(userId, product.productID);
        setIsFavorited(true);
        notify.success("Đã thêm vào yêu thích");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      notify.error("Lỗi khi thêm/xóa yêu thích");
    }
  };

  return (
    <div
      className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer"
      onClick={handleClick}
    >
      {/* Stock Status Badge */}
      <div className="absolute top-3 left-3 z-10">
        {product.inStock ? (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
            {t('product.in_stock')}
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
            {t('product.check_availability')}
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="flex flex-col gap-2">
          <button
            onClick={handleAddToWishlist}
            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors relative"
            disabled={isCheckingFavorite}
            title={isFavorited ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
          >
            <svg viewBox="0 0 24 24" fill={isFavorited ? "currentColor" : "none"} className={`w-4 h-4 transition-all ${isFavorited ? 'text-red-500' : 'text-gray-600'}`}>
              <path d="M12 20s-7-4.6-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.4-7 10-7 10Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {isCheckingFavorite && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 border border-gray-700 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </button>
          <button
            onClick={handleAddToCart}
            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-gray-600">
              <path d="M3 4H5L7.2 14.5C7.3 15 7.8 15.4 8.3 15.4H17.8C18.3 15.4 18.8 15 18.9 14.5L20.3 8.5H6.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9.2" cy="19" r="1.4" fill="currentColor" />
              <circle cx="17.2" cy="19" r="1.4" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>

      {/* Product Image */}
      <div className="aspect-square bg-gray-50 flex items-center justify-center p-4">
        <img
          src={product.image}
          alt={product.productName}
          className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Rating */}
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, index) => (
              <svg key={index} viewBox="0 0 20 20" fill="currentColor" className="text-yellow-400 w-3 h-3 mr-0.5">
                <path d="M10 2.8l2.2 4.4 4.9.7-3.5 3.4.8 4.8L10 14.7 5.6 16l.8-4.8L2.9 7.9l4.9-.7L10 2.8Z" />
              </svg>
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-1">(4.8)</span>
        </div>

        {/* Product Name */}
        <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
          {product.productName}
        </h3>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 line-through">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(product.price * 1.25)}
            </p>
            <p className="text-lg font-bold text-gray-900">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(product.price)}
            </p>
          </div>
          
          {/* Quick View Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            className="opacity-0 group-hover:opacity-100 p-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-200"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
              <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;