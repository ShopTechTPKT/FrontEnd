import React, { useState, useEffect, useMemo } from 'react';
import { FaUserTie, FaUsers, FaUserShield, FaEdit, FaTrash, FaPlus, FaSearch, FaEnvelope, FaPhone, FaBriefcase, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { LayoutGrid, List } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../../custom/axios';
import Pagination from '../../components/ui/Pagination';
import TableSortHeader from '../../components/ui/TableSortHeader';
import ConfirmModal from "../../components/ConfirmModal";
import { toast } from "react-toastify";

const StaffManagement = () => {
  const { t } = useTranslation();

  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Sort
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      // Fetch all users and filter staff (roles 1, 2, 3)
      const res = await axiosInstance.get('/users');
      const data = Array.isArray(res.data) ? res.data : [];
      // Assuming roleId 1 = Admin, 2 = Customer Service, 3 = Staff/Other (4 is usually customer)
      const staffMembers = data.filter(u => u.roleId === 1 || u.roleId === 2 || u.roleId === 3);
      setStaff(staffMembers);
    } catch (error) {
      console.error("Failed to fetch staff:", error);
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  const getRoleInfo = (roleId) => {
    if (roleId === 1) return { name: 'Admin', badge: 'bg-indigo-100 text-indigo-800', icon: FaUserShield };
    if (roleId === 2) return { name: 'Customer Service', badge: 'bg-blue-100 text-blue-800', icon: FaBriefcase };
    if (roleId === 3) return { name: 'Staff', badge: 'bg-emerald-100 text-emerald-800', icon: FaUserTie };
    return { name: 'Unknown', badge: 'bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)]', icon: FaUsers };
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const filteredStaff = useMemo(() => {
    return staff.filter(member => {
      const roleMatch = filterRole === 'all' || member.roleId.toString() === filterRole;
      const searchLower = searchTerm.toLowerCase();
      const searchMatch = 
        (member.fullName && member.fullName.toLowerCase().includes(searchLower)) ||
        (member.email && member.email.toLowerCase().includes(searchLower)) ||
        (member.phoneNumber && member.phoneNumber.includes(searchTerm)) ||
        (member.id && member.id.toString().includes(searchTerm));
      
      return roleMatch && searchMatch;
    });
  }, [staff, filterRole, searchTerm]);

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

  const getInitials = (name) => {
    if (!name) return 'ST';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const roles = [
    { id: 'all', name: 'Tất cả nhân sự' },
    { id: '1', name: 'Admin' },
    { id: '2', name: 'CSKH' },
    { id: '3', name: 'Nhân viên khác' }
  ];

  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
  const handleDelete = (member) => {
    setStaff((prev) => prev.filter((item) => item.id !== member.id));
    toast.success("Xóa nhân sự thành công!");
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-pageIn min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[var(--color-bg)] p-6 rounded-2xl shadow-sm border border-[var(--color-border)]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200/50">
            <FaUserShield size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text)]">Quản lý Nhân Sự</h1>
            <p className="text-sm text-[var(--color-text-secondary)]">Xem và quản lý tất cả nhân viên trong hệ thống</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="bg-[var(--color-bg-subtle)] px-4 py-2.5 rounded-xl border border-[var(--color-border)] flex flex-col items-center min-w-[100px]">
            <span className="text-xs text-[var(--color-text-muted)] font-medium">Tổng số</span>
            <span className="text-xl font-bold text-[var(--color-primary)]">{staff.length}</span>
          </div>
          <button className="flex-1 md:flex-none btn-admin-primary px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 font-semibold">
            <FaPlus /> Thêm nhân sự
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row justify-between gap-4 bg-[var(--color-bg)] p-4 rounded-xl border border-[var(--color-border)] shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {roles.map(role => {
            const count = role.id === 'all' ? staff.length : staff.filter(s => s.roleId.toString() === role.id).length;
            return (
              <button
                key={role.id}
                onClick={() => setFilterRole(role.id)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  filterRole === role.id
                    ? 'bg-[var(--color-primary)] text-white shadow-md'
                    : 'bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-subtle)] hover:text-[var(--color-primary)]'
                }`}
              >
                {role.name} ({count})
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 lg:w-64">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Tìm kiếm nhân sự..."
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
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="admin-skeleton h-20 rounded-xl" />
          ))}
        </div>
      ) : staff.length === 0 ? (
        <div className="admin-card p-12 flex flex-col items-center justify-center text-center rounded-2xl border-dashed">
          <FaUsers className="text-6xl text-[var(--color-text-muted)] opacity-50 mb-4" />
          <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">Chưa có nhân sự</h3>
          <p className="text-[var(--color-text-secondary)]">Không tìm thấy nhân viên nào trong hệ thống.</p>
        </div>
      ) : (
        <div className="bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)] shadow-sm overflow-hidden flex flex-col">
          {viewMode === 'list' ? (
            <div className="overflow-x-auto">
              <table className="admin-table w-full">
                <thead>
                  <tr>
                    <th className="w-16 text-center">Avatar</th>
                    <TableSortHeader label="Thông tin" sortKey="fullName" currentSort={sortConfig} onSort={handleSort} />
                    <TableSortHeader label="Liên hệ" sortKey="email" currentSort={sortConfig} onSort={handleSort} />
                    <TableSortHeader label="Chức vụ" sortKey="roleId" currentSort={sortConfig} onSort={handleSort} />
                    <TableSortHeader label="Trạng thái" sortKey="status" currentSort={sortConfig} onSort={handleSort} />
                    <th className="text-right pr-6">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedStaff.map(member => {
                    const roleInfo = getRoleInfo(member.roleId);
                    const isActive = member.status !== 'INACTIVE';
                    
                    return (
                      <tr key={member.id} className="admin-table-row">
                        <td className="w-16 text-center pl-4 py-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-sm mx-auto shadow-sm">
                            {getInitials(member.fullName)}
                          </div>
                        </td>
                        <td>
                          <div className="font-semibold text-[var(--color-text)]">{member.fullName || 'N/A'}</div>
                          <div className="text-xs text-[var(--color-text-muted)] font-mono">ID: {member.id}</div>
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
                          <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${roleInfo.badge}`}>
                            {roleInfo.name}
                          </span>
                        </td>
                        <td>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 w-fit ${isActive ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:border-red-800'}`}>
                            {isActive ? <FaCheckCircle/> : <FaTimesCircle/>}
                            {isActive ? 'Hoạt động' : 'Đã khóa'}
                          </span>
                        </td>
                        <td className="text-right pr-6">
                          <div className="flex justify-end gap-2">
                            <button className="p-2 text-[var(--color-text-secondary)] hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors">
                              <FaEdit size={16} />
                            </button>
                            <button onClick={() => setDeleteTarget(member)} className="p-2 text-[var(--color-text-secondary)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                              <FaTrash size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginatedStaff.map(member => {
                const roleInfo = getRoleInfo(member.roleId);
                const isActive = member.status !== 'INACTIVE';
                
                return (
                  <div key={member.id} className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl p-5 hover:shadow-lg transition-all relative group">
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button className="p-1.5 text-[var(--color-text-muted)] hover:text-indigo-600 bg-[var(--color-bg-subtle)] rounded-md"><FaEdit size={14}/></button>
                      <button onClick={() => setDeleteTarget(member)} className="p-1.5 text-[var(--color-text-muted)] hover:text-red-600 bg-[var(--color-bg-subtle)] rounded-md"><FaTrash size={14}/></button>
                    </div>
                    
                    <div className="flex flex-col items-center mb-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xl shadow-inner mb-3">
                        {getInitials(member.fullName)}
                      </div>
                      <h3 className="font-bold text-lg text-[var(--color-text)]">{member.fullName || 'N/A'}</h3>
                      <p className="text-xs text-[var(--color-text-muted)] mb-2 font-mono">ID: {member.id}</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${roleInfo.badge}`}>
                        {roleInfo.name}
                      </span>
                    </div>
                    
                    <div className="space-y-2 pt-4 border-t border-[var(--color-border)]">
                      <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
                        <FaEnvelope className="text-[var(--color-text-muted)] shrink-0" />
                        <span className="truncate">{member.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
                        <FaPhone className="text-[var(--color-text-muted)] shrink-0" />
                        <span>{member.phoneNumber || 'N/A'}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex justify-between items-center">
                      <span className="text-xs text-[var(--color-text-muted)]">Trạng thái</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isActive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                        {isActive ? 'HOẠT ĐỘNG' : 'ĐÃ KHÓA'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredStaff.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
      )}
      {deleteTarget ? (
        <ConfirmModal
          isOpen={Boolean(deleteTarget)}
          title="Xác nhận xóa"
          message={`Bạn có chắc muốn xóa "${deleteTarget.fullName || deleteTarget.email}"? Hành động này không thể hoàn tác.`}
          onConfirm={() => {
            handleDelete(deleteTarget);
            setDeleteTarget(null);
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}
    </div>
  );
};

export default React.memo(StaffManagement);
