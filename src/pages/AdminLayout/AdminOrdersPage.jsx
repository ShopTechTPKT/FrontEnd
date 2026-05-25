import React, { useEffect, useState, useMemo } from "react";
import OrderTable from "./OrderTable";
import { getOrderById, updateOrderStatus } from "../../apis/orderApi";
import axiosInstance from "../../custom/axios";
import { toast } from "react-toastify";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [batchStatus, setBatchStatus] = useState("");

  const fetchOrders = async () => {
    const { data } = await axiosInstance.get("/orders");
    setOrders(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, status) => {
    await updateOrderStatus(orderId, status);
    fetchOrders();
  };

  // ── Batch Actions ─────────────────────────────────────────
  const handleBatchUpdate = async () => {
    if (!selectedIds.length || !batchStatus) return;
    try {
      await Promise.all(selectedIds.map((id) => updateOrderStatus(id, batchStatus)));
      toast.success(`Đã cập nhật ${selectedIds.length} đơn hàng thành ${batchStatus}`);
      setSelectedIds([]);
      setBatchStatus("");
      fetchOrders();
    } catch {
      toast.error("Lỗi cập nhật đơn hàng hàng loạt");
    }
  };

  const handleExportOrders = () => {
    if (!orders.length) return;
    const headers = ["ID", "Khách hàng", "Trạng thái", "Tổng tiền", "Ngày tạo"];
    const rows = orders.map((o) => [
      o.id,
      `"${o.customerName || o.userId || ""}"`,
      o.status,
      o.totalAmount || 0,
      o.createdAt || "",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Đã xuất ${orders.length} đơn hàng ra CSV`);
  };

  const pendingCount = useMemo(() => orders.filter((o) => o.status === "PENDING").length, [orders]);

  return (
    <div className="space-y-4 animate-pageIn">
      {/* Batch Action Bar */}
      <div className="flex flex-wrap items-center gap-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[var(--color-text)]">
            {orders.length} đơn hàng
          </span>
          {pendingCount > 0 && (
            <span className="admin-badge bg-amber-100 text-amber-700">
              {pendingCount} chờ xử lý
            </span>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 bg-[var(--color-primary-subtle)] border border-[var(--color-primary)]/20 px-3 py-1.5 rounded-lg">
              <span className="text-xs font-semibold text-[var(--color-primary)]">{selectedIds.length} đã chọn</span>
              <select
                value={batchStatus}
                onChange={(e) => setBatchStatus(e.target.value)}
                className="admin-input py-1 text-xs h-7 min-w-[120px]"
              >
                <option value="">Chọn trạng thái</option>
                <option value="CONFIRMED">Xác nhận</option>
                <option value="PROCESSING">Đang xử lý</option>
                <option value="SHIPPED">Đã gửi hàng</option>
                <option value="DELIVERED">Đã giao</option>
                <option value="CANCELLED">Hủy</option>
              </select>
              <button onClick={handleBatchUpdate} disabled={!batchStatus} className="btn-admin-primary px-3 py-1 text-xs h-7 disabled:opacity-50">
                Áp dụng
              </button>
            </div>
          )}

          <button onClick={handleExportOrders} className="btn-admin-outline px-3 py-1.5 rounded-lg text-sm h-9 flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Xuất CSV
          </button>
        </div>
      </div>

      <OrderTable
        orders={orders}
        theme={document.documentElement.classList.contains("dark") ? "dark" : "light"}
        updateOrderStatus={handleUpdateStatus}
        getOrderById={getOrderById}
        selectedIds={selectedIds}
        onSelectIds={setSelectedIds}
      />
    </div>
  );
}
