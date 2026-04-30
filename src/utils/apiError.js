export const getApiErrorMessage = (error, fallback = "Đã xảy ra lỗi, vui lòng thử lại.") => {
  if (!error) return fallback;
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};

export const normalizeApiError = (error, fallback) => ({
  status: error?.response?.status || null,
  code: error?.response?.data?.code || null,
  message: getApiErrorMessage(error, fallback),
  raw: error,
});
