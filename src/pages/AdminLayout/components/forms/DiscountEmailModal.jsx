import React from "react";
import { FaEnvelope } from "react-icons/fa";

/**
 * Gửi mã khuyến mãi qua email — logic gửi API vẫn ở parent (onSend).
 */
export default function DiscountEmailModal({
  discount,
  customers,
  loadingCustomers,
  selectedCustomers,
  showCustomerSelector,
  isSelectAllMode,
  sendingEmail,
  onClose,
  onSelectCustomers,
  onSelectAllCustomers,
  onToggleCustomer,
  onRemoveCustomer,
  onClearSelected,
  onSend,
}) {
  const rateDisplay =
    discount.discountRate <= 1
      ? discount.discountRate * 100
      : discount.discountRate;

  return (
    <div className="admin-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="admin-modal-panel w-full max-w-2xl p-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="discount-email-modal-title"
      >
        <h3
          id="discount-email-modal-title"
          className="text-xl font-bold text-[var(--color-text)] mb-4 flex items-center gap-2"
        >
          <FaEnvelope className="text-[var(--color-primary)]" aria-hidden />
          Gửi Mã Khuyến Mãi Tri Ân
        </h3>

        <div className="mb-4 p-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-muted)]">
          <p className="text-sm font-medium text-[var(--color-text)]">
            <strong>Khuyến mãi:</strong> {discount.name}
          </p>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Giảm giá: {Number(rateDisplay).toFixed(1)}%
          </p>
        </div>

        <div className="space-y-4 mb-4">
          <div className="flex gap-3 flex-wrap">
            <button
              type="button"
              onClick={onSelectCustomers}
              className="flex-1 min-w-[140px] btn-admin-primary py-2.5 inline-flex items-center justify-center gap-2"
            >
              <FaEnvelope aria-hidden />
              Chọn Khách
            </button>
            <button
              type="button"
              onClick={onSelectAllCustomers}
              className="flex-1 min-w-[140px] btn-admin-primary py-2.5 inline-flex items-center justify-center gap-2"
            >
              <FaEnvelope aria-hidden />
              Chọn Tất Cả Khách
            </button>
          </div>

          {selectedCustomers.length > 0 && !isSelectAllMode ? (
            <div className="p-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-[var(--color-text)]">
                  ✓ Đã chọn: <strong>{selectedCustomers.length}</strong> khách hàng
                </p>
                <button
                  type="button"
                  onClick={onClearSelected}
                  className="text-xs text-[var(--color-primary)] hover:underline"
                >
                  Xóa tất cả
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedCustomers.map((email) => {
                  const customer = customers.find((c) => c.email === email);
                  return (
                    <div
                      key={email}
                      className="flex items-center gap-1 px-2 py-1 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] text-xs"
                    >
                      <span className="text-[var(--color-text)]">
                        {customer?.fullName || customer?.name || email}
                      </span>
                      <button
                        type="button"
                        onClick={() => onRemoveCustomer(email)}
                        className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)] ml-1 font-bold"
                        title="Xóa khỏi danh sách"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {showCustomerSelector ? (
            <div className="max-h-96 overflow-y-auto border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 bg-[var(--color-bg-subtle)]">
              {loadingCustomers ? (
                <div className="space-y-3 py-4" aria-busy="true">
                  {[1, 2, 3, 4, 5].map((row) => (
                    <div
                      key={row}
                      className="admin-skeleton h-14 rounded-[var(--radius-md)] border border-[var(--color-border)]"
                    />
                  ))}
                </div>
              ) : customers.length === 0 ? (
                <p className="text-center py-8 text-[var(--color-text-muted)]">
                  Không có khách hàng nào
                </p>
              ) : (
                <div className="space-y-2">
                  {customers.map((customer) => {
                    const isSelected = selectedCustomers.includes(customer.email);
                    return (
                      <label
                        key={customer.id || customer.email}
                        className={`flex items-center gap-3 p-3 rounded-[var(--radius-md)] cursor-pointer transition-colors border ${
                          isSelected
                            ? "border-[var(--color-primary)] bg-[var(--color-primary-subtle)] ring-1 ring-[var(--color-primary)]/30"
                            : "border-[var(--color-border)] hover:bg-[var(--color-bg-muted)]"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleCustomer(customer.email)}
                          className="w-5 h-5 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[var(--color-text)] truncate">
                            {customer.fullName || customer.name || "Khách hàng"}
                          </p>
                          <p className="text-sm text-[var(--color-text-muted)] truncate">
                            {customer.email}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 mt-6 flex-wrap">
          <button
            type="button"
            onClick={onClose}
            className="btn-admin-outline px-4 py-2 rounded-lg"
            disabled={sendingEmail}
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onSend}
            disabled={sendingEmail || selectedCustomers.length === 0}
            className="btn-admin-primary px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {sendingEmail ? (
              <>Đang gửi...</>
            ) : (
              <>
                <FaEnvelope aria-hidden />
                Gửi Email ({selectedCustomers.length})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
