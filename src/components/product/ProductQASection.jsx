import { useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { UserContext } from "../../context/UserContext";
import { createAnswer, createQuestion, likeAnswer, getQuestionsByProduct } from "../../apis/productQaApi.jsx";

const getInitial = (name) => {
  if (!name) return "A";
  return name.trim().charAt(0).toUpperCase();
};

export default function ProductQASection({ productId }) {
  const { t } = useTranslation();
  const { user, getUserRole } = useContext(UserContext);

  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [answeringQuestionId, setAnsweringQuestionId] = useState(null);
  const [newAnswer, setNewAnswer] = useState("");

  const role = useMemo(() => getUserRole?.() ?? null, [getUserRole]);
  const isStaff = role === "admin" || role === "customer_service";

  useEffect(() => {
    if (!productId) return;

    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const res = await getQuestionsByProduct(productId);
        if (res.EC === 1 && Array.isArray(res.DT)) {
          setQuestions(res.DT);
        } else {
          setQuestions([]);
        }
      } catch (e) {
        console.error(e);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [productId]);

  const handleAskQuestion = async () => {
    if (!user) {
      toast.warning(t("product.login_required_to_ask") || "Vui lòng đăng nhập để đặt câu hỏi");
      return;
    }
    if (!newQuestion.trim()) {
      toast.info(t("product.question_required") || "Bạn chưa nhập nội dung câu hỏi");
      return;
    }

    try {
      const payload = {
        userId: user.id || user.customerID || user.customerId,
        content: newQuestion.trim(),
      };
      const res = await createQuestion(productId, payload);

      if (res && res.id) {
        setQuestions((prev) => [res, ...prev]);
        setNewQuestion("");
        toast.success(t("product.question_sent") || "Đã gửi câu hỏi, shop sẽ trả lời sớm nhất.");
      } else {
        toast.error(t("product.question_error") || "Không gửi được câu hỏi. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error(error);
      toast.error(t("product.question_error") || "Không gửi được câu hỏi. Vui lòng thử lại.");
    }
  };

  const handleOpenAnswerBox = (questionId) => {
    if (!isStaff) {
      toast.info(t("product.staff_only_answer") || "Chỉ nhân viên Shop mới có thể trả lời chính thức.");
      return;
    }
    setAnsweringQuestionId(questionId);
    setNewAnswer("");
  };

  const handleSubmitAnswer = async () => {
    if (!answeringQuestionId || !newAnswer.trim()) {
      return;
    }
    if (!user) {
      toast.warning(t("product.login_required_to_answer") || "Vui lòng đăng nhập để trả lời.");
      return;
    }

    try {
      const payload = {
        userId: user.id || user.customerID || user.customerId,
        content: newAnswer.trim(),
        official: true,
      };
      const res = await createAnswer(answeringQuestionId, payload);

      if (res && res.id) {
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === answeringQuestionId
              ? { ...q, status: "ANSWERED", answers: [...(q.answers || []), res] }
              : q
          )
        );
        setAnsweringQuestionId(null);
        setNewAnswer("");
        toast.success(t("product.answer_sent") || "Đã gửi câu trả lời chính thức.");
      } else {
        toast.error(t("product.answer_error") || "Không gửi được câu trả lời. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error(error);
      toast.error(t("product.answer_error") || "Không gửi được câu trả lời. Vui lòng thử lại.");
    }
  };

  const handleLikeAnswer = async (questionId, answerId) => {
    try {
      const res = await likeAnswer(answerId);
      if (res && res.id) {
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === questionId
              ? {
                  ...q,
                  answers: (q.answers || []).map((a) =>
                    a.id === answerId ? { ...a, likeCount: res.likeCount } : a
                  ),
                }
              : q
          )
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-5">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3">
          Hỏi đáp về sản phẩm
        </h3>
        {isStaff ? (
          <p className="text-xs md:text-sm text-gray-600">
            Bạn đang đăng nhập với vai trò <span className="font-semibold">nhân viên / staff</span>. 
            Khách hàng sẽ gửi câu hỏi tại đây, và bạn có thể chọn từng câu bên dưới để trả lời với badge 
            <span className="font-semibold text-violet-700"> “Câu trả lời từ Shop”</span>.
          </p>
        ) : (
          <>
            <p className="text-xs md:text-sm text-gray-500 mb-3">
              Đặt câu hỏi để được đội ngũ Shop Tech tư vấn rõ hơn trước khi mua.
            </p>
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <textarea
                rows={2}
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Bạn đang thắc mắc điều gì về sản phẩm này?"
                className="flex-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-violet-600 focus:border-violet-600 bg-gray-50"
              />
              <button
                type="button"
                onClick={handleAskQuestion}
            className="w-full md:w-auto px-4 py-2.5 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-violet-700 to-violet-600 shadow-sm hover:shadow-md hover:opacity-90 transition-all"
              >
                Gửi câu hỏi
              </button>
            </div>
          </>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm md:text-base font-semibold text-gray-900">
            {questions.length} câu hỏi từ khách hàng
          </h4>
          {loading && (
            <span className="text-xs text-gray-400">
              Đang tải...
            </span>
          )}
        </div>

        {questions.length === 0 && !loading && (
          <p className="text-sm text-gray-500">
            Chưa có câu hỏi nào. Hãy là người đầu tiên đặt câu hỏi cho sản phẩm này.
          </p>
        )}

        <div className="space-y-4">
          {questions.map((q) => (
            <div
              key={q.id}
              className="border border-gray-100 rounded-lg p-3 md:p-4 bg-gray-50"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sm font-semibold text-violet-800">
                  {getInitial(q.userFullName)}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-800">
                      {q.userFullName || "Khách hàng"}
                    </span>
                    <span className="text-[11px] uppercase tracking-wide text-violet-700 bg-sky-50 px-2 py-0.5 rounded-full">
                      Hỏi
                    </span>
                    {q.status === "ANSWERED" && (
                      <span className="text-[11px] text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                        Đã được trả lời
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-800 mb-2">
                    {q.content}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {q.createdAt ? new Date(q.createdAt).toLocaleString("vi-VN") : ""}
                  </p>

                  <div className="mt-3 space-y-3">
                    {(q.answers || []).map((a) => (
                      <div
                        key={a.id}
                        className={`border-l-2 pl-3 md:pl-4 py-2 rounded-r-lg ${
                          a.official
                            ? "border-violet-600 bg-sky-50"
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-gray-900">
                            {a.userFullName || (a.official ? "Shop Tech" : "Người dùng")}
                          </span>
                          {a.official && (
                            <span className="text-[11px] text-violet-800 bg-sky-100 px-2 py-0.5 rounded-full">
                              Câu trả lời từ Shop
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-800 mb-1">
                          {a.content}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] text-gray-400">
                            {a.createdAt ? new Date(a.createdAt).toLocaleString("vi-VN") : ""}
                          </p>
                          <button
                            type="button"
                            className="text-[11px] text-violet-700 hover:text-violet-800 font-medium"
                            onClick={() => handleLikeAnswer(q.id, a.id)}
                          >
                            Thích ({a.likeCount ?? 0})
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {isStaff && (
                    <div className="mt-3">
                      {answeringQuestionId === q.id ? (
                        <div className="space-y-2">
                          <textarea
                            rows={2}
                            value={newAnswer}
                            onChange={(e) => setNewAnswer(e.target.value)}
                            placeholder="Nhập câu trả lời chính thức từ Shop..."
                            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-violet-600 focus:border-violet-600 bg-white"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleSubmitAnswer}
                              className="px-3 py-1.5 text-xs font-semibold text-white rounded-lg bg-gradient-to-r from-violet-700 to-violet-600 hover:opacity-90 transition-all"
                            >
                              Gửi trả lời
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setAnsweringQuestionId(null);
                                setNewAnswer("");
                              }}
                              className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700"
                            >
                              Hủy
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenAnswerBox(q.id)}
                          className="mt-2 text-xs font-medium text-violet-700 hover:text-violet-800"
                        >
                          Trả lời với tư cách Shop
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

