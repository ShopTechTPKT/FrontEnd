import axiosInstance from "../custom/axios";

export const createVnpayPayment = (payload) =>
  axiosInstance.post("/payments/vnpay/create", payload).then((r) => r.data);

export const createMomoPayment = (payload) =>
  axiosInstance.post("/payments/momo/create", payload).then((r) => r.data);

export const createZalopayPayment = (payload) =>
  axiosInstance.post("/payments/zalopay/create", payload).then((r) => r.data);

export const getPaymentTransaction = (transactionId) =>
  axiosInstance.get(`/payments/transactions/${transactionId}`).then((r) => r.data);

export const confirmPaymentTransaction = (transactionId, payload = {}) =>
  axiosInstance
    .post(`/payments/transactions/${transactionId}/confirm`, payload)
    .then((r) => r.data);
