import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FaTruck, FaCalendarAlt, FaEdit, FaSave, FaTimes, FaSearch, FaMapMarkerAlt, FaCheckCircle, FaClock, FaBoxOpen } from "react-icons/fa";
import { toast } from "react-toastify";
import { getShippedOrders, updateShippedDate } from "../../apis/orderApi";
import formatCurrency from "../../utils/formatCurrency";
import AdminEmptyStateCard from "./components/AdminEmptyStateCard";
import ProductTableLayout from "./components/products/ProductTableLayout";
import Pagination from "../../components/ui/Pagination";

const AdminShippedOrders = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingOrder, setEditingOrder] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  const [formData, setFormData] = useState({
    shippedDate: "",
    notes: "",
  });

  useEffect(() => {
    fetchShippedOrders();
  }, []);

  const fetchShippedOrders = async () => {
    try {
      setLoading(true);
      const response = await getShippedOrders();

      if (response.EC === 1) {
        setOrders(response.DT || []);
      } else {
        toast.error(response.EM || "Failed to load shipped orders");
      }
    } catch (error) {
      console.error("Error fetching shipped orders:", error);
      toast.error("Failed to load shipped orders");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = order => {
    setEditingOrder(order.id);
    setFormData({
      shippedDate: order.shippedDate
        ? new Date(order.shippedDate).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16),
      notes: order.notes || "",
    });
  };

  const handleCancel = () => {
    setEditingOrder(null);
    setFormData({ shippedDate: "", notes: "" });
  };

  const handleSave = async orderId => {
    try {
      const updateData = {
        orderId: orderId,
        shippedDate: formData.shippedDate,
        notes: formData.notes,
      };

      const response = await updateShippedDate(updateData);

      if (response.EC === 1) {
        toast.success("Đã cập nhật thời gian giao hàng dự kiến!");
        setEditingOrder(null);
        fetchShippedOrders();
      } else {
        toast.error(response.EM || "Không thể cập nhật thời gian giao hàng");
      }
    } catch (error) {
      console.error("Error updating shipped date:", error);
      toast.error("Failed to update shipped date");
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = 
        order.id.toString().includes(searchTerm) || 
        order.userId?.toString().includes(searchTerm) ||
        (order.deliveryAddress && order.deliveryAddress.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = filterStatus === "all" || order.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, filterStatus]);

  const sortedOrders = useMemo(() => {
    return [...filteredOrders].sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
  }, [filteredOrders]);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedOrders.slice(start, start + itemsPerPage);
  }, [sortedOrders, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, itemsPerPage]);

  const toolbar = (
    <>
      <div className="relative w-full sm:w-64 max-w-full">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
        <input
          type="text"
          placeholder="Tìm theo Mã đơn, Khách hàng, Địa chỉ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="admin-input w-full pl-10 py-2 text-sm"
        />
      </div>
      <select
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
        className="admin-input py-2 text-sm"
      >
        <option value="all">Tất cả trạng thái</option>
        <option value="SHIPPED">Đang giao hàng (SHIPPED)</option>
        <option value="DELIVERED">Đã giao thành công (DELIVERED)</option>
      </select>
    </>
  );

  const getStatusVisual = (status, orderDate, shippedDate) => {
    const isDelivered = status === "DELIVERED";
    const isShipped = status === "SHIPPED" || isDelivered;
    
    return (
      <div className="relative mt-6 mb-4 px-4 hidden sm:block">
        <div className="absolute top-1/2 left-8 right-8 h-1 bg-[var(--color-border)] -translate-y-1/2 rounded-full z-0">
          <div 
            className="absolute top-0 left-0 h-full bg-[var(--color-primary)] rounded-full transition-all duration-500" 
            style={{ width: isDelivered ? '100%' : isShipped ? '50%' : '0%' }}
          ></div>
        </div>
        
        <div className="relative z-10 flex justify-between">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center shadow-md border-4 border-[var(--color-bg)]">
              <FaBoxOpen size={16} />
            </div>
            <p className="text-xs font-bold text-[var(--color-text)] mt-2">Xác nhận</p>
            <p className="text-[10px] text-[var(--color-text-muted)]">{new Date(orderDate).toLocaleDateString()}</p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md border-4 border-[var(--color-bg)] transition-colors ${isShipped ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)]'}`}>
              <FaTruck size={16} />
            </div>
            <p className={`text-xs font-bold mt-2 ${isShipped ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)]'}`}>Giao hàng</p>
            {shippedDate && <p className="text-[10px] text-[var(--color-text-muted)]">{new Date(shippedDate).toLocaleDateString()}</p>}
          </div>
          
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md border-4 border-[var(--color-bg)] transition-colors ${isDelivered ? 'bg-emerald-500 text-white' : 'bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)]'}`}>
              <FaCheckCircle size={16} />
            </div>
            <p className={`text-xs font-bold mt-2 ${isDelivered ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--color-text-muted)]'}`}>Hoàn tất</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-pageIn">
      <ProductTableLayout 
        title={t("admin.menu_shipped_orders")}
        subtitle={t("admin.shipped_orders_page_subtitle")}
        itemCount={orders.length}
        toolbar={toolbar}
      >
        {loading ? (
          <div className="grid gap-6">
            {[1, 2, 3].map((row) => (
              <div
                key={row}
                className="admin-skeleton h-48 rounded-xl border border-[var(--color-border)]"
              />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="py-12 border border-dashed border-[var(--color-border)] rounded-2xl bg-[var(--color-bg-subtle)]">
            <AdminEmptyStateCard
              icon={<FaTruck className="w-10 h-10 text-[var(--color-text-muted)] opacity-50" />}
              title={t("admin.no_shipped_orders_title")}
              description={t("admin.no_shipped_orders_description")}
            />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-12 border border-dashed border-[var(--color-border)] rounded-2xl bg-[var(--color-bg-subtle)] text-center">
            <FaSearch className="w-10 h-10 text-[var(--color-text-muted)] opacity-50 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">Không tìm thấy đơn hàng</h3>
            <p className="text-[var(--color-text-secondary)]">Hãy thử thay đổi từ khóa hoặc bộ lọc trạng thái.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {paginatedOrders.map(order => {
              const isDelivered = order.status === "DELIVERED";
              
              return (
                <div
                  key={order.id}
                  className={`admin-card rounded-[var(--radius-xl)] overflow-hidden border transition-all ${isDelivered ? 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/10 dark:bg-emerald-900/5' : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50 hover:shadow-md'}`}
                >
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2 gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <p className="text-xl font-bold text-[var(--color-text)] font-mono">
                            #{order.id}
                          </p>
                          <span className={`admin-badge ${isDelivered ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' : 'bg-[var(--color-primary-)] text-[var(--color-primary-)] border border-[var(--color-primary-)] dark:bg-[var(--color-primary-)]/30 dark:text-[var(--color-primary-)] dark:border-[var(--color-primary-)]'}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm text-[var(--color-text-secondary)] flex items-center gap-1.5">
                          <FaClock className="opacity-70" /> {new Date(order.createdDate).toLocaleString("vi-VN")}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-xs text-[var(--color-text-muted)] uppercase font-semibold tracking-wider">Tổng tiền</p>
                          <p className="text-lg font-bold text-[var(--color-primary)]">{formatCurrency(order.totalPrice)}</p>
                        </div>
                        {editingOrder !== order.id && !isDelivered && (
                          <button
                            type="button"
                            onClick={() => handleEdit(order)}
                            className="p-2.5 rounded-lg bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-subtle)] transition-colors border border-[var(--color-border)]"
                            title="Chỉnh sửa thời gian giao hàng"
                          >
                            <FaEdit size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Timeline Visual */}
                    {getStatusVisual(order.status, order.createdDate, order.shippedDate)}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-5 border-t border-[var(--color-border)]">
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-[var(--color-text-muted)] font-semibold uppercase tracking-wider mb-1">Khách hàng</p>
                          <p className="text-sm font-medium text-[var(--color-text)]">ID: #{order.userId}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[var(--color-text-muted)] font-semibold uppercase tracking-wider mb-1">Thanh toán</p>
                          <p className="text-sm font-medium text-[var(--color-text)]">{order.paymentMethod}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-[var(--color-text-muted)] font-semibold uppercase tracking-wider mb-1 flex items-center gap-1">
                            <FaMapMarkerAlt /> Địa chỉ giao hàng
                          </p>
                          <p className="text-sm text-[var(--color-text)] bg-[var(--color-bg-subtle)] p-3 rounded-lg border border-[var(--color-border)] leading-relaxed">
                            {order.deliveryAddress || "Không có thông tin địa chỉ"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {editingOrder === order.id ? (
                      <div className="mt-5 rounded-xl border border-[var(--color-primary)]/30 bg-[var(--color-primary-subtle)] p-5 space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-2 mb-2 border-b border-[var(--color-primary)]/20 pb-3">
                          <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center">
                            <FaTruck size={14} />
                          </div>
                          <h4 className="font-bold text-[var(--color-text)]">Cập nhật vận chuyển</h4>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
                              <FaCalendarAlt className="inline mr-2 opacity-80 text-[var(--color-primary)]" />
                              Thời gian dự kiến giao
                            </label>
                            <input
                              type="datetime-local"
                              value={formData.shippedDate}
                              onChange={e => setFormData({ ...formData, shippedDate: e.target.value })}
                              className="admin-input w-full bg-[var(--color-bg)]"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
                              Ghi chú vận chuyển (Tùy chọn)
                            </label>
                            <textarea
                              disabled
                              value={formData.notes}
                              onChange={e => setFormData({ ...formData, notes: e.target.value })}
                              placeholder="Thêm ghi chú vận chuyển..."
                              rows={2}
                              className="admin-input w-full bg-[var(--color-bg)] opacity-70 cursor-not-allowed"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-3">
                          <button
                            type="button"
                            onClick={handleCancel}
                            className="btn-admin-outline px-5 py-2 rounded-lg font-medium flex items-center gap-2 bg-[var(--color-bg)]"
                          >
                            <FaTimes />
                            Hủy
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSave(order.id)}
                            className="btn-admin-primary px-5 py-2 rounded-lg font-medium flex items-center gap-2 shadow-md"
                          >
                            <FaSave />
                            Lưu cập nhật
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-5 space-y-2 bg-[var(--color-bg-subtle)] p-4 rounded-xl border border-[var(--color-border)]">
                        {order.shippedDate ? (
                          <div className="flex items-center gap-2 text-sm">
                            <div className="w-6 h-6 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center shrink-0">
                              <FaCalendarAlt size={12} />
                            </div>
                            <span className="text-[var(--color-text-muted)] font-medium">
                              Dự kiến giao:
                            </span>
                            <span className="text-[var(--color-text)] font-bold">
                              {new Date(order.shippedDate).toLocaleString("vi-VN", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        ) : (
                          <p className="text-sm text-amber-600 dark:text-amber-400 italic">
                            * Chưa có thời gian giao hàng dự kiến
                          </p>
                        )}
                        {order.notes && (
                          <div className="text-sm mt-2 flex items-start gap-2 pt-2 border-t border-[var(--color-border)]/50">
                            <span className="font-semibold text-[var(--color-text)] shrink-0">Ghi chú:</span>
                            <span className="text-[var(--color-text-secondary)]">{order.notes}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filteredOrders.length > 0 && (
          <div className="mt-6 border border-[var(--color-border)] rounded-xl bg-[var(--color-bg)] overflow-hidden shadow-sm">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredOrders.length / itemsPerPage)}
              totalItems={filteredOrders.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>
        )}
      </ProductTableLayout>
    </div>
  );
};

export default AdminShippedOrders;
