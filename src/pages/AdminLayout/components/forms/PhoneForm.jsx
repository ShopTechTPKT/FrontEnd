import React, { useState } from "react";
import { useTranslation } from "react-i18next";

export const CATEGORY_BRAND_MAPPING_PHONE = {
  52: "iPhone",
  53: "Samsung",
  54: "Xiaomi",
};

export default function PhoneForm({
  phone = {},
  onSave,
  onCancel,
  formTitle,
  validCategoryIds = [52, 53, 54],
}) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: phone?.name || "",
    description: phone?.description || "",
    unitPrice: phone?.unitPrice || "",
    quantity: phone?.quantity || "",
    categoryId: phone?.categoryId || "",
    imageUrl: phone?.imageUrl || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "unitPrice" || name === "quantity"
          ? parseFloat(value) || value
          : name === "categoryId"
            ? value === ""
              ? ""
              : parseInt(value, 10)
            : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSave(formData);
    } catch (err) {
      console.error(err);
    }
  };

  const field = "admin-input w-full";

  return (
    <div className="admin-modal-overlay" role="presentation" onClick={onCancel}>
      <div
        className="admin-modal-panel max-w-2xl p-6 w-full max-h-[90vh] overflow-y-auto mx-4"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-[var(--color-text)] mb-4">{formTitle}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                Tên điện thoại
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={field}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                Hãng
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className={field}
                required
              >
                <option value="">-- Chọn hãng --</option>
                {validCategoryIds.map((id) => (
                  <option key={id} value={id}>
                    {CATEGORY_BRAND_MAPPING_PHONE[id]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                Giá
              </label>
              <input
                type="number"
                name="unitPrice"
                value={formData.unitPrice}
                onChange={handleChange}
                className={field}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                Số lượng
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className={field}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
              Mô tả
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`${field} min-h-[5rem]`}
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
              Link ảnh
            </label>
            <input name="imageUrl" value={formData.imageUrl} onChange={handleChange} className={field} />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={onCancel} className="btn-admin-outline">
              {t("common.cancel")}
            </button>
            <button type="submit" className="btn-admin-primary">
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
