import React, { useState, useEffect } from 'react';
import { FaStar, FaRegStar, FaThumbsUp, FaReply, FaFilter, FaSearch, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { fetchReviews, updateReview } from '../../apis/adminApi';
import { useToast } from '../../components/Toast';
import ProductGridSkeleton from '../../components/ui/ProductGridSkeleton';
import StatusNotice from '../../components/ui/StatusNotice';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';

const ReviewsTable = ({ theme }) => {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('all');
  const [selectedReview, setSelectedReview] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const { showSuccess, showError } = useToast();

  // Theme colors
  const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const secondaryTextColor = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';

  useEffect(() => {
    fetchReviewsData();
  }, []);

  const fetchReviewsData = async () => {
    try {
      setLoading(true);
      const data = await fetchReviews();
      console.log('Reviews data:', data);
      setReviews(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError(error.message);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      index < rating ? 
        <FaStar key={index} className="text-yellow-400" /> : 
        <FaRegStar key={index} className="text-gray-300" />
    ));
  };

  const filteredReviews = reviews.filter(review => {
    const matchesRating = filterRating === 'all' || review.rating === parseInt(filterRating);
    const matchesSearch = 
      review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.productId?.toString().includes(searchTerm.toLowerCase());
    return matchesRating && matchesSearch;
  });

  const handleReply = (review) => {
    setSelectedReview(review);
    setReplyText(review.reply || ''); // Nếu có reply sẵn thì load vào
    setShowReplyModal(true);
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim()) {
      showError('Vui lòng nhập nội dung phản hồi', 3000, 'top-right');
      return;
    }

    try {
      setIsSubmittingReply(true);
      // Gọi API update review với reply
      await updateReview(selectedReview.id, {
        ...selectedReview,
        reply: replyText.trim()
      });

      // Cập nhật lại danh sách reviews
      setReviews(reviews.map(review => 
        review.id === selectedReview.id 
          ? { ...review, reply: replyText.trim() }
          : review
      ));

      showSuccess('Đã gửi phản hồi thành công!', 3000, 'top-right');
      setShowReplyModal(false);
      setReplyText('');
    } catch (error) {
      console.error('Error submitting reply:', error);
      showError('Lỗi khi gửi phản hồi: ' + (error.response?.data?.message || error.message), 5000, 'top-right');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleCloseReplyModal = () => {
    setShowReplyModal(false);
    setReplyText('');
    setSelectedReview(null);
  };

  // Delete review disabled in UI; keep stub to avoid unused handler

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className={`p-6 rounded-lg ${cardBg} border ${borderColor}`}>
        <div className="py-4">
          <ProductGridSkeleton count={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-6 rounded-lg ${cardBg} border ${borderColor}`}>
        <h2 className={`text-2xl font-bold ${textColor} mb-2`}>
          {t('admin.reviews_title') || 'Quản lý Reviews'}
        </h2>
        <p className={secondaryTextColor}>
          {t('admin.reviews_subtitle') || 'Quản lý và phản hồi đánh giá sản phẩm'}
        </p>
      </div>

      {error ? (
        <StatusNotice
          tone="error"
          title="Không tải được dữ liệu reviews"
          message={error}
          actionText="Thử lại"
          onAction={fetchReviewsData}
        />
      ) : null}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-4 rounded-lg ${cardBg} border ${borderColor}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${secondaryTextColor}`}>
                {t('admin.reviews_total') || 'Tổng Reviews'}
              </p>
              <p className={`text-2xl font-bold ${textColor}`}>{reviews.length}</p>
            </div>
            <FaStar className="text-violet-600 text-xl" />
          </div>
        </div>

        <div className={`p-4 rounded-lg ${cardBg} border ${borderColor}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${secondaryTextColor}`}>
                {t('admin.reviews_avg') || 'Đánh giá TB'}
              </p>
              <p className={`text-2xl font-bold ${textColor}`}>
                {reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '0.0'}
              </p>
            </div>
            <FaStar className="text-green-600 text-xl" />
          </div>
        </div>

        <div className={`p-4 rounded-lg ${cardBg} border ${borderColor}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${secondaryTextColor}`}>
                {t('admin.reviews_five_star') || 'Reviews 5 sao'}
              </p>
              <p className={`text-2xl font-bold ${textColor}`}>
                {reviews.filter(r => r.rating === 5).length}
              </p>
            </div>
            <FaStar className="text-yellow-600 text-xl" />
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className={`p-4 rounded-lg ${cardBg} border ${borderColor}`}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={
                t('admin.reviews_search_placeholder') ||
                'Tìm kiếm theo nội dung review hoặc Product ID...'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border ${borderColor} rounded-lg focus:border-blue-500 focus:outline-none ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
            />
          </div>
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-600" />
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className={`px-4 py-2 border ${borderColor} rounded-lg focus:border-blue-500 focus:outline-none ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
            >
              <option value="all">{t('admin.filter_all_reviews') || 'Tất cả đánh giá'}</option>
              <option value="5">{t('admin.filter_5_stars') || '5 sao'}</option>
              <option value="4">{t('admin.filter_4_stars') || '4 sao'}</option>
              <option value="3">{t('admin.filter_3_stars') || '3 sao'}</option>
              <option value="2">{t('admin.filter_2_stars') || '2 sao'}</option>
              <option value="1">{t('admin.filter_1_star') || '1 sao'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      <div className={`rounded-lg ${cardBg} border ${borderColor} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <tr>
                <th className={`px-4 py-3 text-left text-xs font-medium ${secondaryTextColor} uppercase tracking-wider`}>
                  {t('admin.review_id_label') || 'ID'}
                </th>
                <th className={`px-4 py-3 text-left text-xs font-medium ${secondaryTextColor} uppercase tracking-wider`}>
                  {t('admin.review_product_id_label') || 'Product ID'}
                </th>
                <th className={`px-4 py-3 text-left text-xs font-medium ${secondaryTextColor} uppercase tracking-wider`}>
                  {t('admin.review_rating_label') || 'Đánh giá'}
                </th>
                <th className={`px-4 py-3 text-left text-xs font-medium ${secondaryTextColor} uppercase tracking-wider`}>
                  {t('admin.review_content_label') || 'Nội dung'}
                </th>
                <th className={`px-4 py-3 text-left text-xs font-medium ${secondaryTextColor} uppercase tracking-wider`}>
                  {t('admin.review_created_at_label') || 'Ngày tạo'}
                </th>
                <th className={`px-4 py-3 text-left text-xs font-medium ${secondaryTextColor} uppercase tracking-wider`}>
                  {t('admin.actions') || 'Thao tác'}
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${borderColor}`}>
              {filteredReviews.map((review) => (
                <tr key={review.id} className={`hover:${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <td className={`px-4 py-4 whitespace-nowrap text-sm ${textColor}`}>
                    #{review.id}
                  </td>
                  <td className={`px-4 py-4 whitespace-nowrap text-sm ${textColor}`}>
                    <span className="font-medium">Product #{review.productId}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      {renderStars(review.rating)}
                      <span className={`ml-2 text-sm ${textColor}`}>({review.rating}/5)</span>
                    </div>
                  </td>
                  <td className={`px-4 py-4 text-sm ${textColor}`}>
                    <div className="max-w-xs truncate">
                      {review.comment || t('admin.no_content') || 'Không có nội dung'}
                    </div>
                  </td>
                  <td className={`px-4 py-4 whitespace-nowrap text-sm ${textColor}`}>
                    {formatDate(review.createdAt)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleReply(review)}
                        variant="ghost"
                        size="sm"
                        icon={<FaReply />}
                      >
                        {t('admin.reply_button') || 'Phản hồi'}
                      </Button>
                      {/* Ẩn nút xóa theo yêu cầu */}
                      {/* <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="text-red-600 hover:text-red-900 flex items-center gap-1"
                      >
                        <FaTrash />
                        Xóa
                      </button> */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredReviews.length === 0 && (
          <div className="text-center py-8">
            <EmptyState
              title={t('admin.no_reviews_found') || 'Không tìm thấy review nào'}
              description={t('admin.try_adjust_filters') || 'Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm'}
              className="py-2"
            />
          </div>
        )}
      </div>

      {/* Reply Modal với backdrop blur */}
      {showReplyModal && selectedReview && (
        <div 
          className="fixed inset-0 backdrop-blur-md bg-opacity-0 flex items-center justify-center z-50"
          onClick={handleCloseReplyModal}
        >
          <div 
            className={`p-6 rounded-lg ${cardBg} border ${borderColor} max-w-2xl w-full mx-4 shadow-2xl`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={`text-xl font-bold ${textColor} mb-4`}>
              {t('admin.reply_review') || 'Phản hồi Review'}
            </h3>
            
            {/* Thông tin review gốc */}
            <div className={`mb-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} border ${borderColor}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className={`text-xs ${secondaryTextColor} mb-1`}>Review ID: #{selectedReview.id} | Product ID: #{selectedReview.productId}</p>
                  <div className="flex items-center gap-2 mb-2">
                    {renderStars(selectedReview.rating)}
                    <span className={`text-sm ${textColor} font-medium`}>({selectedReview.rating}/5)</span>
                  </div>
                </div>
              </div>
              <p className={`text-sm ${textColor} italic`}>
                "{selectedReview.comment || t('admin.no_content') || 'Không có nội dung'}"
              </p>
              {selectedReview.reply && (
                <div className={`mt-3 pt-3 border-t ${borderColor}`}>
                  <p className={`text-xs font-semibold ${secondaryTextColor} mb-1`}>
                    {t('admin.current_reply') || 'Phản hồi hiện tại:'}
                  </p>
                  <p className={`text-sm ${textColor}`}>{selectedReview.reply}</p>
                </div>
              )}
            </div>

            {/* Form phản hồi */}
            <div className="mb-6">
              <label className={`block text-sm font-medium ${textColor} mb-2`}>
                {t('admin.reply_content_label') || 'Nội dung phản hồi'}
              </label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={
                  t('admin.reply_placeholder') || 'Nhập phản hồi của bạn cho bình luận này...'
                }
                rows="5"
                className={`w-full px-4 py-3 border ${borderColor} rounded-lg focus:border-blue-500 focus:outline-none resize-none ${
                  theme === 'dark' ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white text-gray-900 placeholder-gray-500'
                }`}
                disabled={isSubmittingReply}
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <Button
                onClick={handleCloseReplyModal}
                disabled={isSubmittingReply}
                variant="outline"
              >
                {t('common.cancel') || t('admin.cancel') || 'Hủy'}
              </Button>
              <Button
                onClick={handleSubmitReply}
                disabled={isSubmittingReply || !replyText.trim()}
                variant="primary"
              >
                {isSubmittingReply
                  ? t('admin.sending') || 'Đang gửi...'
                  : t('admin.send_reply') || 'Gửi phản hồi'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsTable;
