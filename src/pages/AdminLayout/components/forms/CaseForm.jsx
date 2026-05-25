import React, { useEffect, useState } from "react";
import { Loader2, AlertCircle, Search } from "lucide-react";
import { useTranslation } from "react-i18next";

const FIXED_CASE_CATEGORY_ID = 17;

/**
 * Case (vỏ máy) — single fixed category, optional image gallery.
 */
export default function CaseForm({
  caseItem = {},
  onSave,
  onCancel,
  formTitle,
  images = [],
}) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: caseItem?.name || "",
    description: caseItem?.description || "",
    unitPrice: caseItem?.unitPrice ?? "",
    quantity: caseItem?.quantity ?? "",
    imageUrl: caseItem?.imageUrl || "",
    isLoading: false,
    error: null,
  });

  const [imageSearchTerm, setImageSearchTerm] = useState("");
  const [showImagePicker, setShowImagePicker] = useState(false);

  useEffect(() => {
    setFormData({
      name: caseItem?.name || "",
      description: caseItem?.description || "",
      unitPrice: caseItem?.unitPrice ?? "",
      quantity: caseItem?.quantity ?? "",
      imageUrl: caseItem?.imageUrl || "",
      isLoading: false,
      error: null,
    });
  }, [caseItem]);

  useEffect(() => {
    if (!formData.error) return undefined;
    const timer = setTimeout(
      () => setFormData((prev) => ({ ...prev, error: null })),
      5000,
    );
    return () => clearTimeout(timer);
  }, [formData.error]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "unitPrice" || name === "quantity"
          ? value === ""
            ? ""
            : name === "quantity"
              ? parseInt(value, 10) || value
              : parseFloat(value) || value
          : value,
    }));
  };

  const handleImageSelect = (image) => {
    setFormData((prev) => ({ ...prev, imageUrl: image?.url || "" }));
    setShowImagePicker(false);
    setImageSearchTerm("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormData((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      if (!formData.name?.trim()) {
        throw new Error(t("admin.validation_name", "Tên sản phẩm là bắt buộc"));
      }
      if (
        Number.isNaN(parseFloat(formData.unitPrice)) ||
        parseFloat(formData.unitPrice) < 0
      ) {
        throw new Error(t("admin.validation_price", "Giá phải là số dương"));
      }
      if (
        Number.isNaN(parseInt(formData.quantity, 10)) ||
        parseInt(formData.quantity, 10) < 0
      ) {
        throw new Error(
          t("admin.validation_qty", "Số lượng tồn kho phải không âm"),
        );
      }

      const productData = {
        name: formData.name.trim(),
        description: formData.description,
        unitPrice: parseFloat(formData.unitPrice),
        quantity: parseInt(formData.quantity, 10),
        categoryID: FIXED_CASE_CATEGORY_ID,
        categoryId: FIXED_CASE_CATEGORY_ID,
        imageUrl: formData.imageUrl || null,
      };

      await onSave(productData);
      setFormData((prev) => ({ ...prev, isLoading: false }));
    } catch (err) {
      console.error(err);
      setFormData((prev) => ({
        ...prev,
        isLoading: false,
        error: err.message || t("common.error", "Không thể lưu"),
      }));
    }
  };

  const filteredImages =
    imageSearchTerm.trim() === ""
      ? images
      : images.filter((img) =>
          (img.url || "").toLowerCase().includes(imageSearchTerm.toLowerCase()),
        );

  const field = "admin-input w-full";

  return (
    <div className="admin-modal-overlay" onClick={onCancel} role="presentation">
      <div
        className="admin-modal-panel w-full max-w-lg p-6 relative"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h3 className="text-xl font-semibold mb-4 text-[var(--color-text)]">{formTitle}</h3>

        {formData.error ? (
          <div className="text-[var(--color-danger)] mb-4 flex items-center gap-2">
            <AlertCircle size={20} className="shrink-0" />
            {formData.error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-[var(--color-text)]">
                {t("admin.tn_sn_phm")}
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={field}
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-[var(--color-text)]">
                {t("admin.m_t")}
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className={`${field} min-h-[5rem]`}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-[var(--color-text)]">
                  {t("admin.gi_vnd")}
                </label>
                <input
                  type="number"
                  name="unitPrice"
                  value={formData.unitPrice}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  className={field}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-[var(--color-text)]">
                  {t("admin.tn_kho")}
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="0"
                  className={field}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-[var(--color-text)]">
                {t("admin.hnh_nh")}
              </label>
              <input
                type="text"
                readOnly
                value={formData.imageUrl || ""}
                placeholder={t("admin.chn_hnh_nh")}
                onClick={() => setShowImagePicker(true)}
                className={`${field} cursor-pointer`}
              />
              {formData.imageUrl ? (
                <div className="mt-2">
                  <img
                    src={formData.imageUrl}
                    alt=""
                    className="h-20 w-20 object-cover rounded-lg shadow-sm"
                    onError={(e) => {
                      e.target.src = "";
                    }}
                  />
                </div>
              ) : null}
            </div>
          </div>

          {showImagePicker ? (
            <div className="absolute inset-0 rounded-xl p-4 overflow-y-auto z-10 border border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-[var(--color-text)]">
                  {t("admin.chn_hnh_nh")}
                </h4>
                <button
                  type="button"
                  onClick={() => setShowImagePicker(false)}
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder={t("admin.tm_kim_hnh_nh")}
                  value={imageSearchTerm}
                  onChange={(e) => setImageSearchTerm(e.target.value)}
                  className={`${field} pl-10`}
                />
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                  size={20}
                />
              </div>
              <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                {filteredImages.length > 0 ? (
                  filteredImages.map((image) => (
                    <button
                      key={image.url}
                      type="button"
                      onClick={() => handleImageSelect(image)}
                      className={`cursor-pointer p-1 rounded-lg text-left hover:opacity-90 ${
                        formData.imageUrl === image.url ? "ring-2 ring-[var(--color-primary-)]" : ""
                      }`}
                    >
                      <img
                        src={image.url}
                        alt=""
                        className="h-20 w-full object-cover rounded-lg"
                      />
                    </button>
                  ))
                ) : (
                  <div className="col-span-3 text-center text-[var(--color-text-muted)] py-6">
                    Không tìm thấy hình
                  </div>
                )}
              </div>
            </div>
          ) : null}

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="btn-admin-outline"
              disabled={formData.isLoading}
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={formData.isLoading}
              className="btn-admin-primary inline-flex items-center gap-2"
            >
              {formData.isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : null}
              {t("common.save", "Lưu")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
