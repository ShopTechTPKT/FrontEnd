import React from "react";
import {
  FaPlus,
  FaSearch,
  FaFilter,
  FaTicketAlt,
  FaCalendarAlt,
  FaToggleOn,
  FaPercent,
} from "react-icons/fa";
import Button from "../../../../components/ui/Button";
import StatusNotice from "../../../../components/ui/StatusNotice";

const VIEW_TAB_ICONS = {
  all: FaTicketAlt,
  active: FaToggleOn,
  expired: FaCalendarAlt,
  upcoming: FaCalendarAlt,
  best: FaPercent,
};

export default function DiscountsToolbar({
  t,
  error,
  onRetryFetch,
  onBulkDeactivate,
  onAddClick,
  viewMode,
  setViewMode,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  showAdvancedFilters,
  setShowAdvancedFilters,
  advancedFilters,
  setAdvancedFilters,
  onApplyAdvancedFilters,
  onClearAdvancedFilters,
}) {
  const tabs = [
    { key: "all", label: t("admin.discount_tab_all") || "Tất cả" },
    { key: "active", label: t("admin.discount_tab_active") || "Đang hoạt động" },
    { key: "expired", label: t("admin.discount_tab_expired") || "Hết hạn" },
    { key: "upcoming", label: t("admin.discount_tab_upcoming") || "Sắp tới" },
    { key: "best", label: t("admin.discount_tab_best") || "Tốt nhất" },
  ];

  return (
    <div className="admin-card p-6 rounded-[var(--radius-lg)]">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">
            {t("admin.discounts_title") || "Quản lý Discount Nâng Cao"}
          </h2>
          <p className="text-[var(--color-text-muted)]">
            {t("admin.discounts_subtitle") ||
              "Quản lý các chương trình giảm giá và khuyến mãi"}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={onBulkDeactivate}
            variant="primary"
            icon={<FaCalendarAlt />}
          >
            {t("admin.deactivate_expired") || "Vô hiệu hóa hết hạn"}
          </Button>
          <Button onClick={onAddClick} variant="primary" icon={<FaPlus />}>
            {t("admin.add_discount") || "Thêm Discount"}
          </Button>
        </div>
      </div>

      {error ? (
        <div className="mb-4">
          <StatusNotice
            tone="error"
            title="Không tải được dữ liệu discount"
            message={error}
            actionText="Thử lại"
            onAction={onRetryFetch}
          />
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2 mb-4">
        {tabs.map(({ key, label }) => {
          const Icon = VIEW_TAB_ICONS[key] || FaTicketAlt;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setViewMode(key)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                viewMode === key
                  ? "bg-[var(--color-primary)] text-white shadow-md ring-2 ring-[var(--color-primary-ring)]"
                  : "bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-subtle)] border border-[var(--color-border)]"
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder={
                t("admin.discount_search_placeholder") || "Tìm kiếm discount..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-input w-full pl-10 pr-4 py-2"
            />
          </div>
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="admin-input py-2 min-w-[11rem]"
        >
          <option value="all">
            {t("admin.discount_status_all") || "Tất cả trạng thái"}
          </option>
          <option value="active">
            {t("admin.discount_status_active") || "Đang hoạt động"}
          </option>
          <option value="inactive">
            {t("admin.discount_status_inactive") || "Không hoạt động"}
          </option>
        </select>

        <button
          type="button"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="btn-admin-outline px-4 py-2 rounded-lg inline-flex items-center gap-2"
        >
          <FaFilter />
          {t("admin.discount_advanced_filter") || "Bộ lọc nâng cao"}
        </button>
      </div>

      {showAdvancedFilters && (
        <div className="mt-4 p-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--color-text)]">
                {t("admin.discount_rate_from") || "Tỷ lệ giảm giá từ (%)"}
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={advancedFilters.minRate}
                onChange={(e) =>
                  setAdvancedFilters({
                    ...advancedFilters,
                    minRate: e.target.value,
                  })
                }
                className="admin-input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--color-text)]">
                {t("admin.discount_rate_to") || "Tỷ lệ giảm giá đến (%)"}
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={advancedFilters.maxRate}
                onChange={(e) =>
                  setAdvancedFilters({
                    ...advancedFilters,
                    maxRate: e.target.value,
                  })
                }
                className="admin-input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--color-text)]">
                {t("admin.discount_category") || "Danh mục sản phẩm"}
              </label>
              <select
                value={advancedFilters.categoryId}
                onChange={(e) =>
                  setAdvancedFilters({
                    ...advancedFilters,
                    categoryId: e.target.value,
                  })
                }
                className="admin-input w-full"
              >
                <option value="">
                  {t("admin.discount_category_all") || "Tất cả danh mục"}
                </option>
                <option value="1">Monitors</option>
                <option value="2">Laptops</option>
                <option value="3">Phones</option>
                <option value="4">Mice</option>
                <option value="5">Keyboards</option>
                <option value="6">Processors</option>
                <option value="7">Storage</option>
                <option value="8">RAM</option>
                <option value="9">Headphones</option>
                <option value="10">Cases</option>
                <option value="11">PCs</option>
                <option value="12">PSUs</option>
                <option value="13">Mainboards</option>
                <option value="14">Mousepads</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClearAdvancedFilters}
              className="btn-admin-outline px-4 py-2 rounded-lg"
            >
              {t("admin.clear_filters") || "Xóa bộ lọc"}
            </button>
            <button
              type="button"
              onClick={onApplyAdvancedFilters}
              className="btn-admin-primary px-4 py-2 rounded-lg"
            >
              {t("admin.apply_filters") || "Áp dụng bộ lọc"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
