import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { removeFavoriteById } from "../../services/FavoriteServices";
import { useFavorites } from "../../hooks/useFavorites";
import { useState } from "react";
import { toast } from "react-toastify";
import Button from "../ui/Button";
import EmptyState from "../ui/EmptyState";
import ProductGridSkeleton from "../ui/ProductGridSkeleton";
import StatusNotice from "../ui/StatusNotice";

const UserFavorites = ({ userId: propUserId }) => {
  const { t } = useTranslation();
  const [removingId, setRemovingId] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' hoặc 'list'

  // Sử dụng userId từ props hoặc từ context
  const {
    favorites,
    loading,
    error,
    totalCount,
    refreshFavorites,
    userId: contextUserId,
  } = useFavorites();

  // Ưu tiên userId từ props
  const effectiveUserId = propUserId || contextUserId;

  // Xóa sản phẩm khỏi yêu thích với animation
  const handleRemoveFavorite = async (favoriteId, productName) => {
    if (
      !window.confirm(
        `Bạn có chắc muốn xóa "${productName}" khỏi danh sách yêu thích?`
      )
    ) {
      return;
    }

    setRemovingId(favoriteId);
    try {
      await removeFavoriteById(favoriteId);
      // Refresh danh sách sau khi xóa
      await refreshFavorites();

      toast.success("Đã xóa sản phẩm khỏi danh sách yêu thích");
    } catch (err) {
      console.error("Error removing favorite:", err);
      toast.error("Không thể xóa sản phẩm: " + err.message);
    } finally {
      setRemovingId(null);
    }
  };

  // Format  tiền
  const formatPrice = price => {
    if (!price) return "Liên hệ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Format ngày thêm vào yêu thích
  const formatDate = dateString => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!effectiveUserId) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">
          {/* Vui lòng đăng nhập để xem danh sách yêu thích */}
          {t("my_favourite.you_have_no_items")}
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Debug: propUserId={propUserId}, contextUserId={contextUserId}
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-6">
        <ProductGridSkeleton count={8} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6">
        <StatusNotice
          tone="error"
          title="Không tải được dữ liệu"
          message={`Lỗi: ${error}`}
          actionText="Thử lại"
          onAction={refreshFavorites}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t("my_favourite.favourite_products")}
          </h2>
          <p className="text-gray-600">
            {totalCount > 0
              ? // ? `${totalCount} sản phẩm trong danh sách yêu thích`
                `${totalCount} ${t("my_favourite.favourite_products")}`
              : t("my_favourite.you_have_no_items")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/*  toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === "grid"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === "list"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Refresh  */}
          <Button
            onClick={refreshFavorites}
            disabled={loading}
            variant="primary"
            icon={
              <svg
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            }
          >
            {loading ? "Đang tải..." : t("my_favourite.refresh")}
          </Button>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <EmptyState
              title={t("my_favourite.you_have_no_items")}
              description={t("my_favourite.you_have_no_items_desc")}
              className="py-0"
            />
            <div className="mt-6">
              <Link to="/products">
                <Button
                  variant="primary"
                  icon={
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  }
                >
                  {t("my_favourite.explore_products")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
          }
        >
          {favorites.map(favorite =>
            viewMode === "grid" ? (
              <div
                key={favorite.id}
                className={`relative bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${
                  removingId === favorite.id ? "opacity-50 scale-95" : ""
                }`}
              >
                {/* Link wrapper cho card */}
                <Link
                  to={`/product/${favorite.productId}/productAbout`}
                  className="absolute inset-0 z-10 rounded-xl"
                  aria-label={`Xem chi tiết ${favorite.productName}`}
                />
                <div className="relative group">
                  <div className="aspect-square w-full overflow-hidden rounded-t-xl bg-gray-100">
                    <img
                      src={favorite.productImageUrl || "/placeholder-image.jpg"}
                      alt={favorite.productName}
                      className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      onError={e => {
                        e.target.src = "/placeholder-image.jpg";
                      }}
                    />
                  </div>

                  {favorite.productCategoryName && (
                    <div className="absolute top-3 left-3">
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        {favorite.productCategoryName}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem]">
                    <Link
                      to={`/product/${favorite.productId}/productAbout`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {favorite.productName}
                    </Link>
                  </h3>

                  <p className="text-lg font-bold text-blue-600 mb-3">
                    {formatPrice(favorite.productPrice)}
                  </p>

                  <p className="text-xs text-gray-400 mb-4">
                    {t("my_favourite.added_at")}: {formatDate(favorite.addedAt)}
                  </p>

                  <div className="flex gap-2">
                    <Link
                      to={`/product/${favorite.productId}/productAbout`}
                      className="relative z-20 flex-1 bg-gradient-to-r from-gray-900 to-purple-950 hover:from-gray-800 hover:to-violet-900 text-white text-sm font-medium py-2.5 px-4 rounded-lg text-center transition-all"
                    >
                      {t("my_favourite.view_details")}
                    </Link>
                    <button
                      onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemoveFavorite(favorite.id, favorite.productName);
                      }}
                      disabled={removingId === favorite.id}
                      className="relative z-20 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 p-2.5 rounded-lg transition-colors disabled:opacity-50"
                      title={t("my_favourite.remove")}
                    >
                      {removingId === favorite.id ? (
                        <svg
                          className="w-4 h-4 animate-spin"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
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
                      ) : (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // List View
              <div
                key={favorite.id}
                className={`relative bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 ${
                  removingId === favorite.id ? "opacity-50" : ""
                }`}
              >
                {/* Link wrapper cho list item */}
                <Link
                  to={`/product/${favorite.productId}/productAbout`}
                  className="absolute inset-0 z-10 rounded-xl"
                  aria-label={`Xem chi tiết ${favorite.productName}`}
                />
                <div className="flex p-4 gap-4">
                  <div className="flex-shrink-0">
                    <img
                      src={favorite.productImageUrl || "/placeholder-image.jpg"}
                      alt={favorite.productName}
                      className="w-20 h-20 object-cover rounded-lg"
                      onError={e => {
                        e.target.src = "/placeholder-image.jpg";
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          <Link
                            to={`/product/${favorite.productId}/productAbout`}
                            className="hover:text-blue-600 transition-colors"
                          >
                            {favorite.productName}
                          </Link>
                        </h3>

                        {favorite.productCategoryName && (
                          <p className="text-sm text-gray-500 mb-2">
                            {favorite.productCategoryName}
                          </p>
                        )}

                        <p className="text-xl font-bold text-blue-600 mb-2">
                          {formatPrice(favorite.productPrice)}
                        </p>

                        <p className="text-xs text-gray-400">
                          Đã thích: {formatDate(favorite.addedAt)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Link
                          to={`/product/${favorite.productId}/productAbout`}
                          className="relative z-20 bg-gradient-to-r from-gray-900 to-purple-950 hover:from-gray-800 hover:to-violet-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                        >
                          Xem chi tiết
                        </Link>
                        <button
                          onClick={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemoveFavorite(
                              favorite.id,
                              favorite.productName
                            );
                          }}
                          disabled={removingId === favorite.id}
                          className="relative z-20 bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition-colors"
                          title={t("my_favourite.remove")}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"
                              clipRule="evenodd"
                            />
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default UserFavorites;
