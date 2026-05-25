import React from "react";

/**
 * Discount create/edit form — logic stays in parent (submit, API).
 */
export default function DiscountFormModal({
  editingDiscount,
  formData,
  setFormData,
  products,
  onSubmit,
  onCancel,
}) {
  const inputClass = "admin-input w-full";

  return (
    <div className="admin-modal-overlay" onClick={onCancel} role="presentation">
      <div
        className="admin-modal-panel max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h3 className="text-lg font-bold text-[var(--color-text)] mb-4">
          {editingDiscount ? "Sửa Discount" : "Thêm Discount mới"}
        </h3>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
              Tên Discount
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={inputClass}
              required
            />
          </div>

          <input type="hidden" value="PERCENTAGE" readOnly />

          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
              Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className={inputClass}
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
              Phần trăm giảm (%)
            </label>
            <input
              type="number"
              value={formData.discountRate}
              onChange={(e) =>
                setFormData({ ...formData, discountRate: e.target.value })
              }
              className={inputClass}
              required
              min="0"
              max="1"
              step="0.1"
              placeholder="VD: 0.3 (cho 30%)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
              Sản phẩm
            </label>
            <select
              value={formData.productId}
              onChange={(e) =>
                setFormData({ ...formData, productId: e.target.value })
              }
              className={inputClass}
            >
              <option value="">Tất cả sản phẩm</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                Ngày bắt đầu
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                Ngày kết thúc
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                className={inputClass}
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="discountStatus"
              checked={!!formData.discountStatus}
              onChange={(e) =>
                setFormData({ ...formData, discountStatus: e.target.checked })
              }
              className="w-4 h-4 rounded border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-primary-)] focus:ring-[var(--color-primary-)]"
            />
            <label
              htmlFor="discountStatus"
              className="text-sm font-medium text-[var(--color-text)]"
            >
              Kích hoạt discount
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={onCancel} className="btn-admin-outline">
              Hủy
            </button>
            <button type="submit" className="btn-admin-primary">
              {editingDiscount ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
