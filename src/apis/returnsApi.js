import axiosInstance from "../custom/axios";

export const createUserReturnRequest = async (payload) => {
  const response = await axiosInstance.post("/returns/user", payload);
  return response.data;
};

export const getUserReturnRequests = async (userId) => {
  const response = await axiosInstance.get(`/returns/user/${userId}`);
  return Array.isArray(response.data) ? response.data : [];
};

export const uploadReturnRequestImages = async (requestId, files) => {
  const formData = new FormData();
  Array.from(files || []).forEach((file) => formData.append("files", file));
  const response = await axiosInstance.post(`/returns/${requestId}/upload-images`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};
