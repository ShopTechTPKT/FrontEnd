import React, { useState, useEffect, useMemo } from 'react';
import { FaUserTie, FaHeadphones, FaSearch, FaEnvelope, FaPhone, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaList, FaLayoutGrid } from 'react-icons/fa';
import { LayoutGrid, List } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fetchCustomerServiceStaff } from '../../apis/adminApi';
import Pagination from '../../components/ui/Pagination';
import TableSortHeader from '../../components/ui/TableSortHeader';

const CustomerServiceStaff = () => {
  const { t } = useTranslation();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      setLoading(true);
      const data = await fetchCustomerServiceStaff();
      setStaff(data || []);
    } catch (error) {
      console.error('Error loading customer service staff:', error);
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const filteredStaff = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return staff.filter(member => {
      return (
        (member.fullName && member.fullName.toLowerCase().includes(searchLower)) ||
        (member.email && member.email.toLowerCase().includes(searchLower)) ||
        (member.phoneNumber && member.phoneNumber.includes(searchTerm)) ||
        (member.id && member.id.toString().includes(searchTerm))
      );
    });
  }, [staff, searchTerm]);

  const sortedStaff = useMemo(() => {
    const sortable = [...filteredStaff];
    if (sortConfig.key) {
      sortable.sort((a, b) => {
        let aVal = a[sortConfig.key] || '';
        let bVal = b[sortConfig.key] || '';
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [filteredStaff, sortConfig]);

  const paginatedStaff = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedStaff.slice(start, start + itemsPerPage);
  }, [sortedStaff, currentPage, itemsPerPage]);

  const getStatusBadge = (status) => {
    const isActive = status === 'ACTIVE';
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 w-fit ${
        isActive 
          ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
          : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:border-red-800'
      }`}>
        {isActive ? <><FaCheckCircle size={10} /> {t('common.active')}</> : <><FaTimesCircle size={10} /> {t('common.inactive')}</>}
      </span>
    );
  };

  const getInitials = (name) => {
    if (!name) return 'CS';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-pageIn min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[var(--color-bg)] p-6 rounded-2xl shadow-sm border border-[var(--color-border)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary-)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-primary-)] to-[var(--color-primary-)] flex items-center justify-center text-white shadow-lg shadow-[var(--color-primary-)]/50">
            <FaHeadphones size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text)]">
              {t('admin.customer_service_staff') || 'Chăm Sóc Khách Hàng'}
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {t('admin.manage_customer_service_team') || 'Quản lý đội ngũ hỗ trợ trực tuyến'}
            </p>
          </div>
        </div>
        <div className="bg-[var(--color-bg-subtle)] px-6 py-3 rounded-xl border border-[var(--color-border)] flex flex-col items-center min-w-[120px] relative z-10">
          <span className="text-xs text-[var(--color-text-muted)] font-medium uppercase tracking-wider">Tổng số</span>
          <span className="text-2xl font-bold text-[var(--color-primary)]">{staff.length}</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 bg-[var(--color-bg)] p-4 rounded-xl border border-[var(--color-border)] shadow-sm">
        <div className="relative flex-1 max-w-md">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder={t('admin.search_by_name_email_phone') || 'Tìm kiếm theo tên, email, số điện thoại...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-input w-full pl-9 py-2 text-sm"
          />
        </div>
        <div className="flex items-center bg-[var(--color-bg-subtle)] border border-[var(--color-border)] rounded-lg p-1">
          <button 
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-[var(--color-bg)] shadow-sm text-[var(--color-primary)]" : "text-[var(--color-text-muted)]"}`}
          >
            <List size={18} />
          </button>
          <button 
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-[var(--color-bg)] shadow-sm text-[var(--color-primary)]" : "text-[var(--color-text-muted)]"}`}
          >
            <LayoutGrid size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="admin-skeleton h-48 rounded-2xl border border-[var(--color-border)]" />
          ))}
        </div>
      ) : staff.length === 0 ? (
        <div className="admin-card p-12 flex flex-col items-center justify-center text-center rounded-2xl border-dashed">
          <div className="w-16 h-16 rounded-full bg-[var(--color-bg-subtle)] flex items-center justify-center mb-4 text-[var(--color-text-muted)]">
            <FaUserTie size={24} />
          </div>
          <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">Không tìm thấy nhân viên</h3>
          <p className="text-[var(--color-text-secondary)]">Không có nhân viên CSKH nào phù hợp với tìm kiếm.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {paginatedStaff.map((member) => (
                <div key={member.id} className="admin-card p-0 rounded-2xl overflow-hidden hover:shadow-lg transition-all group border border-[var(--color-border)]">
                  <div className="bg-[var(--color-bg-subtle)] p-6 text-center relative border-b border-[var(--color-border)]">
                    <div className="absolute top-4 right-4">
                      {getStatusBadge(member.status)}
                    </div>
                    <div className="w-20 h-20 bg-gradient-to-br from-[var(--color-primary-)] to-[var(--color-primary-)] rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3 shadow-md ring-4 ring-white dark:ring-gray-800">
                      {getInitials(member.fullName)}
                    </div>
                    <h3 className="font-bold text-lg text-[var(--color-text)]">{member.fullName || 'N/A'}</h3>
                    <p className="text-xs text-[var(--color-text-muted)] font-mono">ID: #{member.id}</p>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="space-y-3">
                      {member.email && (
                        <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
                          <FaEnvelope className="text-[var(--color-text-muted)] shrink-0" />
                          <span className="truncate">{member.email}</span>
                        </div>
                      )}
                      {member.phoneNumber && (
                        <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
                          <FaPhone className="text-[var(--color-text-muted)] shrink-0" />
                          <span>{member.phoneNumber}</span>
                        </div>
                      )}
                      {member.address && (
                        <div className="flex items-start gap-3 text-sm text-[var(--color-text-secondary)]">
                          <FaCalendarAlt className="text-[var(--color-text-muted)] shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{member.address}</span>
                        </div>
                      )}
                    </div>

                    {member.point !== undefined && (
                      <div className="bg-[var(--color-primary-)] dark:bg-[var(--color-primary-)]/10 rounded-xl p-3 border border-[var(--color-primary-)] dark:border-[var(--color-primary-)]/30 flex justify-between items-center">
                        <span className="text-xs font-medium text-[var(--color-primary-)] dark:text-[var(--color-primary-)]">Điểm đánh giá</span>
                        <span className="text-lg font-bold text-[var(--color-primary-)] dark:text-[var(--color-primary-)]">{member.point}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="admin-table w-full">
                  <thead>
                    <tr>
                      <th className="w-16 text-center">Avatar</th>
                      <TableSortHeader label="Thông tin CSKH" sortKey="fullName" currentSort={sortConfig} onSort={handleSort} />
                      <TableSortHeader label="Liên hệ" sortKey="email" currentSort={sortConfig} onSort={handleSort} />
                      <TableSortHeader label="Điểm" sortKey="point" currentSort={sortConfig} onSort={handleSort} />
                      <TableSortHeader label="Trạng thái" sortKey="status" currentSort={sortConfig} onSort={handleSort} />
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedStaff.map(member => (
                      <tr key={member.id} className="admin-table-row">
                        <td className="text-center pl-4 py-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary-)] to-[var(--color-primary-)] flex items-center justify-center text-white font-bold text-sm mx-auto shadow-sm">
                            {getInitials(member.fullName)}
                          </div>
                        </td>
                        <td>
                          <div className="font-semibold text-[var(--color-text)]">{member.fullName || 'N/A'}</div>
                          <div className="text-xs text-[var(--color-text-muted)] font-mono mt-0.5">ID: #{member.id}</div>
                        </td>
                        <td>
                          <div className="text-sm flex items-center gap-2 mb-1 text-[var(--color-text-secondary)]">
                            <FaEnvelope className="text-[var(--color-text-muted)]" /> {member.email || 'N/A'}
                          </div>
                          <div className="text-sm flex items-center gap-2 text-[var(--color-text-secondary)]">
                            <FaPhone className="text-[var(--color-text-muted)]" /> {member.phoneNumber || 'N/A'}
                          </div>
                        </td>
                        <td>
                          <span className="font-bold text-[var(--color-primary-)] dark:text-[var(--color-primary-)]">{member.point ?? 0}</span>
                        </td>
                        <td>
                          {getStatusBadge(member.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)] shadow-sm">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredStaff.length / itemsPerPage)}
              totalItems={filteredStaff.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(CustomerServiceStaff);
