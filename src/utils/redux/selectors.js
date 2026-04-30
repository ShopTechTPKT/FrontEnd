import { createSelector } from "@reduxjs/toolkit";

export const selectCartState = (state) => state.cart;
export const selectCartItems = createSelector(
  [selectCartState],
  (cart) => cart?.carts || []
);
export const selectCartSummary = createSelector(
  [selectCartState],
  (cart) => cart?.cartSummary || null
);
export const selectCartTotalItems = createSelector(
  [selectCartItems, selectCartSummary],
  (items, summary) =>
    Number(summary?.totalItems ?? items.reduce((sum, item) => sum + (item.quantity || 0), 0))
);
export const selectCartSubtotal = createSelector([selectCartItems], (items) =>
  items.reduce((sum, item) => sum + (item.unitPrice || item.price || 0) * (item.quantity || 1), 0)
);
