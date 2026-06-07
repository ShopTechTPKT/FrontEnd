import { useState, useEffect, useContext, useMemo } from "react";
import { UserContext } from "../context/UserContext";
import {
  getUserFavorites,
  toggleFavorite,
  countUserFavorites,
} from "../services/FavoriteServices";
import { getUserByEmail } from "../services/UserServices";

// --- Global Cache / Store for Favorites ---
let globalFavorites = [];
let globalTotalCount = 0;
let globalLoading = false;
let globalError = null;
let globalPromise = null;
let globalUserId = null;

const listeners = new Set();
const notifyListeners = () => {
  listeners.forEach((listener) => listener());
};

/**
 * Custom hook to manage favorites globally without duplicate network queries
 */
export const useFavorites = (productId = null) => {
  const { user } = useContext(UserContext);
  const [, forceUpdate] = useState({});

  // Resolve userId from user context
  let userId = null;
  if (user) {
    userId =
      user.id || user.customerID || user.userId || user.customerId || user.ID;

    if (!userId) {
      const userKeys = Object.keys(user);
      const idKey = userKeys.find(
        (key) =>
          key.toLowerCase().includes("id") &&
          typeof user[key] === "number" &&
          user[key] > 0
      );
      if (idKey) {
        userId = user[idKey];
      }
    }

    if (!userId && user.email) {
      userId = "find_by_email";
    }
  }

  // Resolve userId with fallback strategy
  const resolveUserId = async () => {
    if (!userId) {
      return null;
    }

    if (userId === "find_by_email" && user?.email) {
      try {
        const userData = await getUserByEmail(user.email);
        if (userData && userData.id) {
          return userData.id;
        } else {
          return 8; // Fallback hardcoded userId
        }
      } catch (error) {
        console.error("Error finding user by email:", error);
        return 8; // Fallback
      }
    } else if (userId !== "find_by_email") {
      return userId;
    }

    return null;
  };

  // Subscribe to changes in global favorites state
  useEffect(() => {
    const handleChange = () => {
      forceUpdate({});
    };
    listeners.add(handleChange);
    return () => {
      listeners.delete(handleChange);
    };
  }, []);

  // Fetch function using global cache
  const fetchFavorites = async (forceRefetch = false) => {
    const actualUserId = await resolveUserId();

    if (!actualUserId) {
      globalFavorites = [];
      globalTotalCount = 0;
      globalLoading = false;
      globalError = null;
      globalPromise = null;
      globalUserId = null;
      notifyListeners();
      return;
    }

    // Reset cache if userId changed
    if (globalUserId !== actualUserId) {
      globalUserId = actualUserId;
      globalFavorites = [];
      globalTotalCount = 0;
      globalPromise = null;
    }

    if (globalPromise && !forceRefetch) {
      return globalPromise;
    }

    globalLoading = true;
    notifyListeners();

    globalPromise = (async () => {
      try {
        const [favoritesData, countData] = await Promise.all([
          getUserFavorites(actualUserId),
          countUserFavorites(actualUserId),
        ]);
        globalFavorites = favoritesData || [];
        globalTotalCount = countData || 0;
        globalError = null;
      } catch (err) {
        console.error("Error fetching favorites in cache:", err);
        globalError = err.message;
        globalFavorites = [];
        globalTotalCount = 0;
      } finally {
        globalLoading = false;
        notifyListeners();
      }
    })();

    return globalPromise;
  };

  // Toggle favorite
  const handleToggleFavorite = async (targetProductId = productId) => {
    if (!targetProductId) {
      throw new Error("Không tìm thấy thông tin sản phẩm");
    }

    const actualUserId = await resolveUserId();
    if (!actualUserId) {
      throw new Error("Vui lòng đăng nhập để sử dụng tính năng yêu thích");
    }

    globalLoading = true;
    notifyListeners();

    try {
      const newFavoriteStatus = await toggleFavorite(
        actualUserId,
        targetProductId
      );

      // Force a refetch to update all components sharing the cache
      await fetchFavorites(true);

      return newFavoriteStatus;
    } catch (err) {
      console.error("Error toggling favorite:", err);
      throw err;
    } finally {
      globalLoading = false;
      notifyListeners();
    }
  };

  // Check favorite status - now computed synchronously in-memory
  const isFavorited = useMemo(() => {
    if (!productId) return false;
    return globalFavorites.some((fav) => fav.productId === productId);
  }, [productId, globalFavorites]);

  // Refresh function
  const refreshFavorites = async () => {
    await fetchFavorites(true);
  };

  // Trigger initial fetch when hook mount / userId change
  useEffect(() => {
    if (userId) {
      fetchFavorites();
    } else {
      globalFavorites = [];
      globalTotalCount = 0;
      globalLoading = false;
      globalError = null;
      globalPromise = null;
      globalUserId = null;
      notifyListeners();
    }
  }, [userId]);

  return {
    favorites: globalFavorites,
    isFavorited,
    loading: globalLoading,
    error: globalError,
    totalCount: globalTotalCount,
    userId: globalUserId || userId,

    fetchFavorites,
    handleToggleFavorite,
    refreshFavorites,
    checkProductFavoriteStatus: () => Promise.resolve(), // Keep signature for compatibility
  };
};