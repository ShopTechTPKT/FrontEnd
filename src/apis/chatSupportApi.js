import axiosInstance from "../custom/axios";

export const fetchCannedResponses = () =>
  axiosInstance.get("/chats/canned-responses").then((r) => r.data);

export const addCannedResponse = (payload) =>
  axiosInstance.post("/chats/canned-responses", payload).then((r) => r.data);

export const rateChatSession = (sessionId, rating) =>
  axiosInstance.post(`/chats/${sessionId}/rating`, { rating }).then((r) => r.data);
