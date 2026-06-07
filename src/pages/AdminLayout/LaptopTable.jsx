import React, { memo, useState, useEffect, useCallback, useMemo } from "react";
import { ImageOff, Search, Plus, Pencil, Trash2, LayoutGrid, List } from "lucide-react";
import { useTranslation } from "react-i18next";
import formatCurrency from "../../utils/formatCurrency";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/ui/Pagination";
import TableSortHeader from "../../components/ui/TableSortHeader";
import { useProductCRUD, CATEGORY_IDS } from "./hooks/useProductCRUD";
import LaptopForm, {
  CATEGORY_BRAND_MAPPING,
} from "./components/forms/LaptopForm";
import ProductTableLayout from "./components/products/ProductTableLayout";

const LaptopTable = memo(() => {
  const { t } = useTranslation();
  const { performOperation } = useProductCRUD();
  const [laptops, setLaptops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("list"); // 'list' | 'grid'
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Sort
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "desc" });
  
  // Bulk selection
  const [selectedIds, setSelectedIds] = useState([]);

  const [formState, setFormState] = useState({
    isOpen: false,
    currentLaptop: null,
    type: "add",
  });

  const fetchLaptops = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/products", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        const laptopIds = CATEGORY_IDS.laptop;
        setLaptops(data.filter((p) => laptopIds.includes(p.categoryId)));
      }
    } catch {
      /* keep list empty on failure */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLaptops();
  }, [fetchLaptops]);

  const handleSave = async (formData) => {
    const op = formState.type === "add" ? "create" : "update";
    const id =
      formState.currentLaptop?.id || formState.currentLaptop?.productID;
    await performOperation(op, "laptop", formData, id);
    setFormState({ isOpen: false, currentLaptop: null, type: "add" });
    fetchLaptops();
  };
  
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(paginatedData.map(l => l.id || l.productID));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (e, id) => {
    if (e.target.checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  // 1. Filter
  const filteredData = useMemo(() => {
    return laptops.filter(
      (l) =>
        l.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.id || l.productID)?.toString().includes(searchTerm)
    );
  }, [laptops, searchTerm]);

  // 2. Sort
  const sortedData = useMemo(() => {
    const sortableItems = [...filteredData];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        // Handle alias mapping
        if (sortConfig.key === 'id') {
          aValue = a.id || a.productID;
          bValue = b.id || b.productID;
        } else if (sortConfig.key === 'unitPrice') {
          aValue = Number(aValue) || 0;
          bValue = Number(bValue) || 0;
        } else if (sortConfig.key === 'quantity') {
          aValue = Number(aValue) || 0;
          bValue = Number(bValue) || 0;
        } else if (sortConfig.key === 'brand') {
          aValue = CATEGORY_BRAND_MAPPING[a.categoryId] || "";
          bValue = CATEGORY_BRAND_MAPPING[b.categoryId] || "";
        }

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredData, sortConfig]);

  // 3. Paginate
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [searchTerm, itemsPerPage]);
  
  const getStockBadge = (quantity) => {
    if (quantity <= 0) return <span className="admin-badge bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Hết hàng</span>;
    if (quantity <= 5) return <span className="admin-badge bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Sắp hết ({quantity})</span>;
    return <span className="admin-badge bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Còn hàng</span>;
  };

  const toolbar = (
    <>
      {selectedIds.length > 0 ? (
        <div className="flex items-center gap-2 bg-[var(--color-primary-)] dark:bg-[var(--color-primary-)]/20 px-3 py-1.5 rounded-lg border border-[var(--color-primary-)] dark:border-[var(--color-primary-)]">
          <span className="text-sm font-medium text-[var(--color-primary-)] dark:text-[var(--color-primary-)]">{selectedIds.length} đã chọn</span>
          <div className="h-4 w-px bg-[var(--color-primary-)] dark:bg-[var(--color-primary-)] mx-1"></div>
          <button className="text-red-500 hover:text-red-700 p-1 rounded transition-colors" title="Xóa đã chọn">
            <Trash2 size={16} />
          </button>
        </div>
      ) : (
        <Button
          onClick={() =>
            setFormState({ isOpen: true, currentLaptop: null, type: "add" })
          }
          variant="primary"
          icon={<Plus size={18} />}
        >
          {t("admin.thm")}
        </Button>
      )}
      
      <div className="relative w-full sm:w-64">
        <input
          type="text"
          placeholder={t("admin.tm_kim_my_tnh")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="admin-input w-full pl-10 py-2"
        />
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
          size={18}
        />
      </div>
    </>
  );
  
  const viewToggle = (
    <div className="flex items-center bg-[var(--color-bg-subtle)] border border-[var(--color-border)] rounded-lg p-0.5">
      <button 
        onClick={() => setViewMode("list")}
        className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-[var(--color-bg)] shadow-sm text-[var(--color-primary)]" : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"}`}
        title="List view"
      >
        <List size={16} />
      </button>
      <button 
        onClick={() => setViewMode("grid")}
        className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-[var(--color-bg)] shadow-sm text-[var(--color-primary)]" : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"}`}
        title="Grid view"
      >
        <LayoutGrid size={16} />
      </button>
    </div>
  );

  return (
    <ProductTableLayout 
      title={t("admin.menu_laptops")} 
      subtitle="Quản lý danh sách máy tính xách tay"
      itemCount={laptops.length}
      toolbar={toolbar}
      viewToggle={viewToggle}
    >
      {loading ? (
        <div className="space-y-3 py-2" aria-busy="true">
          {[1, 2, 3, 4, 5, 6].map((row) => (
            <div
              key={row}
              className="admin-skeleton h-14 rounded-xl border border-[var(--color-border)]"
            />
          ))}
        </div>
      ) : laptops.length === 0 ? (
        <EmptyState title="Không tìm thấy laptop" />
      ) : (
        <div className="flex flex-col rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] shadow-sm overflow-hidden">
          {viewMode === "list" ? (
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
                    <th>{t("admin.hnh_nh")}</th>
                    <TableSortHeader label={t("admin.tn_sn_phm")} sortKey="name" currentSort={sortConfig} onSort={handleSort} />
                    <TableSortHeader label={t("product.price")} sortKey="unitPrice" currentSort={sortConfig} onSort={handleSort} />
                    <TableSortHeader label={t("admin.tn_kho")} sortKey="quantity" currentSort={sortConfig} onSort={handleSort} />
                    <TableSortHeader label={t("admin.hng")} sortKey="brand" currentSort={sortConfig} onSort={handleSort} />
                    <th className="text-right pr-6">{t("common.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((laptop) => {
                    const id = laptop.id || laptop.productID;
                    const isSelected = selectedIds.includes(id);
                    return (
                    <tr
                      key={id}
                      className={`admin-table-row transition-colors ${isSelected ? 'bg-[var(--color-primary-)]/50 dark:bg-[var(--color-primary-)]/10' : ''}`}
                    >
                      <td className="w-12 text-center pl-4">
                        <input 
                          type="checkbox" 
                          className="rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] bg-[var(--color-bg)]"
                          checked={isSelected}
                          onChange={(e) => handleSelectOne(e, id)}
                        />
                      </td>
                      <td>
                        {laptop.imageUrl ? (
                          <div className="w-12 h-12 rounded-lg border border-[var(--color-border)] overflow-hidden bg-[var(--color-bg)] group relative">
                            <img
                              src={laptop.imageUrl}
                              alt={laptop.name}
                              className="w-full h-full object-contain p-1 group-hover:scale-110 transition-transform"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-subtle)] flex items-center justify-center text-[var(--color-text-muted)]">
                            <ImageOff size={20} />
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="font-medium text-[var(--color-text)]">{laptop.name}</div>
                        <div className="text-xs text-[var(--color-text-muted)] mt-0.5">ID: #{id}</div>
                      </td>
                      <td className="font-semibold text-[var(--color-text)]">{formatCurrency(laptop.unitPrice)}</td>
                      <td>
                        <div className="flex flex-col items-start gap-1">
                          <span className="font-medium">{laptop.quantity}</span>
                          {getStockBadge(laptop.quantity)}
                        </div>
                      </td>
                      <td>
                        <span className="px-2.5 py-1 bg-[var(--color-bg-muted)] rounded-md text-xs font-medium text-[var(--color-text-secondary)]">
                          {CATEGORY_BRAND_MAPPING[laptop.categoryId] || "N/A"}
                        </span>
                      </td>
                      <td className="text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() =>
                              setFormState({
                                isOpen: true,
                                currentLaptop: laptop,
                                type: "edit",
                              })
                            }
                            className="p-1.5 rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-subtle)] hover:text-[var(--color-primary)] transition-colors"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {paginatedData.map((laptop) => {
                const id = laptop.id || laptop.productID;
                const isSelected = selectedIds.includes(id);
                return (
                  <div key={id} className={`group relative bg-[var(--color-bg)] border rounded-xl overflow-hidden transition-all hover:shadow-md ${isSelected ? 'border-[var(--color-primary)] ring-1 ring-[var(--color-primary)]' : 'border-[var(--color-border)]'}`}>
                    <div className="absolute top-2 left-2 z-10">
                      <input 
                        type="checkbox" 
                        className="rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] shadow-sm bg-[var(--color-bg)]"
                        checked={isSelected}
                        onChange={(e) => handleSelectOne(e, id)}
                      />
                    </div>
                    <div className="absolute top-2 right-2 z-10">
                      {getStockBadge(laptop.quantity)}
                    </div>
                    
                    <div className="aspect-square bg-[var(--color-bg)] border-b border-[var(--color-border)] p-4 flex items-center justify-center">
                      {laptop.imageUrl ? (
                        <img src={laptop.imageUrl} alt={laptop.name} className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <ImageOff size={40} className="text-[var(--color-text-muted)] opacity-50" />
                      )}
                    </div>
                    
                    <div className="p-3">
                      <p className="text-xs text-[var(--color-text-muted)] mb-1">{CATEGORY_BRAND_MAPPING[laptop.categoryId] || "Unknown Brand"}</p>
                      <h3 className="text-sm font-semibold text-[var(--color-text)] line-clamp-2 mb-2 min-h-[2.5rem]" title={laptop.name}>{laptop.name}</h3>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="font-bold text-[var(--color-primary)]">{formatCurrency(laptop.unitPrice)}</span>
                        <button
                          onClick={() => setFormState({ isOpen: true, currentLaptop: laptop, type: "edit" })}
                          className="p-1.5 rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-subtle)] hover:text-[var(--color-primary)] transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredData.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
      )}

      {formState.isOpen && (
        <LaptopForm
          computer={formState.currentLaptop}
          onSave={handleSave}
          onCancel={() =>
            setFormState({
              isOpen: false,
              currentLaptop: null,
              type: "add",
            })
          }
          formTitle={
            formState.type === "add" ? "Thêm Laptop" : "Sửa Laptop"
          }
        />
      )}
    </ProductTableLayout>
  );
});

export default LaptopTable;
