import axiosInstance from "../custom/axios";

export const purchaseGiftCard = async ({ senderUserId, amount, recipientEmail, message }) => {
  const response = await axiosInstance.post("/gift-cards/purchase", {
    senderUserId,
    amount,
    recipientEmail,
    message,
  });
  return response.data;
};

export const redeemGiftCard = async ({ userId, code }) => {
  const response = await axiosInstance.post("/gift-cards/redeem", { userId, code });
  return response.data;
};

export const getSentGiftCards = async (userId) => {
  const response = await axiosInstance.get(`/gift-cards/sent/${userId}`);
  return Array.isArray(response.data) ? response.data : [];
};

export const getReceivedGiftCards = async (userId) => {
  const response = await axiosInstance.get(`/gift-cards/received/${userId}`);
  return Array.isArray(response.data) ? response.data : [];
};

export const getAllGiftCardsForAdmin = async () => {
  const response = await axiosInstance.get("/gift-cards/admin/all");
  return Array.isArray(response.data) ? response.data : [];
};
