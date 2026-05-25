import React, { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Eye,
  FileSpreadsheet,
  RotateCcw,
  Upload,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import ProductTableLayout from "./components/products/ProductTableLayout";
import formatCurrency from "../../utils/formatCurrency";
import notify from "../../utils/notify";
import {
  importProductsFromCsv,
  previewProductImport,
} from "../../apis/productApi";

const TEMPLATE_HEADER =
  "name,description,unitPrice,quantity,categoryId,imageUrl,status,percentage";

const TEMPLATE_ROWS = [
  "Laptop Demo,Gaming laptop RTX 4060,28990000,8,33,https://example.com/laptop.jpg,AVAILABLE,0",
  "Mouse Demo,Wireless gaming mouse,790000,20,8,https://example.com/mouse.jpg,AVAILABLE,10",
];

const ACCEPTED_STATUS = "AVAILABLE, OUT_OF_STOCK, DISCONTINUED";

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const formatBytes = (value = 0) => {
  if (!value) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let size = value;
  let unitIdx = 0;
  while (size >= 1024 && unitIdx < units.length - 1) {
    size /= 1024;
    unitIdx += 1;
  }
  return `${size.toFixed(unitIdx === 0 ? 0 : 1)} ${units[unitIdx]}`;
};

const isCsv = (file) =>
  Boolean(file?.name?.toLowerCase?.().endsWith(".csv"));

const getApiError = (error) =>
  error?.response?.data?.message ||
  error?.normalized?.message ||
  error?.message ||
  "Request failed";

function StatCard({ label, value, variant = "default" }) {
  const toneMap = {
    default: "text-[var(--color-text)] bg-[var(--color-bg)]",
    success:
      "text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-900/20",
    danger: "text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-900/20",
  };

  return (
    <div className={`rounded-xl border border-[var(--color-border)] p-4 ${toneMap[variant]}`}>
      <div className="text-xs uppercase tracking-wide opacity-80">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}

export default function ProductImportPage() {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isImportLoading, setIsImportLoading] = useState(false);
  const [previewResult, setPreviewResult] = useState(null);
  const [importResult, setImportResult] = useState(null);

  const activeResult = importResult || previewResult;
  const previewRows = useMemo(
    () => (Array.isArray(activeResult?.previewRows) ? activeResult.previewRows : []),
    [activeResult],
  );
  const errors = useMemo(
    () => (Array.isArray(activeResult?.errors) ? activeResult.errors : []),
    [activeResult],
  );

  const hasPreview = Boolean(previewResult);
  const canPreview = Boolean(file) && !isPreviewLoading && !isImportLoading;
  const canImport =
    Boolean(file) &&
    hasPreview &&
    toNumber(previewResult?.successCount) > 0 &&
    !isPreviewLoading &&
    !isImportLoading;

  const setSelectedFile = (nextFile) => {
    if (!nextFile) return;
    if (!isCsv(nextFile)) {
      notify.error(
        t("admin.import_products_file_type", "Only .csv file is supported."),
      );
      return;
    }
    setFile(nextFile);
    setPreviewResult(null);
    setImportResult(null);
  };

  const resetState = () => {
    setFile(null);
    setPreviewResult(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openPicker = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const downloadTemplate = () => {
    const csv = [TEMPLATE_HEADER, ...TEMPLATE_ROWS].join("\n");
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "product_import_template.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const runPreview = async () => {
    if (!file) {
      notify.warning(
        t("admin.import_products_select_file", "Please select a CSV file first."),
      );
      return;
    }
    setIsPreviewLoading(true);
    try {
      const result = await previewProductImport(file);
      setPreviewResult(result);
      setImportResult(null);
      notify.success(
        t("admin.import_products_preview_ready", {
          defaultValue: `Preview ready: ${toNumber(result?.successCount)} valid rows.`,
          count: toNumber(result?.successCount),
        }),
      );
    } catch (error) {
      notify.error(getApiError(error));
      setPreviewResult(null);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const runImport = async () => {
    if (!canImport) {
      notify.warning(
        t(
          "admin.import_products_need_preview",
          "Run preview first and ensure there are valid rows.",
        ),
      );
      return;
    }
    setIsImportLoading(true);
    try {
      const result = await importProductsFromCsv(file);
      setImportResult(result);
      notify.success(
        t("admin.import_products_import_done", {
          defaultValue: `Imported ${toNumber(result?.successCount)} products.`,
          count: toNumber(result?.successCount),
        }),
      );
    } catch (error) {
      notify.error(getApiError(error));
    } finally {
      setIsImportLoading(false);
    }
  };

  const toolbar = (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={downloadTemplate}
        className="btn-admin-outline inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
      >
        <Download size={16} />
        {t("admin.import_products_template", "Template")}
      </button>
      <button
        type="button"
        onClick={openPicker}
        className="btn-admin-outline inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
      >
        <FileSpreadsheet size={16} />
        {t("admin.import_products_choose_csv", "Choose CSV")}
      </button>
      <button
        type="button"
        onClick={runPreview}
        disabled={!canPreview}
        className="btn-admin-primary inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <Eye size={16} />
        {isPreviewLoading
          ? t("admin.import_products_previewing", "Previewing...")
          : t("admin.import_products_preview", "Preview")}
      </button>
      <button
        type="button"
        onClick={runImport}
        disabled={!canImport}
        className="btn-admin-primary inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <CheckCircle2 size={16} />
        {isImportLoading
          ? t("admin.import_products_importing", "Importing...")
          : t("admin.import_products_import", "Import")}
      </button>
      <button
        type="button"
        onClick={resetState}
        className="btn-admin-outline inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
      >
        <RotateCcw size={16} />
        {t("admin.import_products_reset", "Reset")}
      </button>
    </div>
  );

  return (
    <ProductTableLayout
      title={t("admin.import_products_title", "Import Products (CSV)")}
      subtitle={t(
        "admin.import_products_subtitle",
        "Upload CSV, preview valid rows, then import in one click.",
      )}
      toolbar={toolbar}
      className="space-y-5"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={(event) => setSelectedFile(event.target.files?.[0])}
        className="hidden"
      />

      <div
        className={[
          "rounded-xl border-2 border-dashed p-6 transition-colors",
          isDragging
            ? "border-[var(--color-primary)] bg-[var(--color-primary-subtle)]"
            : "border-[var(--color-border)] bg-[var(--color-bg-subtle)]",
        ].join(" ")}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          setSelectedFile(event.dataTransfer.files?.[0]);
        }}
      >
        <div className="flex flex-col gap-2 text-center items-center">
          <Upload className="text-[var(--color-primary)]" size={24} />
          <p className="text-sm text-[var(--color-text-secondary)]">
            {t(
              "admin.import_products_drag_drop",
              "Drag and drop CSV here, or use",
            )}{" "}
            <span className="font-semibold">
              {t("admin.import_products_choose_csv", "Choose CSV")}
            </span>
            .
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">
            {t("admin.import_products_required_columns", "Required columns:")}{" "}
            <code>{TEMPLATE_HEADER}</code>
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">
            {t("admin.import_products_allowed_status", "Allowed status:")}{" "}
            <code>{ACCEPTED_STATUS}</code>
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] p-4 bg-[var(--color-bg)]">
        <div className="text-sm font-medium text-[var(--color-text)]">
          {t("admin.import_products_selected_file", "Selected file")}
        </div>
        {file ? (
          <div className="mt-2 flex flex-col gap-1 text-sm text-[var(--color-text-secondary)]">
            <div>
              {t("admin.import_products_name", "Name:")}{" "}
              <span className="font-medium text-[var(--color-text)]">{file.name}</span>
            </div>
            <div>
              {t("admin.import_products_size", "Size:")} {formatBytes(file.size)}
            </div>
          </div>
        ) : (
          <div className="mt-2 text-sm text-[var(--color-text-muted)]">
            {t("admin.import_products_no_file", "No file selected.")}
          </div>
        )}
      </div>

      {activeResult ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard
            label={t("admin.import_products_total_rows", "Total rows")}
            value={toNumber(activeResult.totalRows)}
          />
          <StatCard
            label={t("admin.import_products_valid_rows", "Valid rows")}
            value={toNumber(activeResult.successCount)}
            variant="success"
          />
          <StatCard
            label={t("admin.import_products_error_rows", "Error rows")}
            value={toNumber(activeResult.errorCount)}
            variant={toNumber(activeResult.errorCount) > 0 ? "danger" : "default"}
          />
        </div>
      ) : null}

      {previewRows.length > 0 ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--color-border)] text-sm font-semibold text-[var(--color-text)]">
            {t("admin.import_products_preview_rows", "Preview Rows (max 20)")}
          </div>
          <div className="overflow-x-auto">
            <table className="admin-table w-full">
              <thead>
                <tr>
                  <th>{t("admin.import_products_col_name", "Name")}</th>
                  <th>{t("admin.import_products_col_price", "Price")}</th>
                  <th>{t("admin.import_products_col_qty", "Qty")}</th>
                  <th>{t("admin.import_products_col_category", "Category")}</th>
                  <th>{t("admin.import_products_col_status", "Status")}</th>
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, idx) => (
                  <tr key={`preview-${idx}`} className="admin-table-row">
                    <td>{row?.name || "-"}</td>
                    <td>{formatCurrency(toNumber(row?.unitPrice))}</td>
                    <td>{toNumber(row?.quantity)}</td>
                    <td>{toNumber(row?.categoryId)}</td>
                    <td>{row?.status || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {errors.length > 0 ? (
        <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/60 dark:bg-red-900/10 overflow-hidden">
          <div className="px-4 py-3 border-b border-red-200/80 dark:border-red-900/60 text-sm font-semibold text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertTriangle size={16} />
            {t("admin.import_products_error_rows_title", "Error Rows")}
          </div>
          <div className="overflow-x-auto">
            <table className="admin-table w-full">
              <thead>
                <tr>
                  <th>{t("admin.import_products_col_row", "Row")}</th>
                  <th>{t("admin.import_products_col_raw", "Raw")}</th>
                  <th>{t("admin.import_products_col_message", "Message")}</th>
                </tr>
              </thead>
              <tbody>
                {errors.map((item, idx) => (
                  <tr key={`error-${idx}`} className="admin-table-row">
                    <td className="font-medium">{toNumber(item?.row)}</td>
                    <td className="max-w-[22rem] truncate" title={item?.raw || ""}>
                      {item?.raw || "-"}
                    </td>
                    <td>
                      {item?.message ||
                        t("admin.import_products_invalid_row", "Invalid row")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </ProductTableLayout>
  );
}
