import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FileSpreadsheet, Search } from "lucide-react";
import axiosInstance from "../../custom/axios";
import formatCurrency from "../../utils/formatCurrency";
import ProductTableLayout from "./components/products/ProductTableLayout";
import Pagination from "../../components/ui/Pagination";
import TableSortHeader from "../../components/ui/TableSortHeader";
import { toast } from "react-toastify";
import ConfirmModal from "../../components/ConfirmModal";

// Helper hook for unique categories
function useCategories(products) {
  return useMemo(() => {
    const cats = new Set(products.map(p => p.categoryId));
    return Array.from(cats).filter(Boolean).sort((a,b) => a-b);
  }, [products]);
}

export default function UnifiedProductTable() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Filters
  const [q, setQ] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const urlCategoryId = searchParams.get("categoryId");

  const [bulkPrice, setBulkPrice] = useState("");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  
  // Sort
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "desc" });
  const [pendingBulkUpdate, setPendingBulkUpdate] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const endpoint = urlCategoryId ? `/products/category/${urlCategoryId}` : "/products";
      const { data } = await axiosInstance.get(endpoint);
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.normalized?.message || "Không thể tải danh sách sản phẩm.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [urlCategoryId]);

  const allCategories = useCategories(products);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(paginatedData.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );
  };

  const handleBulkUpdate = async (payload = null) => {
    const target = payload || {
      productIds: selectedIds,
      unitPrice: Number(bulkPrice),
    };
    if (!target.productIds.length || !target.unitPrice) return;
    try {
      await axiosInstance.post("/products/bulk-update", {
        productIds: target.productIds,
        unitPrice: target.unitPrice,
      });
      await fetchProducts();
      setSelectedIds([]);
      setBulkPrice("");
      toast.success("Cập nhật giá hàng loạt thành công!");
    } catch (err) {
      setError(err?.normalized?.message || "Bulk update thất bại.");
      toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  const requestBulkUpdate = () => {
    if (!selectedIds.length || !bulkPrice) return;
    setPendingBulkUpdate({
      productIds: [...selectedIds],
      unitPrice: Number(bulkPrice),
    });
  };

  // 1. Filter
  const filteredProducts = useMemo(() => {
    let result = products;
    
    if (filterCategory !== "all") {
      result = result.filter(p => p.categoryId === Number(filterCategory));
    }

    if (q.trim()) {
      const normalized = q.toLowerCase();
      result = result.filter(
        (p) =>
          (p.name || "").toLowerCase().includes(normalized) ||
          String(p.id || "").includes(normalized),
      );
    }
    
    return result;
  }, [products, q, filterCategory]);

  // 2. Sort
  const sortedData = useMemo(() => {
    const sortableItems = [...filteredProducts];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        if (sortConfig.key === 'unitPrice' || sortConfig.key === 'quantity' || sortConfig.key === 'categoryId') {
          aValue = Number(aValue) || 0;
          bValue = Number(bValue) || 0;
        }

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredProducts, sortConfig]);

  // 3. Paginate
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [q, filterCategory, itemsPerPage]);

  const getStockBadge = (quantity) => {
    if (quantity <= 0) return <span className="admin-badge bg-red-100 text-red-700">Hết</span>;
    if (quantity <= 5) return <span className="admin-badge bg-amber-100 text-amber-700">Sắp hết</span>;
    return <span className="admin-badge bg-emerald-100 text-emerald-700">Còn hàng</span>;
  };

  const handleExportCSV = () => {
    if (!filteredProducts.length) return;
    const headers = ["ID", "Tên sản phẩm", "Danh mục", "Giá (VNĐ)", "Số lượng tồn"];
    const rows = filteredProducts.map(p => [p.id, `"${(p.name || '').replace(/"/g, '""')}"`, p.categoryId, p.unitPrice || 0, p.quantity || 0]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `products_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Đã xuất ${filteredProducts.length} sản phẩm ra CSV`);
  };

  const handleBulkToggleStatus = async () => {
    if (!selectedIds.length) return;
    try {
      await Promise.all(selectedIds.map(id => axiosInstance.put(`/products/${id}/toggle-status`)));
      await fetchProducts();
      setSelectedIds([]);
      toast.success(`Đã thay đổi trạng thái ${selectedIds.length} sản phẩm`);
    } catch {
      toast.error("Có lỗi khi cập nhật trạng thái");
    }
  };

  const toolbar = (
    <div className="flex flex-wrap gap-3 items-center justify-end w-full lg:flex-1">
      <button
        type="button"
        onClick={fetchProducts}
        className="btn-admin-outline px-3 py-1.5 rounded-lg text-sm shrink-0 h-9"
      >
        Làm mới
      </button>

      <button
        type="button"
        onClick={handleExportCSV}
        className="btn-admin-outline px-3 py-1.5 rounded-lg text-sm shrink-0 h-9 flex items-center gap-1.5"
        title="Xuất CSV"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        Xuất CSV
      </button>
      
      <button
        type="button"
        onClick={() => navigate("/admin/products/import")}
        className="btn-admin-outline px-3 py-1.5 rounded-lg text-sm shrink-0 h-9 flex items-center gap-1.5"
        title="Import CSV"
      >
        <FileSpreadsheet className="w-4 h-4" />
        Import CSV
      </button>
      
      <select
        value={filterCategory}
        onChange={(e) => setFilterCategory(e.target.value)}
        className="admin-input py-1.5 text-sm h-9 min-w-[120px]"
      >
        <option value="all">Tất cả danh mục</option>
        {allCategories.map(cat => (
          <option key={cat} value={cat}>Danh mục {cat}</option>
        ))}
      </select>

      <div className="relative flex-1 min-w-[12rem] max-w-sm">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm theo tên hoặc ID..."
          className="admin-input w-full pl-9 py-1.5 text-sm h-9"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={16} />
      </div>
      
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2 bg-[var(--color-primary-subtle)] border border-[var(--color-primary)]/20 p-1.5 rounded-lg">
          <span className="text-xs font-semibold text-[var(--color-primary)] px-1">{selectedIds.length} đã chọn</span>
          <input
            type="number"
            value={bulkPrice}
            onChange={(e) => setBulkPrice(e.target.value)}
            placeholder="Giá mới..."
            className="admin-input w-28 py-1 text-sm h-7 bg-[var(--color-bg)]"
          />
          <button
            type="button"
            onClick={requestBulkUpdate}
            disabled={!bulkPrice}
            className="btn-admin-primary px-3 py-1 rounded text-xs disabled:opacity-50 h-7"
          >
            Cập nhật giá
          </button>
          <button
            type="button"
            onClick={handleBulkToggleStatus}
            className="btn-admin-outline px-2 py-1 rounded text-xs h-7"
            title="Đổi trạng thái"
          >
            Đổi TT
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
    <ProductTableLayout
      title="Tất Cả Sản Phẩm"
      subtitle="Quản lý tập trung toàn bộ danh mục sản phẩm"
      itemCount={products.length}
      toolbar={toolbar}
      className="space-y-4"
    >
      {error ? (
        <div className="text-sm text-red-500 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="space-y-3 py-2" aria-busy="true" aria-label="Đang tải">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((row) => (
            <div
              key={row}
              className="admin-skeleton h-12 rounded-xl border border-[var(--color-border)]"
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="admin-table w-full">
              <thead>
                <tr>
                  <th className="w-12 text-center pl-4">
                    <input
                      type="checkbox"
                      className="rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] bg-[var(--color-bg)]"
                      checked={selectedIds.length === paginatedData.length && paginatedData.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <TableSortHeader label="ID" sortKey="id" currentSort={sortConfig} onSort={handleSort} className="w-20" />
                  <TableSortHeader label="Tên sản phẩm" sortKey="name" currentSort={sortConfig} onSort={handleSort} />
                  <TableSortHeader label="Danh mục" sortKey="categoryId" currentSort={sortConfig} onSort={handleSort} />
                  <TableSortHeader label="Giá (VNĐ)" sortKey="unitPrice" currentSort={sortConfig} onSort={handleSort} />
                  <TableSortHeader label="Kho" sortKey="quantity" currentSort={sortConfig} onSort={handleSort} />
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((product) => {
                  const isSelected = selectedIds.includes(product.id);
                  return (
                  <tr key={product.id} className={`admin-table-row transition-colors ${isSelected ? 'bg-[var(--color-primary-)]/50 dark:bg-[var(--color-primary-)]/10' : ''}`}>
                    <td className="w-12 text-center pl-4">
                      <input
                        type="checkbox"
                        className="rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] bg-[var(--color-bg)]"
                        checked={isSelected}
                        onChange={() => toggleSelect(product.id)}
                      />
                    </td>
                    <td className="font-mono text-xs text-[var(--color-text-muted)]">#{product.id}</td>
                    <td>
                      <div className="font-medium text-[var(--color-text)] line-clamp-2" title={product.name}>{product.name}</div>
                    </td>
                    <td>
                      <span className="px-2 py-1 bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-md text-xs font-medium text-[var(--color-text-secondary)]">
                        DM {product.categoryId}
                      </span>
                    </td>
                    <td className="font-semibold text-[var(--color-text)]">{formatCurrency(product.unitPrice || 0)}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="font-medium w-8">{product.quantity || 0}</span>
                        {getStockBadge(product.quantity || 0)}
                      </div>
                    </td>
                  </tr>
                )})}
                {paginatedData.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-[var(--color-text-muted)]">
                      Không tìm thấy sản phẩm phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {filteredProducts.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredProducts.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          )}
        </div>
      )}
    </ProductTableLayout>
    {pendingBulkUpdate ? (
      <ConfirmModal
        isOpen={Boolean(pendingBulkUpdate)}
        title="Xác nhận cập nhật giá"
        message={`Bạn có chắc muốn cập nhật giá cho ${pendingBulkUpdate.productIds.length} sản phẩm?`}
        onConfirm={async () => {
          await handleBulkUpdate(pendingBulkUpdate);
          setPendingBulkUpdate(null);
        }}
        onCancel={() => setPendingBulkUpdate(null)}
      />
    ) : null}
    </>
  );
}
