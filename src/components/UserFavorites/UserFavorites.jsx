import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import formatCurrency from "../../utils/formatCurrency";
import Button from "../ui/Button";
import EmptyState from "../ui/EmptyState";
import ProductGridSkeleton from "../ui/ProductGridSkeleton";
import StatusNotice from "../ui/StatusNotice";
import { useFavorites } from "../../hooks/useFavorites";
import {
  generateWishlistShareLink,
  getSharedWishlist,
  removeFavoriteById,
} from "../../services/FavoriteServices";

const UserFavorites = ({ userId: propUserId }) => {
  const [viewMode, setViewMode] = useState("grid");
  const [removingId, setRemovingId] = useState(null);
  const [shareCodeInput, setShareCodeInput] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [sharedFavorites, setSharedFavorites] = useState([]);
  const [isSharedMode, setIsSharedMode] = useState(false);
  const [loadingShared, setLoadingShared] = useState(false);

  const { favorites, loading, error, totalCount, refreshFavorites, userId: contextUserId } = useFavorites();
  const effectiveUserId = propUserId || contextUserId;

  const displayFavorites = useMemo(
    () => (isSharedMode ? sharedFavorites : favorites),
    [isSharedMode, sharedFavorites, favorites]
  );

  const displayCount = isSharedMode ? sharedFavorites.length : totalCount;

  const formatPrice = (price) => (price ? formatCurrency(price) : "Liên hệ");
  const formatDate = (dateString) =>
    dateString
      ? new Date(dateString).toLocaleDateString("vi-VN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

  const loadSharedByCode = async (code) => {
    if (!code?.trim()) {
      toast.error("Vui lòng nhập mã chia sẻ");
      return;
    }
    setLoadingShared(true);
    try {
      const data = await getSharedWishlist(code.trim());
      setSharedFavorites(Array.isArray(data?.favorites) ? data.favorites : []);
      setIsSharedMode(true);
      toast.success("Đã tải wishlist được chia sẻ");
    } catch (err) {
      toast.error(err.message || "Không thể tải wishlist chia sẻ");
    } finally {
      setLoadingShared(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareCode = params.get("share");
    if (shareCode) {
      setShareCodeInput(shareCode);
      loadSharedByCode(shareCode);
    }
  }, []);

  const handleRemoveFavorite = async (favoriteId, productName) => {
    const ok = window.confirm(`Bạn có chắc muốn xóa "${productName}" khỏi danh sách yêu thích?`);
    if (!ok) return;
    setRemovingId(favoriteId);
    try {
      await removeFavoriteById(favoriteId);
      await refreshFavorites();
      toast.success("Đã xóa sản phẩm khỏi danh sách yêu thích");
    } catch (err) {
      toast.error("Không thể xóa sản phẩm");
    } finally {
      setRemovingId(null);
    }
  };

  const handleCreateShareLink = async () => {
    if (!effectiveUserId) {
      toast.error("Vui lòng đăng nhập để chia sẻ wishlist");
      return;
    }
    try {
      const data = await generateWishlistShareLink(effectiveUserId);
      const fullLink = `${window.location.origin}${data?.link || ""}`;
      setShareLink(fullLink);
      await navigator.clipboard.writeText(fullLink);
      toast.success("Đã copy link chia sẻ wishlist");
    } catch (err) {
      toast.error(err.message || "Không thể tạo link chia sẻ");
    }
  };

  if (!effectiveUserId && !isSharedMode) {
    return (
      <div className="text-center py-8 text-gray-500">
        Vui lòng đăng nhập để xem danh sách yêu thích.
      </div>
    );
  }

  if (loading && !isSharedMode) {
    return <ProductGridSkeleton count={8} />;
  }

  if (error && !isSharedMode) {
    return (
      <StatusNotice
        tone="error"
        title="Không tải được dữ liệu"
        message={error}
        actionText="Thử lại"
        onAction={refreshFavorites}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={handleCreateShareLink} variant="outline">Chia sẻ wishlist</Button>
          <input
            value={shareCodeInput}
            onChange={(e) => setShareCodeInput(e.target.value)}
            placeholder="Nhập mã chia sẻ (VD: WL-8)"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <Button onClick={() => loadSharedByCode(shareCodeInput)} variant="primary" disabled={loadingShared}>
            {loadingShared ? "Đang tải..." : "Xem wishlist"}
          </Button>
          {isSharedMode && (
            <Button
              onClick={() => {
                setIsSharedMode(false);
                setSharedFavorites([]);
              }}
              variant="ghost"
            >
              Về wishlist của tôi
            </Button>
          )}
        </div>
        {shareLink && <p className="mt-2 break-all text-xs text-gray-500">{shareLink}</p>}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isSharedMode ? "Wishlist được chia sẻ" : "Sản phẩm yêu thích"}
          </h2>
          <p className="text-gray-600">{displayCount} sản phẩm</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setViewMode("grid")} variant={viewMode === "grid" ? "primary" : "outline"}>
            Dạng lưới
          </Button>
          <Button onClick={() => setViewMode("list")} variant={viewMode === "list" ? "primary" : "outline"}>
            Dạng danh sách
          </Button>
        </div>
      </div>

      {displayFavorites.length === 0 ? (
        <EmptyState
          title="Chưa có sản phẩm yêu thích"
          description="Hãy thêm sản phẩm bạn quan tâm vào wishlist."
        />
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"}>
          {displayFavorites.map((favorite) => (
            <div key={favorite.id} className={`rounded-xl border border-gray-200 bg-white ${removingId === favorite.id ? "opacity-50" : ""}`}>
              <Link to={`/product/${favorite.productId}/productAbout`}>
                <img
                  src={favorite.productImageUrl || "/placeholder-image.jpg"}
                  alt={favorite.productName}
                  className={viewMode === "grid" ? "h-52 w-full rounded-t-xl object-cover" : "h-24 w-24 rounded-lg object-cover m-4"}
                />
              </Link>
              <div className="p-4">
                <Link to={`/product/${favorite.productId}/productAbout`} className="line-clamp-2 font-semibold hover:text-blue-600">
                  {favorite.productName}
                </Link>
                <p className="mt-1 text-blue-600 font-bold">{formatPrice(favorite.productPrice)}</p>
                <p className="mt-1 text-xs text-gray-500">Đã thêm: {formatDate(favorite.addedAt)}</p>
                <div className="mt-3 flex gap-2">
                  <Link to={`/product/${favorite.productId}/productAbout`} className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white">
                    Xem chi tiết
                  </Link>
                  {!isSharedMode && (
                    <button
                      onClick={() => handleRemoveFavorite(favorite.id, favorite.productName)}
                      className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600"
                      disabled={removingId === favorite.id}
                    >
                      Xóa
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserFavorites;
