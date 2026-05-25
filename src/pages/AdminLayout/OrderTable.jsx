import React, { memo, useState, useEffect, useMemo } from "react";
import { ImageOff, Search, FileDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import formatCurrency from "../../utils/formatCurrency";
import { downloadInvoice } from "../../components/Orders/InvoiceExport";
import axiosInstance from "../../custom/axios";
import ProductTableLayout from "./components/products/ProductTableLayout";
import Pagination from "../../components/ui/Pagination";
import TableSortHeader from "../../components/ui/TableSortHeader";

const OrderTable = memo(({ orders = [], updateOrderStatus }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [localOrders, setLocalOrders] = useState(orders);
  const [customerNames, setCustomerNames] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'createdDate', direction: 'desc' });

  useEffect(() => {
    setLocalOrders(orders);
  }, [orders]);

  useEffect(() => {
    const fetchCustomerNames = async () => {
      const uniqueUserIds = [...new Set(orders.map((order) => order.userId).filter(Boolean))];
      const names = {};

      for (const userId of uniqueUserIds) {
        try {
          const { data: userData } = await axiosInstance.get(/users/);
          names[userId] = userData.fullName || userData.name || "Unknown";
        } catch {
          names[userId] = "Unknown";
        }
      }

      setCustomerNames(names);
    };

    if (orders.length > 0) {
      fetchCustomerNames();
    }
  }, [orders]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const processedOrders = useMemo(() => {
    let result = [...localOrders];

    if (searchTerm.trim()) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(
        (order) =>
          (order.id?.toString() || "").toLowerCase().includes(lowerTerm) ||
          (order.status || "").toLowerCase().includes(lowerTerm) ||
          (customerNames[order.userId] || order.customerName || order.userName || "").toLowerCase().includes(lowerTerm)
      );
    }

    if (sortConfig.key) {
      result.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        if (sortConfig.key === 'createdDate') {
          aVal = new Date(aVal || 0).getTime();
          bVal = new Date(bVal || 0).getTime();
        } else if (sortConfig.key === 'totalPrice') {
          aVal = Number(aVal) || 0;
          bVal = Number(bVal) || 0;
        } else if (sortConfig.key === 'userId') {
          aVal = customerNames[a.userId] || a.customerName || a.userName || a.userId || "";
          bVal = customerNames[b.userId] || b.customerName || b.userName || b.userId || "";
        }

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [localOrders, searchTerm, customerNames, sortConfig]);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return processedOrders.slice(start, start + itemsPerPage);
  }, [processedOrders, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-[var(--color-warning-light)] text-[var(--color-warning)] border-[var(--color-warning)]";
      case "confirmed":
      case "processing":
        return "bg-[var(--color-info-light)] text-[var(--color-info)] border-[var(--color-info)]";
      case "shipped":
      case "delivered":
        return "bg-[var(--color-success-light)] text-[var(--color-success)] border-[var(--color-success)]";
      case "cancelled":
      case "returned":
        return "bg-[var(--color-danger-light)] text-[var(--color-danger)] border-[var(--color-danger)]";
      default:
        return "bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] border-[var(--color-border)]";
    }
  };

  const formatOrderDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleStatusChange = async (orderId, newStatus) => {
    if (!orderId) {
      console.error("Order ID is undefined");
      alert("Không thể cập nhật trạng thái: Order ID không hợp lệ.");
      return;
    }

    const previousOrders = [...localOrders];

    setLocalOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );

    if (updateOrderStatus) {
      try {
        await updateOrderStatus(orderId, newStatus);
      } catch (error) {
        console.error(`Failed to update order :`, error);
        alert("Cập nhật trạng thái thất bại. Vui lòng thử lại.");
        setLocalOrders(previousOrders);
      }
    }
  };

  const toolbar = (
    <div className="relative w-full md:w-80">
      <input
        type="text"
        placeholder={t("admin.tm_kim_n_hng") || "Tìm kiếm đơn hàng..."}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="admin-input w-full pl-10 py-2"
      />
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
        size={20}
      />
    </div>
  );

  return (
    <ProductTableLayout
      title={t("admin.danh_sch_n_hng") || "Danh sách đơn hàng"}
      toolbar={toolbar}
      className="text-[var(--color-text)]"
    >
      {localOrders.length === 0 ? (
        <div className="flex flex-col justify-center items-center h-64 rounded-lg text-[var(--color-text-muted)] bg-[var(--color-bg-subtle)] border border-[var(--color-border)] border-dashed">
          <ImageOff className="mb-3 opacity-50" size={48} />
          <span className="text-lg font-medium">
            {t("admin.khng_tm_thy_n") || "Không tìm thấy đơn hàng nào"}
          </span>
        </div>
      ) : processedOrders.length === 0 ? (
        <div className="flex flex-col justify-center items-center h-64 rounded-lg text-[var(--color-text-muted)] bg-[var(--color-bg-subtle)] border border-[var(--color-border)] border-dashed">
          <Search className="mb-3 opacity-50" size={48} />
          <span className="text-lg font-medium">
            {t("remaining.khong_tim_thay_don_hang_phu_hop") || "Không tìm thấy đơn hàng phù hợp"}
          </span>
        </div>
      ) : (
        <div className="flex flex-col">
          <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)]">
            <table className="admin-table">
              <thead>
                <tr>
                  <TableSortHeader label={t("admin.order_id") || "Mã đơn"} sortKey="id" currentSort={sortConfig} onSort={handleSort} />
                  <TableSortHeader label="Khách hàng" sortKey="userId" currentSort={sortConfig} onSort={handleSort} />
                  <th>{t("admin.voucher_id") || "Voucher"}</th>
                  <TableSortHeader label={t("admin.order_date") || "Ngày đặt"} sortKey="createdDate" currentSort={sortConfig} onSort={handleSort} />
                  <TableSortHeader label={t("admin.total_amount") || "Tổng tiền"} sortKey="totalPrice" currentSort={sortConfig} onSort={handleSort} />
                  <TableSortHeader label={t("admin.status") || "Trạng thái"} sortKey="status" currentSort={sortConfig} onSort={handleSort} />
                  <th className="text-center">Hóa đơn</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((order, index) => (
                  <tr key={order.id || `order-`} className="admin-table-row">
                    <td className="whitespace-nowrap text-sm font-semibold">
                      <span className="text-[var(--color-primary)]">
                        #{order.id || "N/A"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-[var(--color-text)]">
                          {customerNames[order.userId] || order.customerName || order.userName || "Loading..."}
                        </span>
                        <span className="text-xs text-[var(--color-text-muted)]">ID: {order.userId || "N/A"}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap text-sm text-[var(--color-text-muted)]">
                      No Use
                    </td>
                    <td className="text-sm text-[var(--color-text-secondary)] whitespace-nowrap">
                      {formatOrderDate(order.createdDate)}
                    </td>
                    <td className="text-sm font-bold text-[var(--color-success)] whitespace-nowrap">
                      {order.totalPrice != null ? formatCurrency(order.totalPrice) : "0 ₫"}
                    </td>
                    <td className="whitespace-nowrap text-sm">
                      <select
                        value={order.status || "PENDING"}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`dmin-input px-3 py-1.5 text-xs font-semibold rounded-full border-opacity-30 border outline-none `}
                      >
                        {[
                          "PENDING",
                          "CONFIRMED",
                          "PROCESSING",
                          "SHIPPED",
                          "DELIVERED",
                          "CANCELLED",
                          "RETURNED",
                        ].map((status) => (
                          <option key={status} value={status} className="bg-[var(--color-bg)] text-[var(--color-text)]">
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="whitespace-nowrap text-center text-sm">
                      <button
                        type="button"
                        onClick={() => downloadInvoice(order, customerNames[order.userId])}
                        className="btn-admin-outline inline-flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg hover:bg-[var(--color-primary-subtle)]"
                        title="Xuất PDF"
                      >
                        <FileDown size={16} />
                        Xuất
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(processedOrders.length / itemsPerPage)}
            totalItems={processedOrders.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
      )}
    </ProductTableLayout>
  );
});

export default OrderTable;