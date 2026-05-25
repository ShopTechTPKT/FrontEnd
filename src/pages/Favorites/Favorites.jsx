import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getFavoritesByUser, removeFavorite, countFavoritesByUser } from "../../apis/favoriteApi";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ProductCard from "../../components/product/ProductCard";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import ProductGridSkeleton from "../../components/ui/ProductGridSkeleton";
import StatusNotice from "../../components/ui/StatusNotice";

const IcHeart = ({ filled = false, className = "w-5 h-5" }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
);

const Favorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [loadError, setLoadError] = useState("");

  const getCurrentUserId = () => {
    try {
      const savedUser = localStorage.getItem("user");
      if (!savedUser) return null;
      const parsed = JSON.parse(savedUser);
      return parsed?.customerID ?? parsed?.id ?? parsed?.customerId ?? null;
    } catch {
      return null;
    }
  };

  const userId = getCurrentUserId();

  useEffect(() => {
    if (userId) {
      fetchFavorites();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setLoadError("");
      const [data, count] = await Promise.all([
        getFavoritesByUser(userId),
        countFavoritesByUser(userId)
      ]);
      setFavorites(data || []);
      setFavoriteCount(count || 0);
    } catch {
      toast.error("Cannot load favorites");
      setLoadError("Không load được danh sách yêu thích. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (productId) => {
    try {
      await removeFavorite(userId, productId);
      setFavorites(favorites.filter((fav) => fav.productId !== productId));
      toast.success("Removed from favorites");
    } catch {
      toast.error("Cannot remove");
    }
  };

  if (!userId) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 bg-[var(--color-primary-)] border-2 border-[var(--color-primary-)] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <IcHeart filled className="w-8 h-8 text-[var(--color-primary-)]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Please login</h2>
          <p className="text-gray-500 mb-6">You need to login to view favorites</p>
          <Button onClick={() => navigate("/login")} variant="primary" size="lg">
            Login now
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const convertFavoriteToProduct = (favorite) => ({
    productID: favorite.productId,
    productName: favorite.productName,
    price: favorite.productPrice,
    image: favorite.productImageUrl,
    inStock: true,
  });

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-900 py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[var(--color-primary-)] rounded-2xl flex items-center justify-center shadow-lg">
              <IcHeart filled className="text-white w-7 h-7" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Favorite Products</h1>
              <p className="text-[var(--color-primary-)] text-lg">{favoriteCount} products saved</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {loadError ? (
          <div className="mb-6">
            <StatusNotice
              tone="warning"
              title="Mất kết nối dữ liệu"
              message={loadError}
              actionText="Thử lại"
              onAction={fetchFavorites}
            />
          </div>
        ) : null}

        {loading ? (
          <div className="py-6">
            <ProductGridSkeleton count={8} />
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-32">
            <EmptyState
              title="No favorite products yet"
              description="Start adding products to your favorites"
              className="py-0"
            />
            <div className="mt-8">
              <Button
              onClick={() => navigate("/products")}
              variant="primary"
              size="lg"
            >
                Explore Products
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {favorites.map((favorite) => (
              <div key={favorite.id} className="relative group">
                <button
                  onClick={() => handleRemoveFavorite(favorite.productId)}
                  className="absolute top-2 right-2 z-20 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all"
                  title="Remove from favorites"
                >
                  <IcHeart filled className="text-red-500 w-4 h-4" />
                </button>
                <ProductCard product={convertFavoriteToProduct(favorite)} />
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Favorites;