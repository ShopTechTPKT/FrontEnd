import { useState } from 'react';
import { FaUsers, FaUserShield, FaEnvelope, FaPhone, FaEdit, FaTrash, FaPlus, FaSearch, FaStar } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const CustomerManagement = () => {
  const { t } = useTranslation();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState('all');

  const customers = [
    {
      id: 'CUST-001',
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@email.com',
      phone: '0901234567',
      address: '123 Đường ABC, Q1, TP.HCM',
      tier: t('customer.vip'),
      totalOrders: 15,
      totalSpent: 45000000,
      joinDate: '2023-01-15',
      lastOrder: '2025-10-10',
      status: 'active'
    },
    {
      id: 'CUST-002',
      name: 'Trần Thị B',
      email: 'tranthib@email.com',
      phone: '0907654321',
      address: '456 Đường XYZ, Q3, TP.HCM',
      tier: t('customer.gold'),
      totalOrders: 8,
      totalSpent: 28000000,
      joinDate: '2023-06-20',
      lastOrder: '2025-10-08',
      status: 'active'
    },
    {
      id: 'CUST-003',
      name: 'Lê Văn C',
      email: 'levanc@email.com',
      phone: '0912345678',
      address: '789 Đường DEF, Q5, TP.HCM',
      tier: t('customer.silver'),
      totalOrders: 4,
      totalSpent: 12000000,
      joinDate: '2024-03-10',
      lastOrder: '2025-09-25',
      status: 'active'
    },
    {
      id: 'CUST-004',
      name: 'Phạm Thị D',
      email: 'phamthid@email.com',
      phone: '0923456789',
      address: '321 Đường GHI, Q7, TP.HCM',
      tier: t('customer.regular'),
      totalOrders: 2,
      totalSpent: 5500000,
      joinDate: '2024-08-05',
      lastOrder: '2025-08-15',
      status: 'active'
    },
    {
      id: 'CUST-005',
      name: 'Hoàng Văn E',
      email: 'hoangvane@email.com',
      phone: '0934567890',
      address: '654 Đường JKL, Q10, TP.HCM',
      tier: t('customer.vip'),
      totalOrders: 20,
      totalSpent: 65000000,
      joinDate: '2022-11-12',
      lastOrder: '2025-10-12',
      status: 'active'
    },
    {
      id: 'CUST-006',
      name: 'Vũ Thị F',
      email: 'vuthif@email.com',
      phone: '0945678901',
      address: '987 Đường MNO, Q2, TP.HCM',
      tier: t('customer.regular'),
      totalOrders: 1,
      totalSpent: 3200000,
      joinDate: '2024-09-20',
      lastOrder: '2024-09-22',
      status: 'inactive'
    }
  ];

  const tierConfig = {
    all: { label: t('customer.all_customers'), color: 'gray', icon: FaUsers },
    VIP: { label: t('customer.vip'), color: 'purple', icon: FaStar },
    Gold: { label: t('customer.gold'), color: 'yellow', icon: FaStar },
    Silver: { label: t('customer.silver'), color: 'gray', icon: FaStar },
    Regular: { label: t('customer.regular'), color: 'blue', icon: FaUsers }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesTier = filterTier === 'all' || customer.tier === filterTier;
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTier && matchesSearch;
  });

  const getTierBadge = (tier) => {
    const colors = {
      VIP: 'bg-gradient-to-r from-[var(--color-primary-)] to-[var(--color-primary-)] text-white',
      Gold: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white',
      Silver: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white',
      Regular: 'bg-gradient-to-r from-[var(--color-primary-)] to-[var(--color-primary-)] text-white'
    };

    return (
      <span className={`px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${colors[tier]}`}>
        <FaStar />
        {tier}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const config = {
      active: { label: t('common.active'), color: 'bg-green-100 text-green-800 border-green-300' },
      inactive: { label: t('common.inactive'), color: 'bg-red-100 text-red-800 border-red-300' }
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${config[status].color}`}>
        {config[status].label}
      </span>
    );
  };

  return (
    <div className="animate-pageIn pb-10">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <FaUsers className="text-6xl mb-4 text-[var(--color-primary-)]" />
              <h1 className="text-5xl font-bold mb-3">{t('customer.customer_management')}</h1>
              <p className="text-xl text-[var(--color-primary-)]">{t('customer.manage_your_customer_database')}</p>
            </div>
            <button type="button" className="bg-white text-[var(--color-primary-)] px-8 py-4 rounded-xl font-bold hover:scale-105 transition-transform shadow-lg flex items-center gap-2">
              <FaPlus />
              Add New Customer
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-0 z-30 admin-header-glass border-b border-[var(--color-border)] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-wrap gap-3 mb-6">
            {Object.entries(tierConfig).map(([key, config]) => {
              const Icon = config.icon;
              const count = key === 'all' ? customers.length : customers.filter(c => c.tier === key).length;
              return (
                <button
                  key={key}
                  onClick={() => setFilterTier(key)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                    filterTier === key
                      ? 'bg-gradient-to-r from-[var(--color-primary-)] to-[var(--color-primary-)] text-white shadow-lg scale-105'
                      : 'bg-[var(--color-bg)] text-[var(--color-text)] border-2 border-[var(--color-border)] hover:border-[var(--color-primary-)]'
                  }`}
                >
                  <Icon />
                  {config.label} ({count})
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder={t('customer.search_by_name_email')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-input w-full pl-12 pr-4 py-3 rounded-[var(--radius-lg)] dark:bg-gray-900 dark:border-gray-700"
            />
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)] shadow-lg">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('admin.customer_id')}</th>
                <th>{t('customer.name')}</th>
                <th>{t('customer.contact')}</th>
                <th>{t('customer.tier')}</th>
                <th>{t('customer.orders')}</th>
                <th>{t('customer.total_spent')}</th>
                <th>{t('admin.status')}</th>
                <th className="text-center">{t('customer.actions')}</th>
              </tr>
            </thead>
            <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="admin-table-row">
                    <td>
                      <span className="font-bold text-[var(--color-primary)]">{customer.id}</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-primary-)] to-[var(--color-primary-)] rounded-full flex items-center justify-center text-white font-bold">
                          {customer.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--color-text)]">{customer.name}</p>
                          <p className="text-xs text-[var(--color-text-muted)]">Joined {new Date(customer.joinDate).toLocaleDateString('vi-VN')}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-[var(--color-text)]">
                          <FaEnvelope className="text-[var(--color-primary-)]" />
                          {customer.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[var(--color-text)]">
                          <FaPhone className="text-[var(--color-primary-)]" />
                          {customer.phone}
                        </div>
                      </div>
                    </td>
                    <td>
                      {getTierBadge(customer.tier)}
                    </td>
                    <td>
                      <span className="font-bold text-[var(--color-text)]">{customer.totalOrders}</span>
                      <p className="text-xs text-[var(--color-text-muted)]">Last: {new Date(customer.lastOrder).toLocaleDateString('vi-VN')}</p>
                    </td>
                    <td>
                      <span className="font-bold text-[var(--color-text)]">
                        {customer.totalSpent.toLocaleString('vi-VN')}₫
                      </span>
                    </td>
                    <td>
                      {getStatusBadge(customer.status)}
                    </td>
                    <td>
                      <div className="flex items-center justify-center gap-2">
                        <button type="button" className="p-2 btn-admin-outline rounded-lg">
                          <FaEdit />
                        </button>
                        <button type="button" className="p-2 btn-admin-primary bg-red-600 hover:bg-red-700 border-0 rounded-lg">
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <FaUsers className="text-6xl text-[var(--color-text-muted)] mx-auto mb-4 opacity-60" />
            <h3 className="text-2xl font-bold text-[var(--color-text)] mb-2">{t('customer.no_customers_found')}</h3>
            <p className="text-[var(--color-text-secondary)]">{t('customer.try_adjusting_your_filters')}</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-[var(--color-primary-)] to-[var(--color-primary-)] text-white p-6 rounded-2xl shadow-lg">
            <FaUsers className="text-4xl mb-3" />
            <p className="text-3xl font-bold">{customers.length}</p>
            <p className="text-[var(--color-primary-)]">{t('customer.total_customers')}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg">
            <FaUserShield className="text-4xl mb-3" />
            <p className="text-3xl font-bold">{customers.filter(c => c.tier === t('customer.vip')).length}</p>
            <p className="text-green-100">{t('customer.vip_customers')}</p>
          </div>
          <div className="bg-gradient-to-br from-[var(--color-primary-)] to-[var(--color-primary-)] text-white p-6 rounded-2xl shadow-lg">
            <FaStar className="text-4xl mb-3" />
            <p className="text-3xl font-bold">{customers.filter(c => c.status === 'active').length}</p>
            <p className="text-[var(--color-primary-)]">{t('customer.active_customers')}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-2xl shadow-lg">
            <FaStar className="text-4xl mb-3" />
            <p className="text-3xl font-bold">
              {customers.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString('vi-VN')}₫
            </p>
            <p className="text-yellow-100">{t('admin.total_revenue')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerManagement;
