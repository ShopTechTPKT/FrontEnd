import React, { memo, useState } from 'react';
import { ImageOff, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../../custom/axios';
import { useToast } from '../../components/Toast';

// Simplified CustomerTable - read-only with search functionality
const CustomerTable = memo(
  ({
    activeMenu,
    customers = [],
    theme = 'dark',
    onCustomerUpdate
  }) => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [editingStatus, setEditingStatus] = useState({});
    const { showSuccess, showError } = useToast();

    if (activeMenu !== 'Customers') return null;

    // Filter customers based on search term
    const filteredCustomers = searchTerm.trim() === ''
      ? customers
      : customers.filter((customer) =>
          (customer?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (customer?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (customer?.phoneNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
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
      },
      light: {
        container: 'text-gray-900',
        table: 'bg-white border-gray-200',
        tableHeader: 'bg-gray-50 text-gray-700',
        tableRow: 'hover:bg-gray-50 text-gray-800 border-b border-gray-200',
        secondaryText: 'text-gray-600',
        input: 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
        emptyState: 'text-gray-500',
      },
    };

    const currentTheme = themeClasses[theme] || themeClasses.dark;

    // Handle status change
    const handleStatusChange = async (customerId, newStatus) => {
      try {
        // Get current customer data - check both id and customerID
        const customer = customers.find(c => (c.id === customerId) || (c.customerID === customerId));
        if (!customer) return;
        
        // Use id or customerID for API call
        const userId = customer.id || customer.customerID;

        // Update customer with new status
        const updatedData = {
          ...customer,
          status: newStatus
        };

        const response = await axiosInstance.put(`/users/${userId}`, updatedData);
        
        if (response.data) {
          showSuccess(`✅ Đã cập nhật trạng thái khách hàng thành ${newStatus === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE'}`, 3000, 'top-right');
          const customerKey = customer.id || customer.customerID;
          setEditingStatus({ ...editingStatus, [customerKey]: false });
          
          // Callback to refresh customer list
          if (onCustomerUpdate) {
            onCustomerUpdate();
          }
        }
      } catch (error) {
        console.error('Error updating customer status:', error);
        showError('❌ Lỗi khi cập nhật trạng thái: ' + (error.response?.data?.message || error.message), 5000, 'top-right');
      }
    };

    return (
      <div className={currentTheme.container}>
        {/* Header Section - Modern design */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            {t('admin.danh_sch_khch_hng')}
          </h2>
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder={t('admin.tm_kim_khch_hng')}
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
        {customers.length === 0 && (
          <div className={`flex flex-col justify-center items-center h-64 rounded-lg ${theme === 'dark' ? 'bg-gray-800/30' : 'bg-gray-50'} ${currentTheme.emptyState}`}>
            <ImageOff className="mb-3" size={48} />
            <span className="text-lg font-medium">{t('admin.khng_tm_thy_khch')}</span>
          </div>
        )}

        {customers.length > 0 && filteredCustomers.length === 0 && (
          <div className={`flex flex-col justify-center items-center h-64 rounded-lg ${theme === 'dark' ? 'bg-gray-800/30' : 'bg-gray-50'} ${currentTheme.emptyState}`}>
            <ImageOff className="mb-3" size={48} />
            <span className="text-lg font-medium">{t('remaining.khong_tim_thay_khach_hang_phu_hop')}</span>
          </div>
        )}

        {/* Table - Modern design */}
        {customers.length > 0 && filteredCustomers.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <table className={`min-w-full ${currentTheme.table}`}>
              <thead className={currentTheme.tableHeader}>
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">{t('admin.tn_khch_hng')}</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">{t('common.email')}</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">{t('common.phone')}</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">{t('common.address')}</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer, index) => (
                  <tr
                    key={customer.customerID || `customer-${index}`}
                    className={`transition-all duration-200 ${currentTheme.tableRow}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {customer.customerID || `#${index + 1}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {customer.fullName || 'N/A'}
                    </td>
                    <td className={`px-6 py-4 text-sm ${currentTheme.secondaryText}`}>
                      {customer.email || 'N/A'}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${currentTheme.secondaryText}`}>
                      {customer.phoneNumber || 'N/A'}
                    </td>
                    <td className={`px-6 py-4 text-sm ${currentTheme.secondaryText}`}>
                      <div className="max-w-xs truncate">{customer.address || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {(() => {
                        const customerKey = customer.id || customer.customerID;
                        return editingStatus[customerKey] ? (
                          <select
                            value={customer.status || 'ACTIVE'}
                            onChange={(e) => handleStatusChange(customerKey, e.target.value)}
                            onBlur={() => setEditingStatus({ ...editingStatus, [customerKey]: false })}
                            className={`px-3 py-1 rounded border ${currentTheme.input} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            autoFocus
                          >
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="INACTIVE">INACTIVE</option>
                          </select>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              customer.status === 'ACTIVE' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                : customer.status === 'INACTIVE'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                            }`}>
                              {customer.status || 'ACTIVE'}
                            </span>
                            <button
                              onClick={() => setEditingStatus({ ...editingStatus, [customerKey]: true })}
                              className={`text-xs px-2 py-1 rounded hover:opacity-80 transition ${
                                theme === 'dark' 
                                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              Sửa
                            </button>
                          </div>
                        );
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }
);

export default CustomerTable;
// Updated: 2025-10-12T16:06:42.853Z

// Updated: 2025-10-12T16:09:06.544Z
