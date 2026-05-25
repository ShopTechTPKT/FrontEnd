import React from "react";
import { FaStar, FaRegStar } from "react-icons/fa";
import { useTranslation } from "react-i18next";

function renderStars(rating) {
  const r = Number(rating) || 0;
  return [...Array(5)].map((_, index) =>
    index < r ? (
      <FaStar key={index} className="text-amber-400" />
    ) : (
      <FaRegStar key={index} className="text-[var(--color-text-muted)]" />
    ),
  );
}

/**
 * Admin reply modal for a single review — logic stays in parent.
 */
export default function ReviewReplyModal({
  selectedReview,
  replyText,
  onReplyChange,
  isSubmittingReply,
  onClose,
  onSubmit,
}) {
  const { t } = useTranslation();

  if (!selectedReview) return null;

  return (
    <div className="admin-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="admin-modal-panel max-w-2xl w-full mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h3 className="text-xl font-bold text-[var(--color-text)] mb-4">
          {t("admin.reply_review") || "Phản hồi Review"}
        </h3>

        <div className="mb-6 p-4 rounded-[var(--radius-lg)] bg-[var(--color-bg-muted)] border border-[var(--color-border)]">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs text-[var(--color-text-muted)] mb-1">
                Review ID: #{selectedReview.id} | Product ID: #
                {selectedReview.productId}
              </p>
              <div className="flex items-center gap-2 mb-2">
                {renderStars(selectedReview.rating)}
                <span className="text-sm text-[var(--color-text)] font-medium tabular-nums">
                  ({selectedReview.rating}/5)
                </span>
              </div>
            </div>
          </div>
          <p className="text-sm text-[var(--color-text)] italic">
            &quot;
            {selectedReview.comment ||
              t("admin.no_content") ||
              "Không có nội dung"}
            &quot;
          </p>
          {selectedReview.reply ? (
            <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
              <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-1">
                {t("admin.current_reply") || "Phản hồi hiện tại:"}
              </p>
              <p className="text-sm text-[var(--color-text)]">{selectedReview.reply}</p>
            </div>
          ) : null}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
            {t("admin.reply_content_label") || "Nội dung phản hồi"}
          </label>
          <textarea
            value={replyText}
            onChange={(e) => onReplyChange(e.target.value)}
            placeholder={
              t("admin.reply_placeholder") ||
              "Nhập phản hồi của bạn cho bình luận này..."
            }
            rows={5}
            className="admin-input w-full min-h-[8rem] resize-none"
            disabled={isSubmittingReply}
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmittingReply}
            className="btn-admin-outline"
          >
            {t("common.cancel") || t("admin.cancel") || "Hủy"}
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmittingReply || !replyText.trim()}
            className="btn-admin-primary disabled:opacity-50 disabled:pointer-events-none"
          >
            {isSubmittingReply
              ? t("admin.sending") || "Đang gửi..."
              : t("admin.send_reply") || "Gửi phản hồi"}
          </button>
        </div>
      </div>
    </div>
  );
}
