import React, { memo, useState, useEffect, useCallback, useMemo } from "react";
import { ImageOff, Search, UserCheck, UserX, UserSearch } from "lucide-react";
import { useTranslation } from "react-i18next";
import axiosInstance from "../../custom/axios";
import { fetchAllCustomers } from "../../apis/adminApi";
import { useToast } from "../../components/Toast";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import Pagination from "../../components/ui/Pagination";
import TableSortHeader from "../../components/ui/TableSortHeader";
import ProductTableLayout from "./components/products/ProductTableLayout";

const CustomerTable = memo((props) => {
  const {
    activeMenu,
    customers: customersProp,
    onCustomerUpdate,
  } = props;
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingStatus, setEditingStatus] = useState({});
  const { showSuccess, showError } = useToast();

  const hasInjectedList = customersProp !== undefined;
  const [fetchedCustomers, setFetchedCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(!hasInjectedList);

  // Pagination & Sort
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "desc" });

  useEffect(() => {
    if (hasInjectedList) return undefined;
    let cancelled = false;
    (async () => {
      setLoadingCustomers(true);
      try {
        const data = await fetchAllCustomers();
        if (!cancelled) setFetchedCustomers(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setFetchedCustomers([]);
      } finally {
        if (!cancelled) setLoadingCustomers(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hasInjectedList]);

  const refreshCustomers = useCallback(async () => {
    if (hasInjectedList) return;
    try {
      const data = await fetchAllCustomers();
      setFetchedCustomers(Array.isArray(data) ? data : []);
    } catch {
      setFetchedCustomers([]);
    }
  }, [hasInjectedList]);

  const customers = hasInjectedList ? customersProp ?? [] : fetchedCustomers;

  if (
    activeMenu !== undefined &&
    activeMenu !== null &&
    activeMenu !== "Customers"
  ) {
    return null;
  }

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const filteredCustomers = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return customers.filter(
      (customer) =>
        (customer?.fullName || "").toLowerCase().includes(searchLower) ||
        (customer?.email || "").toLowerCase().includes(searchLower) ||
        (customer?.phoneNumber || "").toLowerCase().includes(searchLower) ||
        (customer?.id || customer?.customerID || "").toString().includes(searchLower)
    );
  }, [customers, searchTerm]);

  const sortedCustomers = useMemo(() => {
    const sortable = [...filteredCustomers];
    if (sortConfig.key) {
      sortable.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        
        // Handle alias mapping
        if (sortConfig.key === 'id') {
          aVal = a.id || a.customerID;
          bVal = b.id || b.customerID;
        }
        
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [filteredCustomers, sortConfig]);

  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedCustomers.slice(start, start + itemsPerPage);
  }, [sortedCustomers, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  const handleStatusChange = async (customerId, newStatus) => {
    try {
      const customer = customers.find(
        (c) => c.id === customerId || c.customerID === customerId
      );
      if (!customer) return;

      const userId = customer.id || customer.customerID;
      const updatedData = {
        ...customer,
        status: newStatus,
      };

      const response = await axiosInstance.put(`/users/${userId}`, updatedData);

      if (response.data) {
        showSuccess(
          `Đã cập nhật trạng thái khách hàng thành ${newStatus === "ACTIVE" ? "ACTIVE" : "INACTIVE"}`,
          3000,
          "top-right"
        );
        const customerKey = customer.id || customer.customerID;
        setEditingStatus({ ...editingStatus, [customerKey]: false });

        if (onCustomerUpdate) {
          onCustomerUpdate();
        } else {
          await refreshCustomers();
        }
      }
    } catch (error) {
      console.error("Error updating customer status:", error);
      showError(
        "Lỗi khi cập nhật trạng thái: " +
          (error.response?.data?.message || error.message),
        5000,
        "top-right"
      );
    }
  };

  const getInitials = (name) => {
    if (!name) return 'KH';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const toolbar = (
    <div className="relative w-full sm:w-80">
      <input
        type="text"
        placeholder={t("admin.tm_kim_khch_hng")}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="admin-input w-full pl-10 py-2"
      />
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
        size={18}
      />
    </div>
  );

  return (
    <ProductTableLayout
      title={t("admin.danh_sch_khch_hng")}
      subtitle="Quản lý thông tin và tài khoản người dùng"
      itemCount={customers.length}
      toolbar={toolbar}
      className="text-[var(--color-text)] space-y-4"
    >
      {loadingCustomers && customers.length === 0 ? (
        <div className="space-y-3 py-2" aria-busy="true">
          {[1, 2, 3, 4, 5, 6].map((row) => (
            <div
              key={row}
              className="admin-skeleton h-14 rounded-xl border border-[var(--color-border)]"
            />
          ))}
        </div>
      ) : !loadingCustomers && customers.length === 0 ? (
        <div className="flex flex-col justify-center items-center h-64 rounded-xl bg-[var(--color-bg-muted)] border border-[var(--color-border)] border-dashed">
          <UserSearch className="mb-4 text-[var(--color-text-muted)] opacity-50" size={48} />
          <EmptyState title={t("admin.khng_tm_thy_khch")} className="py-0" />
        </div>
      ) : !loadingCustomers && filteredCustomers.length === 0 ? (
        <div className="flex flex-col justify-center items-center h-64 rounded-xl bg-[var(--color-bg-muted)] border border-[var(--color-border)] border-dashed">
          <UserSearch className="mb-4 text-[var(--color-text-muted)] opacity-50" size={48} />
          <EmptyState title={t("remaining.khong_tim_thay_khach_hang_phu_hop")} className="py-0" />
        </div>
      ) : (
        <div className="flex flex-col rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="admin-table w-full">
              <thead>
                <tr>
                  <th className="w-16 text-center">Khách hàng</th>
                  <TableSortHeader label={t("admin.tn_khch_hng")} sortKey="fullName" currentSort={sortConfig} onSort={handleSort} />
                  <TableSortHeader label={t("common.email")} sortKey="email" currentSort={sortConfig} onSort={handleSort} />
                  <TableSortHeader label={t("common.phone")} sortKey="phoneNumber" currentSort={sortConfig} onSort={handleSort} />
                  <th className="max-w-[200px] truncate">{t("common.address")}</th>
                  <TableSortHeader label="Trạng thái" sortKey="status" currentSort={sortConfig} onSort={handleSort} className="text-right pr-6" />
                </tr>
              </thead>
              <tbody>
                {paginatedCustomers.map((customer, index) => {
                  const customerKey = customer.customerID ?? customer.id ?? `customer-${index}`;
                  return (
                  <tr key={customerKey} className="admin-table-row">
                    <td className="w-16 text-center pl-4 py-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-[var(--color-primary-)] text-indigo-700 flex items-center justify-center font-bold text-sm mx-auto shadow-sm">
                        {getInitials(customer.fullName)}
                      </div>
                    </td>
                    <td>
                      <div className="font-semibold text-[var(--color-text)]">{customer.fullName || "N/A"}</div>
                      <div className="text-xs text-[var(--color-text-muted)] font-mono mt-0.5">ID: #{customerKey}</div>
                    </td>
                    <td className="text-[var(--color-text-secondary)]">{customer.email || "N/A"}</td>
                    <td className="text-[var(--color-text-secondary)]">{customer.phoneNumber || "N/A"}</td>
                    <td className="text-[var(--color-text-secondary)]">
                      <div className="max-w-[200px] truncate" title={customer.address}>
                        {customer.address || "N/A"}
                      </div>
                    </td>
                    <td className="text-right pr-6">
                      {editingStatus[customerKey] ? (
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={customer.status || "ACTIVE"}
                            onChange={(e) => handleStatusChange(customerKey, e.target.value)}
                            onBlur={() => setEditingStatus({ ...editingStatus, [customerKey]: false })}
                            className="admin-input px-2 py-1 text-sm rounded-md w-32"
                            autoFocus
                          >
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="INACTIVE">INACTIVE</option>
                          </select>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-3">
                          <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide flex items-center gap-1 w-fit ${
                            customer.status === "ACTIVE"
                              ? "bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:border-green-800"
                              : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:border-red-800"
                          }`}>
                            {customer.status === "ACTIVE" ? <UserCheck size={12} /> : <UserX size={12} />}
                            {customer.status || "ACTIVE"}
                          </span>
                          <button
                            onClick={() => setEditingStatus({ ...editingStatus, [customerKey]: true })}
                            className="text-[var(--color-primary)] hover:text-[var(--color-primary-)] text-sm font-medium transition-colors"
                          >
                            Sửa
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
          
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredCustomers.length / itemsPerPage)}
            totalItems={filteredCustomers.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
      )}
    </ProductTableLayout>
  );
});

export default CustomerTable;
