import axiosInstance from "../custom/axios";

export const lookupWarranty = async (code) => {
  const response = await axiosInstance.get("/warranties/lookup", { params: { code } });
  return response.data;
};

export const activateWarranty = async ({ userId, productId, orderId, serialNumber }) => {
  const response = await axiosInstance.post("/warranties/activate", {
    userId,
    productId,
    orderId,
    serialNumber,
  });
  return response.data;
};
