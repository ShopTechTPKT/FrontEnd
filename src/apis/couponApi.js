import axiosInstance from "../custom/axios";

export const validateCouponCode = async ({ code, orderTotal }) => {
  const response = await axiosInstance.post("/coupons/validate", {
    code,
    orderTotal,
  });
  return response.data;
};
