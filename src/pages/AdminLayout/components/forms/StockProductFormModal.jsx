import React, { useEffect, useState } from "react";
import { Loader2, AlertCircle, Search } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * Shared admin modal for product categories that use brand/category dropdown + optional image gallery.
 * Parent passes mappings and handles persistence via onSave(productData).
 */
export default function StockProductFormModal({
  item = {},
  onSave,
  onCancel,
  formTitle,
  theme = "dark",
  categoryBrandMapping,
  validCategoryIds = [],
  images = [],
}) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: item?.name || "",
    description: item?.description || "",
    unitPrice: item?.unitPrice ?? "",
    quantity: item?.quantity ?? "",
    categoryId: item?.categoryId ?? "",
    imageUrl: item?.imageUrl || "",
    isLoading: false,
    error: null,
  });

  const [imageSearchTerm, setImageSearchTerm] = useState("");
  const [showImagePicker, setShowImagePicker] = useState(false);

  useEffect(() => {
    setFormData({
      name: item?.name || "",
      description: item?.description || "",
      unitPrice: item?.unitPrice ?? "",
      quantity: item?.quantity ?? "",
      categoryId: item?.categoryId ?? "",
      imageUrl: item?.imageUrl || "",
      isLoading: false,
      error: null,
    });
  }, [item]);

  useEffect(() => {
    if (!formData.error) return undefined;
    const timer = setTimeout(
      () => setFormData((prev) => ({ ...prev, error: null })),
      5000
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
          : name === "categoryId"
            ? value === ""
              ? ""
              : parseInt(value, 10)
            : value,
    }));
  };

  const handleImageSelect = (image) => {
    const url = image?.url || "";
    setFormData((prev) => ({ ...prev, imageUrl: url }));
    setShowImagePicker(false);
    setImageSearchTerm("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormData((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const cat = parseInt(formData.categoryId, 10);
      if (!formData.categoryId || !validCategoryIds.includes(cat)) {
        throw new Error(
          t("admin.validation_select_brand", "Vui lòng chọn một hãng hợp lệ")
        );
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
          t("admin.validation_qty", "Số lượng tồn kho phải không âm")
        );
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        unitPrice: parseFloat(formData.unitPrice),
        quantity: parseInt(formData.quantity, 10),
        categoryId: cat,
        imageUrl: formData.imageUrl || null,
      };

      await onSave(productData);
      setFormData((prev) => ({ ...prev, isLoading: false }));
    } catch (error) {
      console.error("StockProductFormModal save:", error);
      setFormData((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || t("common.error", "Lỗi"),
      }));
    }
  };

  const filteredImages =
    imageSearchTerm.trim() === ""
      ? images
      : images.filter((img) =>
          (img.url || "").toLowerCase().includes(imageSearchTerm.toLowerCase())
        );

  const panelClass = theme === "dark" ? "dark-panel" : "";

  return (
    <div
      className="admin-modal-overlay"
      onClick={onCancel}
      role="presentation"
    >
      <div
        className={`admin-modal-panel w-full max-w-lg p-6 relative ${panelClass}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h3 className="text-xl font-semibold mb-4 text-[var(--color-text)]">{formTitle}</h3>

        {formData.error ? (
          <div className="text-[var(--color-danger)] mb-4 flex items-center gap-2">
            <AlertCircle size={20} className="mr-2 shrink-0" />
            {formData.error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-[var(--color-text)]">{t("admin.tn_sn_phm")}</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="admin-input w-full"
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-[var(--color-text)]">{t("admin.m_t")}</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="admin-input w-full min-h-[5rem]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-[var(--color-text)]">{t("admin.gi_vnd")}</label>
                <input
                  type="number"
                  name="unitPrice"
                  value={formData.unitPrice}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  className="admin-input w-full"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-[var(--color-text)]">{t("admin.tn_kho")}</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="0"
                  className="admin-input w-full"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-[var(--color-text)]">{t("admin.hng")}</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="admin-input w-full"
                required
              >
                <option value="">{t("admin.chn_hng")}</option>
                {validCategoryIds.map((id) => (
                  <option key={id} value={id}>
                    {categoryBrandMapping[id] || `ID ${id}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-[var(--color-text)]">{t("admin.hnh_nh")}</label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={formData.imageUrl || ""}
                  placeholder={t("admin.chn_hnh_nh")}
                  onClick={() => setShowImagePicker(true)}
                  className="admin-input w-full cursor-pointer"
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
          </div>

          {showImagePicker ? (
            <div
              className="absolute inset-0 rounded-xl p-4 overflow-y-auto z-10 border border-[var(--color-border)] bg-[var(--color-bg-subtle)]"
            >
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
                  className="admin-input w-full pl-10"
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
                        formData.imageUrl === image.url
                          ? "ring-2 ring-[var(--color-primary-)]"
                          : ""
                      }`}
                    >
                      <img
                        src={image.url}
                        alt=""
                        className="h-20 w-full object-cover rounded-lg"
                      />
                      <p className="text-xs truncate mt-1">
                        {(image.url || "").split("/").pop()}
                      </p>
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
