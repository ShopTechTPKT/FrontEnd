/**
 * Format a number as Vietnamese currency (VND).
 * @param {number} value — The amount in VND
 * @returns {string} Formatted string, e.g. "1.500.000 ₫"
 */
export const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value ?? 0);

export default formatCurrency;
