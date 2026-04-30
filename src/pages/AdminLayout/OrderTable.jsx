import React, { memo, useState, useEffect } from 'react';
import { ImageOff, Search, FileDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import formatCurrency from "../../utils/formatCurrency";
import { downloadInvoice } from '../../components/Orders/InvoiceExport';

// OrderTable - Displays a list of orders with search and status update functionality
const OrderTable = memo(({ orders = [], theme = 'dark', updateOrderStatus, getOrderById }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [localOrders, setLocalOrders] = useState(orders); // State n?i b?
  const [customerNames, setCustomerNames] = useState({}); // Store customer names by userId

  // Ð?ng b? localOrders v?i orders t? props khi orders thay d?i
  useEffect(() => {
    setLocalOrders(orders);
  }, [orders]);

  // Fetch customer names when orders change
  useEffect(() => {
    const fetchCustomerNames = async () => {
      const uniqueUserIds = [...new Set(orders.map(order => order.userId).filter(Boolean))];
      const names = {};
      
      for (const userId of uniqueUserIds) {
        try {
          const response = await fetch(`/api/users/${userId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
          });
          if (response.ok) {
            const userData = await response.json();
            names[userId] = userData.fullName || userData.name || 'Unknown';
          }
        } catch (error) {
          names[userId] = 'Unknown';
        }
      }
      
      setCustomerNames(names);
    };

    if (orders.length > 0) {
      fetchCustomerNames();
    }
  }, [orders]);
  // Filter orders based on search term
  const filteredOrders = searchTerm.trim() === ''
    ? localOrders
    : localOrders.filter((order) =>
        (order.id?.toString() || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.status || '').toLowerCase().includes(searchTerm.toLowerCase())
      );

  // Define theme-based classes - Modern design
  const themeClasses = {
    dark: {
      container: 'text-gray-100',
      table: 'bg-gray-800/50 border-gray-700/50',
      tableHeader: 'bg-gray-800/80 text-gray-200',
      tableRow: 'hover:bg-gray-800/70 text-gray-200 border-b border-gray-700/30',
      secondaryText: 'text-gray-400',
      input: 'bg-gray-800/50 border-gray-600/50 text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
      emptyState: 'text-gray-400',
      select: 'bg-gray-800/50 border-gray-600/50 text-gray-200 focus:ring-2 focus:ring-blue-500',
    },
    light: {
      container: 'text-gray-900',
      table: 'bg-white border-gray-200',
      tableHeader: 'bg-gray-50 text-gray-700',
      tableRow: 'hover:bg-gray-50 text-gray-800 border-b border-gray-200',
      secondaryText: 'text-gray-600',
      input: 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
      emptyState: 'text-gray-500',
      select: 'bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500',
    },
  };

  const currentTheme = themeClasses[theme] || themeClasses.dark;

  // Determine color for status - Modern badge design
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return theme === 'dark' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'confirmed':
        return theme === 'dark' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-blue-100 text-blue-800 border-blue-300';
      case 'processing':
        return theme === 'dark' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'shipped':
        return theme === 'dark' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-green-100 text-green-800 border-green-300';
      case 'delivered':
        return theme === 'dark' ? 'bg-violet-500/20 text-violet-400 border-violet-500/30' : 'bg-violet-100 text-violet-800 border-violet-300';
      case 'cancelled':
        return theme === 'dark' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-red-100 text-red-800 border-red-300';
      case 'returned':
        return theme === 'dark' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return theme === 'dark' ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' : 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Format the order date to DD/MM/YYYY
  const formatOrderDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Handle status change
  const handleStatusChange = async (orderId, newStatus) => {
    if (!orderId) {
      console.error('Order ID is undefined');
      alert('Không th? c?p nh?t tr?ng thái: Order ID không h?p l?.');
      return;
    }

    // Luu tr?ng thái hi?n t?i d? rollback n?u c?n
    const previousOrders = [...localOrders];

    // Optimistic update: C?p nh?t giao di?n ngay l?p t?c
    setLocalOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );

    if (updateOrderStatus) {
      try {
        // G?i API d? c?p nh?t
        await updateOrderStatus(orderId, newStatus);
        // Sau khi API thành công, không c?n làm gì thêm vì useEffect s? d?ng b? v?i orders t? props
      } catch (error) {
        console.error(`Failed to update order ${orderId}:`, error);
        alert('C?p nh?t tr?ng thái th?t b?i. Vui lòng th? l?i.');
        // Rollback giao di?n v? tr?ng thái tru?c dó
        setLocalOrders(previousOrders);
      }
    }
  };

  return (
    <div className={currentTheme.container}>
      {/* Header Section - Modern design */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
          {t('admin.danh_sch_n_hng')}
        </h2>
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder={t('admin.tm_kim_n_hng')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border focus:outline-none transition-all ${currentTheme.input}`}
          />
          <Search
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${currentTheme.secondaryText}`}
            size={20}
          />
        </div>
      </div>

      {/* Empty States - Modern design */}
      {localOrders.length === 0 && (
        <div className={`flex flex-col justify-center items-center h-64 rounded-lg ${theme === 'dark' ? 'bg-gray-800/30' : 'bg-gray-50'} ${currentTheme.emptyState}`}>
          <ImageOff className="mb-3" size={48} />
          <span className="text-lg font-medium">{t('admin.khng_tm_thy_n')}</span>
        </div>
      )}

      {localOrders.length > 0 && filteredOrders.length === 0 && (
        <div className={`flex flex-col justify-center items-center h-64 rounded-lg ${theme === 'dark' ? 'bg-gray-800/30' : 'bg-gray-50'} ${currentTheme.emptyState}`}>
          <ImageOff className="mb-3" size={48} />
          <span className="text-lg font-medium">{t('remaining.khong_tim_thay_don_hang_phu_hop')}</span>
        </div>
      )}

      {/* Table - Modern design */}
      {localOrders.length > 0 && filteredOrders.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <table className={`min-w-full ${currentTheme.table}`}>
            <thead className={currentTheme.tableHeader}>
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">{t('admin.order_id')}</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">{t('admin.customer_id')}</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Customer Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">{t('admin.voucher_id')}</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">{t('admin.order_date')}</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">{t('admin.total_amount')}</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">{t('admin.status')}</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Hóa Ðon</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, index) => (
                <tr
                  key={order.id || `order-${index}`}
                  className={`transition-all duration-200 ${currentTheme.tableRow}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                    <span className="text-blue-600 dark:text-blue-400">#{order.id || 'N/A'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {order.userId || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {customerNames[order.userId] || order.customerName || order.userName || 'Loading...'}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${currentTheme.secondaryText}`}>
                    No Use
                  </td>
                  <td className={`px-6 py-4 text-sm ${currentTheme.secondaryText}`}>
                    {formatOrderDate(order.createdDate)}
                  </td>
                  <td className={`px-6 py-4 text-sm font-semibold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                    {order.totalPrice != null
                      ? formatCurrency(order.totalPrice)
                      : '0.00'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <select
                      value={order.status || 'PENDING'}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border focus:outline-none focus:ring-2 transition-all ${currentTheme.select} ${getStatusColor(order.status)}`}
                    >
                      {['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'].map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                      <option value="">-- Select Status --</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                    <button
                      onClick={() => downloadInvoice(order, customerNames[order.userId])}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium rounded-lg transition-colors border border-indigo-200"
                      title="Xu?t PDF"
                    >
                      <FileDown size={16} />
                      Xu?t
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
});

export default OrderTable;
// Updated: 2025-10-12T16:06:41.992Z

// Updated: 2025-10-12T16:09:03.270Z

