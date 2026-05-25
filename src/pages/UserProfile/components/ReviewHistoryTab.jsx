import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import axiosInstance from "../../../custom/axios";
import { toast } from "react-toastify";

const ReviewHistoryTab = ({ userId }) => {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for editing
  const [editingId, setEditingId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const { data } = await axiosInstance.get(`/reviews/user/${userId}`);
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews([]); // Xóa fallback mock data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [userId]);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) return;
    try {
      await axiosInstance.delete(`/reviews/${id}`);
      toast.success("Đã xóa đánh giá");
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Không thể xóa đánh giá");
    }
  };

  const handleEditClick = (review) => {
    setEditingId(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment || "");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (id) => {
    try {
      setSubmitting(true);
      const { data } = await axiosInstance.put(`/reviews/${id}`, {
        rating: editRating,
        comment: editComment
      });
      toast.success("Đã cập nhật đánh giá");
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, rating: data.rating, comment: data.comment } : r))
      );
      setEditingId(null);
    } catch (error) {
      console.error("Error updating review:", error);
      toast.error("Không thể cập nhật đánh giá");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating, interactive = false, setRating = null) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg 
          key={star} 
          onClick={() => interactive && setRating && setRating(star)}
          className={`w-5 h-5 ${interactive ? 'cursor-pointer' : ''} ${star <= rating ? "text-amber-400" : "text-[var(--color-border)]"} transition-colors`} 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );

  if (loading) return <div className="profile-card p-8 text-center"><div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto" /></div>;

  return (
    <div className="profile-card animate-fadeInUp">
      <div className="profile-card-header">
        <h2 className="profile-card-title">Lịch sử đánh giá</h2>
        <span className="text-sm text-[var(--color-text-muted)]">{reviews.length} đánh giá</span>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--color-bg-muted)] flex items-center justify-center text-3xl">⭐</div>
          <p className="text-sm text-[var(--color-text-muted)] mb-2">Bạn chưa đánh giá sản phẩm nào</p>
          <p className="text-xs text-[var(--color-text-muted)]">Hãy mua hàng và chia sẻ trải nghiệm!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="p-4 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-primary-300)] transition-all">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <p className="font-semibold text-sm text-[var(--color-text)]">{review.productName || `Sản phẩm #${review.productId}`}</p>
                  
                  {editingId !== review.id ? (
                    <div className="flex items-center gap-2 mt-1">
                      {renderStars(review.rating)}
                      <span className="text-xs text-[var(--color-text-muted)]">
                        {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  ) : null}
                </div>
                
                {/* Hành động sửa / xóa */}
                {editingId !== review.id && (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleEditClick(review)}
                      className="text-xs font-medium text-blue-500 hover:text-blue-600 transition-colors"
                    >
                      Sửa
                    </button>
                    <button 
                      onClick={() => handleDelete(review.id)}
                      className="text-xs font-medium text-red-500 hover:text-red-600 transition-colors"
                    >
                      Xóa
                    </button>
                  </div>
                )}
              </div>
              
              {editingId === review.id ? (
                <div className="mt-3 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium">Đánh giá của bạn:</span>
                    {renderStars(editRating, true, setEditRating)}
                  </div>
                  <textarea
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md p-2 text-sm min-h-[80px] focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                  />
                  <div className="mt-3 flex justify-end gap-2">
                    <button 
                      onClick={handleCancelEdit}
                      disabled={submitting}
                      className="px-3 py-1.5 text-xs font-medium bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md transition-colors"
                    >
                      Hủy
                    </button>
                    <button 
                      onClick={() => handleSaveEdit(review.id)}
                      disabled={submitting || (!editComment.trim() && editRating === 0)}
                      className="px-3 py-1.5 text-xs font-medium bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors disabled:opacity-50"
                    >
                      {submitting ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                  </div>
                </div>
              ) : (
                review.comment && (
                  <p className="text-sm text-[var(--color-text-secondary)] mt-2 leading-relaxed">{review.comment}</p>
                )
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewHistoryTab;
