/**
 * Read the current user ID from localStorage.
 * Returns null if not logged in or data is corrupt.
 * @returns {number|null}
 */
export const getCurrentUserId = () => {
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

export default getCurrentUserId;
