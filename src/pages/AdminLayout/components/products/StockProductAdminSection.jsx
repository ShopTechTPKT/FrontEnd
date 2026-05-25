import React, { memo, useState, useEffect } from "react";
import { AlertCircle, ImageOff, Search, Pencil, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import formatCurrency from "../../../../utils/formatCurrency";
import StockProductFormModal from "../forms/StockProductFormModal";
import ProductTableLayout from "./ProductTableLayout";

/**
 * Shared list + modal for dashboard hardware menus (RAM, Storage, Mouse, …).
 */
function StockProductAdminSectionInner({
  activeMenu,
  activeMenuValue,
  items = [],
  theme = "dark",
  parentLoading = false,
  createProduct,
  updateProduct,
  categoryBrandMapping,
  validCategoryIds,
  images = [],
  titleKey,
  titleDefault,
  searchPlaceholderKey,
  searchPlaceholderDefault,
  emptyKey,
  emptyDefault,
  noMatchKey,
  noMatchDefault,
  formAddTitle,
  formEditTitle,
  categoryColumnLabel,
}) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formState, setFormState] = useState({
    isOpen: false,
    formType: null,
    currentItem: null,
  });
  const [localItems, setLocalItems] = useState(items);
  const [isSynced, setIsSynced] = useState(true);

  useEffect(() => {
    if (isSynced) setLocalItems(items);
  }, [items, isSynced]);

  useEffect(() => {
    if (!error) return undefined;
    const timer = setTimeout(() => setError(null), 5000);
    return () => clearTimeout(timer);
  }, [error]);

  if (
    activeMenu !== undefined &&
    activeMenu !== null &&
    activeMenu !== activeMenuValue
  ) {
    return null;
  }

  const loadingCombined = parentLoading || isLoading;

  const secondary = "text-[var(--color-text-muted)]";
  const emptyBox =
    "text-[var(--color-text-muted)] bg-[var(--color-bg-muted)] border border-[var(--color-border)] border-dashed";

  const toolbar = (
    <>
      <button
        type="button"
        onClick={() =>
          setFormState({
            isOpen: true,
            formType: "add",
            currentItem: null,
          })
        }
        className="btn-admin-primary inline-flex items-center gap-2"
      >
        <Plus size={18} />
        <span>{t("admin.thm")}</span>
      </button>
      <div className="relative w-full sm:w-64">
        <input
          type="text"
          placeholder={t(searchPlaceholderKey, searchPlaceholderDefault)}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="admin-input w-full pl-10 py-2"
        />
        <Search
          className={`absolute left-3 top-1/2 -translate-y-1/2 ${secondary}`}
          size={20}
        />
      </div>
    </>
  );

  const formatPrice = (price) => {
    if (price === undefined || price === null) return "N/A";
    return formatCurrency(price);
  };

  const filteredItems =
    searchTerm.trim() === ""
      ? localItems
      : localItems.filter(
          (item) =>
            (item?.productName || "")
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            (item?.description || "")
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            (item?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
        );

  const handleSave = async (productData) => {
    try {
      setIsLoading(true);
      setIsSynced(false);
      if (formState.formType === "add") {
        const newProduct = await createProduct(productData);
        setLocalItems((prev) => [
          ...prev,
          {
            ...productData,
            id: newProduct?.id || newProduct?.productID,
          },
        ]);
      } else {
        const productId =
          formState.currentItem?.id ||
          formState.currentItem?.productID ||
          formState.currentItem?.productName;
        if (!productId) {
          throw new Error(t("remaining.no_product_id"));
        }
        if (updateProduct) {
          await updateProduct(productId, productData);
        }
        setLocalItems((prev) =>
          prev.map((row) =>
            (row.id || row.productID || row.productName) === productId
              ? { ...row, ...productData }
              : row
          )
        );
      }
      setFormState((prev) => ({ ...prev, isOpen: false }));
      setIsSynced(true);
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      const msg =
        err.message?.includes("Product not found") ||
        err.message?.includes("not found")
          ? t("remaining.product_missing", "Sản phẩm không tồn tại")
          : err.message || t("common.error");
      setError(msg);
      setIsLoading(false);
      throw err;
    }
  };

  return (
    <>
      {error ? (
        <div className="bg-red-600 text-white p-3 rounded-lg mb-4 flex items-center">
          <AlertCircle size={20} className="mr-2 shrink-0" />
          {error}
          <button
            type="button"
            className="ml-auto text-white hover:text-gray-200"
            onClick={() => setError(null)}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ) : null}

      <ProductTableLayout title={t(titleKey, titleDefault)} toolbar={toolbar}>
      {loadingCombined && localItems.length === 0 ? (
        <div className="space-y-3 py-2" aria-busy="true" aria-label={t("admin.ang_ti_d_liu")}>
          {[1, 2, 3, 4, 5, 6].map((row) => (
            <div
              key={row}
              className="admin-skeleton h-12 rounded-[var(--radius-md)] border border-[var(--color-border)]"
            />
          ))}
        </div>
      ) : null}

      {!loadingCombined && localItems.length === 0 ? (
        <div
          className={`flex justify-center items-center h-64 rounded-lg ${emptyBox}`}
        >
          <ImageOff className="mr-2" size={24} />
          <span>{t(emptyKey, emptyDefault)}</span>
        </div>
      ) : null}

      {!loadingCombined &&
      localItems.length > 0 &&
      filteredItems.length === 0 ? (
        <div
          className={`flex justify-center items-center h-64 rounded-lg ${emptyBox}`}
        >
          <ImageOff className="mr-2" size={24} />
          <span>{t(noMatchKey, noMatchDefault)}</span>
        </div>
      ) : null}

      {localItems.length > 0 && filteredItems.length > 0 ? (
        <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)]">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t("admin.hnh_nh")}</th>
                <th>{t("admin.tn_sn_phm")}</th>
                <th>{t("admin.m_t")}</th>
                <th>{t("product.price")}</th>
                <th>{t("admin.tn_kho")}</th>
                <th>{t("admin.hng")}</th>
                <th>{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((row, index) => (
                <tr
                  key={row.id || row.productID || row.productName || `row-${index}`}
                  className="admin-table-row"
                >
                  <td className="whitespace-nowrap">
                    <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-[var(--color-bg-muted)]">
                      {row.imageUrl ? (
                        <img
                          src={row.imageUrl}
                          alt=""
                          className="h-12 w-12 object-cover rounded-lg shadow-sm"
                          onError={(e) => {
                            e.target.src = "";
                          }}
                        />
                      ) : (
                        <ImageOff className={secondary} size={24} />
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap text-sm font-medium">
                    {row.name || "N/A"}
                  </td>
                  <td className={`text-sm ${secondary}`}>
                    <div className="max-w-xs truncate">
                      {row.description || "—"}
                    </div>
                  </td>
                  <td className={`whitespace-nowrap text-sm ${secondary}`}>
                    {formatPrice(row.unitPrice)}
                  </td>
                  <td className={`whitespace-nowrap text-sm ${secondary}`}>
                    {row.quantity !== undefined ? row.quantity : "N/A"}
                  </td>
                  <td className={`whitespace-nowrap text-sm ${secondary}`}>
                    {categoryBrandMapping[row.categoryId] ||
                      categoryColumnLabel ||
                      "—"}
                  </td>
                  <td className="whitespace-nowrap text-sm">
                    <button
                      type="button"
                      onClick={() =>
                        setFormState({
                          isOpen: true,
                          formType: "edit",
                          currentItem: row,
                        })
                      }
                      className="p-2 rounded-full bg-[var(--color-bg-muted)] hover:bg-[var(--color-primary-subtle)] transition-colors"
                      title={t("admin.chnh_sa")}
                    >
                      <Pencil size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      </ProductTableLayout>

      {formState.isOpen ? (
        <StockProductFormModal
          item={formState.currentItem}
          onSave={handleSave}
          onCancel={() =>
            setFormState((prev) => ({ ...prev, isOpen: false }))
          }
          formTitle={
            formState.formType === "add" ? formAddTitle : formEditTitle
          }
          theme={theme}
          categoryBrandMapping={categoryBrandMapping}
          validCategoryIds={validCategoryIds}
          images={images}
        />
      ) : null}
    </>
  );
}

export default memo(StockProductAdminSectionInner);
