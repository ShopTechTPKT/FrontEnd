import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const CATEGORY_BRAND_MAPPING = {
  45: "Acer",
  46: "Asus",
  47: "Dell",
  48: "Gigabyte",
  49: "Lenovo",
  50: "Apple",
  51: "MSI",
};

export default function LaptopForm({
  computer = {},
  onSave,
  onCancel,
  formTitle,
  validCategoryIds = [45, 46, 47, 48, 49, 50, 51],
}) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: computer?.name || "",
    description: computer?.description || "",
    unitPrice: computer?.unitPrice || "",
    quantity: computer?.quantity || "",
    categoryId: computer?.categoryId || "",
    imageUrl: computer?.imageUrl || "",
    isLoading: false,
    error: null,
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
    setFormData((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      await onSave(formData);
    } catch (err) {
      setFormData((prev) => ({
        ...prev,
        isLoading: false,
        error: err.message,
      }));
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
        {formData.error ? (
          <div className="mb-4 text-sm text-[var(--color-danger)]">{formData.error}</div>
        ) : null}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                {t("admin.tn_sn_phm")}
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
                {t("admin.hng")}
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
                    {CATEGORY_BRAND_MAPPING[id]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                {t("product.price")}
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
                {t("admin.tn_kho")}
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
              {t("admin.m_t")}
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
              Image URL
            </label>
            <input
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              className={field}
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={onCancel} className="btn-admin-outline">
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={formData.isLoading}
              className="btn-admin-primary disabled:opacity-50"
            >
              {formData.isLoading ? "Saving..." : t("common.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export { CATEGORY_BRAND_MAPPING };
