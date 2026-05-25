import React, { useState, useEffect, useMemo } from "react";
import { FaStar, FaRegStar, FaReply, FaFilter, FaSearch, FaUserCircle } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { fetchReviews, updateReview } from "../../apis/adminApi";
import { useToast } from "../../components/Toast";
import StatusNotice from "../../components/ui/StatusNotice";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import ProductTableLayout from "./components/products/ProductTableLayout";
import ReviewReplyModal from "./components/forms/ReviewReplyModal";
import Pagination from "../../components/ui/Pagination";
import TableSortHeader from "../../components/ui/TableSortHeader";

const ReviewsTable = () => {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRating, setFilterRating] = useState("all");
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  const [selectedReview, setSelectedReview] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchReviewsData();
  }, []);

  const fetchReviewsData = async () => {
    try {
      setLoading(true);
      const data = await fetchReviews();
      setReviews(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError(err.message);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) =>
      index < rating ? (
        <FaStar key={index} className="text-amber-400 drop-shadow-sm" />
      ) : (
        <FaRegStar key={index} className="text-[var(--color-text-muted)] opacity-50" />
      ),
    );
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const matchesRating = filterRating === "all" || review.rating === parseInt(filterRating, 10);
      const matchesSearch =
        (review.comment && review.comment.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (review.productId && review.productId.toString().includes(searchTerm.toLowerCase()));
      return matchesRating && matchesSearch;
    });
  }, [reviews, filterRating, searchTerm]);

  const sortedReviews = useMemo(() => {
    const sortable = [...filteredReviews];
    if (sortConfig.key) {
      sortable.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        
        if (sortConfig.key === 'createdAt') {
          aVal = new Date(aVal).getTime();
          bVal = new Date(bVal).getTime();
        }
        
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [filteredReviews, sortConfig]);

  const paginatedReviews = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedReviews.slice(start, start + itemsPerPage);
  }, [sortedReviews, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterRating, itemsPerPage]);

  const handleReply = (review) => {
    setSelectedReview(review);
    setReplyText(review.reply || "");
    setShowReplyModal(true);
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim()) {
      showError("Vui lòng nhập nội dung phản hồi", 3000, "top-right");
      return;
    }

    try {
      setIsSubmittingReply(true);
      await updateReview(selectedReview.id, {
        ...selectedReview,
        reply: replyText.trim(),
      });

      setReviews(
        reviews.map((review) =>
          review.id === selectedReview.id
            ? { ...review, reply: replyText.trim() }
            : review,
        ),
      );

      showSuccess("Đã gửi phản hồi thành công!", 3000, "top-right");
      setShowReplyModal(false);
      setReplyText("");
    } catch (err) {
      console.error("Error submitting reply:", err);
      showError(
        "Lỗi khi gửi phản hồi: " + (err.response?.data?.message || err.message),
        5000,
        "top-right",
      );
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleCloseReplyModal = () => {
    setShowReplyModal(false);
    setReplyText("");
    setSelectedReview(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const calculateRatingStats = () => {
    if (reviews.length === 0) return { avg: 0, dist: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;
    reviews.forEach(r => {
      if (dist[r.rating] !== undefined) dist[r.rating]++;
      sum += r.rating;
    });
    return { avg: (sum / reviews.length).toFixed(1), dist };
  };

  const stats = calculateRatingStats();

  const toolbar = (
    <>
      <div className="relative flex-1 min-w-[min(100%,18rem)] max-w-xl">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
        <input
          type="text"
          placeholder={t("admin.reviews_search_placeholder") || "Tìm theo nội dung review hoặc Product ID..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="admin-input w-full pl-10 py-2 text-sm"
        />
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <FaFilter className="text-[var(--color-text-muted)] shrink-0" />
        <select
          value={filterRating}
          onChange={(e) => setFilterRating(e.target.value)}
          className="admin-input py-2 text-sm min-w-[10rem]"
        >
          <option value="all">Tất cả đánh giá</option>
          <option value="5">5 sao</option>
          <option value="4">4 sao</option>
          <option value="3">3 sao</option>
          <option value="2">2 sao</option>
          <option value="1">1 sao</option>
        </select>
      </div>
    </>
  );

  return (
    <div className="space-y-6 animate-pageIn">
      <ProductTableLayout 
        title={t("admin.reviews_title") || "Quản lý Đánh Giá"}
        subtitle={t("admin.reviews_subtitle") || "Kiểm duyệt, theo dõi và phản hồi đánh giá của khách hàng"}
        itemCount={reviews.length}
        toolbar={toolbar}
      >
        {error && (
          <div className="mb-6">
            <StatusNotice
              tone="error"
              title="Không tải được dữ liệu reviews"
              message={error}
              actionText="Thử lại"
              onAction={fetchReviewsData}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="admin-card p-6 flex items-center justify-between col-span-1 lg:col-span-1 rounded-[var(--radius-xl)] bg-gradient-to-br from-[var(--color-bg)] to-[var(--color-bg-subtle)]">
            <div>
              <p className="text-sm text-[var(--color-text-secondary)] font-medium mb-1">Điểm trung bình</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-[var(--color-text)]">{stats.avg}</span>
                <span className="text-lg text-[var(--color-text-muted)] font-medium">/ 5</span>
              </div>
              <div className="flex items-center gap-1 mt-2">
                {renderStars(Math.round(stats.avg))}
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mt-2">Dựa trên {reviews.length} lượt đánh giá</p>
            </div>
            <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-500 flex items-center justify-center border-4 border-amber-50 dark:border-amber-900/10 shadow-inner">
              <FaStar className="text-4xl" />
            </div>
          </div>

          <div className="admin-card p-6 col-span-1 lg:col-span-2 rounded-[var(--radius-xl)] bg-[var(--color-bg)]">
            <h3 className="text-sm font-semibold text-[var(--color-text)] mb-4">Phân bố đánh giá</h3>
            <div className="space-y-2.5">
              {[5, 4, 3, 2, 1].map(star => {
                const count = stats.dist[star] || 0;
                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-1 w-12 shrink-0 font-medium text-[var(--color-text-secondary)]">
                      {star} <FaStar className="text-amber-400 text-[10px]" />
                    </div>
                    <div className="flex-1 h-2.5 bg-[var(--color-bg-muted)] rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${star >= 4 ? 'bg-emerald-500' : star === 3 ? 'bg-amber-400' : 'bg-red-500'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="w-10 text-right text-[var(--color-text-muted)] tabular-nums text-xs font-semibold">
                      {count}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 py-2" aria-busy="true">
            {[1, 2, 3, 4, 5, 6].map((row) => (
              <div key={row} className="admin-skeleton h-16 rounded-xl border border-[var(--color-border)]" />
            ))}
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-[var(--color-border)] rounded-2xl bg-[var(--color-bg-subtle)]">
            <EmptyState
              title={t("admin.no_reviews_found") || "Không tìm thấy review nào"}
              description={t("admin.try_adjust_filters") || "Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm"}
              className="py-2"
            />
          </div>
        ) : (
          <div className="flex flex-col rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="admin-table w-full">
                <thead>
                  <tr>
                    <th className="w-16 text-center">User</th>
                    <TableSortHeader label="Sản phẩm" sortKey="productId" currentSort={sortConfig} onSort={handleSort} />
                    <TableSortHeader label="Đánh giá" sortKey="rating" currentSort={sortConfig} onSort={handleSort} />
                    <TableSortHeader label="Nội dung review" sortKey="comment" currentSort={sortConfig} onSort={handleSort} />
                    <TableSortHeader label="Thời gian" sortKey="createdAt" currentSort={sortConfig} onSort={handleSort} />
                    <th className="text-right pr-6">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedReviews.map((review) => (
                    <tr key={review.id} className="admin-table-row">
                      <td className="w-16 text-center pl-4 py-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--color-bg-muted)] border border-[var(--color-border)] text-[var(--color-text-muted)] flex items-center justify-center mx-auto">
                          <FaUserCircle size={28} className="opacity-50" />
                        </div>
                      </td>
                      <td>
                        <div className="font-semibold text-[var(--color-text)]">Product #{review.productId}</div>
                        <div className="text-[10px] text-[var(--color-text-muted)] font-mono uppercase">Rev ID: {review.id}</div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5 bg-[var(--color-bg-subtle)] w-fit px-2 py-1 rounded-lg border border-[var(--color-border)]">
                          {renderStars(review.rating)}
                          <span className="ml-1 text-xs font-bold text-[var(--color-text)]">
                            {review.rating}.0
                          </span>
                        </div>
                      </td>
                      <td className="max-w-xs">
                        <div className="text-sm text-[var(--color-text)] font-medium line-clamp-2">
                          {review.comment || <span className="text-[var(--color-text-muted)] italic">Không có nội dung</span>}
                        </div>
                        {review.reply && (
                          <div className="mt-2 text-xs bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 p-2 rounded border border-indigo-100 dark:border-indigo-800 line-clamp-1 flex items-center gap-1.5">
                            <FaReply className="shrink-0" />
                            {review.reply}
                          </div>
                        )}
                      </td>
                      <td className="text-xs text-[var(--color-text-secondary)]">
                        {formatDate(review.createdAt)}
                      </td>
                      <td className="text-right pr-6">
                        <Button
                          onClick={() => handleReply(review)}
                          variant={review.reply ? "ghost" : "primary"}
                          size="sm"
                          icon={<FaReply />}
                        >
                          {review.reply ? "Sửa phản hồi" : "Phản hồi ngay"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredReviews.length / itemsPerPage)}
              totalItems={filteredReviews.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>
        )}
      </ProductTableLayout>

      {showReplyModal && selectedReview && (
        <ReviewReplyModal
          selectedReview={selectedReview}
          replyText={replyText}
          onReplyChange={setReplyText}
          isSubmittingReply={isSubmittingReply}
          onClose={handleCloseReplyModal}
          onSubmit={handleSubmitReply}
        />
      )}
    </div>
  );
};

export default ReviewsTable;
