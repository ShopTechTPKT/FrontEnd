import React, { useState, useMemo, useEffect } from "react";
import { FaEdit, FaEnvelope, FaCalendarAlt, FaPercent } from "react-icons/fa";
import EmptyState from "../../../../components/ui/EmptyState";
import Pagination from "../../../../components/ui/Pagination";
import TableSortHeader from "../../../../components/ui/TableSortHeader";

export default function DiscountsDataTable({
  filteredDiscounts,
  t,
  getProductName,
  formatDate,
  handleToggleStatus,
  handleEdit,
  handleSendEmailClick,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedDiscounts = useMemo(() => {
    const sortable = [...filteredDiscounts];
    if (sortConfig.key) {
      sortable.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        if (sortConfig.key === 'discountRate') {
          aVal = Number(aVal) || 0;
          bVal = Number(bVal) || 0;
        } else if (sortConfig.key === 'startDate' || sortConfig.key === 'endDate') {
          aVal = new Date(aVal || 0).getTime();
          bVal = new Date(bVal || 0).getTime();
        }

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [filteredDiscounts, sortConfig]);

  const paginatedDiscounts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedDiscounts.slice(start, start + itemsPerPage);
  }, [sortedDiscounts, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredDiscounts, itemsPerPage]);

  return (
    <div className="flex flex-col rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="admin-table w-full">
          <thead>
            <tr>
              <TableSortHeader label={t("admin.discount_name_col") || "Tên Discount"} sortKey="name" currentSort={sortConfig} onSort={handleSort} />
              <th className="w-24 text-center">{t("admin.discount_type_col") || "Loại"}</th>
              <TableSortHeader label={t("admin.discount_rate_col") || "Giảm"} sortKey="discountRate" currentSort={sortConfig} onSort={handleSort} />
              <TableSortHeader label={t("admin.discount_product_col") || "Sản phẩm"} sortKey="productId" currentSort={sortConfig} onSort={handleSort} />
              <TableSortHeader label={t("admin.discount_time_col") || "Thời gian"} sortKey="endDate" currentSort={sortConfig} onSort={handleSort} />
              <TableSortHeader label={t("admin.discount_status_col") || "Trạng thái"} sortKey="discountStatus" currentSort={sortConfig} onSort={handleSort} className="text-center" />
              <th className="text-right pr-6">{t("admin.actions") || "Thao tác"}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedDiscounts.map((discount) => (
              <tr key={discount.id} className="admin-table-row group">
                <td className="px-4 py-4">
                  <div>
                    <div className="text-sm font-semibold text-[var(--color-text)]">
                      {discount.name}
                    </div>
                    <div className="text-xs text-[var(--color-text-muted)] line-clamp-1 max-w-[200px]" title={discount.description}>
                      {discount.description || "Không có mô tả"}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-center">
                  <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider rounded border bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800">
                    {t("admin.discount_type_percentage") || "PERCENT"}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-[var(--color-text)]">
                  <div className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-500">
                    <FaPercent size={12} />
                    <span>
                      {(discount.discountRate <= 1
                        ? discount.discountRate * 100
                        : discount.discountRate
                      ).toFixed(0)}
                      %
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-[var(--color-text)]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-bg-subtle)] border border-[var(--color-border)] flex items-center justify-center text-[10px] font-mono text-[var(--color-text-muted)]">
                      #{discount.productId || 'ALL'}
                    </div>
                    <span className="font-medium text-xs max-w-[150px] truncate" title={getProductName(discount.productId)}>
                      {getProductName(discount.productId)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-xs text-[var(--color-text-secondary)]">
                  <div className="space-y-1 bg-[var(--color-bg-subtle)] p-1.5 rounded-md border border-[var(--color-border)] w-fit">
                    <div className="flex items-center gap-1.5">
                      <FaCalendarAlt className="text-emerald-500" size={10} />
                      <span>{formatDate(discount.startDate)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FaCalendarAlt className="text-red-500" size={10} />
                      <span className="font-medium text-[var(--color-text)]">{formatDate(discount.endDate)}</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-center">
                  <button
                    type="button"
                    onClick={() =>
                      handleToggleStatus(discount.id, discount.discountStatus)
                    }
                    className={`px-3 py-1 text-[11px] font-bold rounded-full border transition-all ${
                      discount.discountStatus
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
                        : "bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:bg-[var(--color-success-light)] hover:text-[var(--color-success)] hover:border-[var(--color-success)]"
                    }`}
                  >
                    {discount.discountStatus
                      ? (t("admin.active") || "Hoạt động")
                      : (t("admin.inactive") || "Đã vô hiệu")}
                  </button>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right pr-6">
                  <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleSendEmailClick(discount)}
                      className="p-2 rounded-md bg-[var(--color-primary-)] text-[var(--color-primary-)] hover:bg-[var(--color-primary-)] dark:bg-[var(--color-primary-)]/30 dark:text-[var(--color-primary-)] transition-colors"
                      title="Gửi email thông báo"
                    >
                      <FaEnvelope size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEdit(discount)}
                      className="p-2 rounded-md bg-[var(--color-bg-subtle)] text-[var(--color-text)] hover:bg-[var(--color-primary-subtle)] hover:text-[var(--color-primary)] transition-colors border border-[var(--color-border)]"
                      title="Chỉnh sửa mã"
                    >
                      <FaEdit size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredDiscounts.length === 0 ? (
        <div className="text-center py-10 border-t border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
          <EmptyState
            title="Không tìm thấy mã giảm giá"
            description="Không có mã nào phù hợp với bộ lọc hiện tại"
            className="py-0"
          />
        </div>
      ) : (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredDiscounts.length / itemsPerPage)}
          totalItems={filteredDiscounts.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      )}
    </div>
  );
}
