import { useState, useEffect, useCallback, useContext } from "react";
import { UserContext } from "../context/UserContext";
import { addFavorite } from "../apis/favoriteApi";

const STORAGE_KEY = "guest_wishlist";

/**
 * useGuestWishlist — Manages a wishlist in localStorage for guests.
 * When the user logs in, syncs items to the server and clears local list.
 */
export default function useGuestWishlist() {
  const { user } = useContext(UserContext);
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // Auto-sync when user logs in
  useEffect(() => {
    if (!user?.id || items.length === 0) return;
    const sync = async () => {
      try {
        for (const productId of items) {
          try { await addFavorite(user.id, productId); } catch { /* skip duplicates */ }
        }
        localStorage.removeItem(STORAGE_KEY);
        setItems([]);
      } catch { /* silent fail */ }
    };
    sync();
  }, [user?.id]);

  const toggle = useCallback((productId) => {
    setItems((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  }, []);

  const isInWishlist = useCallback((productId) => items.includes(productId), [items]);

  return { items, toggle, isInWishlist, count: items.length };
}
