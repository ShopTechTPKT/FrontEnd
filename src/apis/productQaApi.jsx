import axiosInstance from "../custom/axios";

export async function getQuestionsByProduct(productId) {
  try {
    const res = await axiosInstance.get(`/products/${productId}/questions`);
    const data = Array.isArray(res?.data) ? res.data : [];
    return { EC: 1, DT: data };
  } catch (error) {
    console.error("Lỗi khi lấy Q&A theo sản phẩm:", error);
    return { EC: 0, DT: [] };
  }
}

export async function createQuestion(productId, payload) {
  try {
    const res = await axiosInstance.post(`/products/${productId}/questions`, payload);
    return res.data;
  } catch (error) {
    console.error("Lỗi khi tạo câu hỏi:", error.response || error);
    return { EC: 0, EM: "Error", DT: null };
  }
}

export async function createAnswer(questionId, payload) {
  try {
    const res = await axiosInstance.post(`/questions/${questionId}/answers`, payload);
    return res.data;
  } catch (error) {
    console.error("Lỗi khi tạo câu trả lời:", error.response || error);
    return { EC: 0, EM: "Error", DT: null };
  }
}

export async function likeAnswer(answerId) {
  try {
    const res = await axiosInstance.post(`/answers/${answerId}/like`);
    return res.data;
  } catch (error) {
    console.error("Lỗi khi like câu trả lời:", error.response || error);
    return { EC: 0, EM: "Error", DT: null };
  }
}

export default {
  getQuestionsByProduct,
  createQuestion,
  createAnswer,
  likeAnswer,
};

