import { useState, useEffect } from 'react';
import { FaUserTie, FaHeadphones, FaSearch, FaEnvelope, FaPhone, FaCalendarAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { fetchCustomerServiceStaff } from '../../apis/adminApi';

const CustomerServiceStaff = () => {
  const { t } = useTranslation();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      setLoading(true);
      const data = await fetchCustomerServiceStaff();
      setStaff(data);
    } catch (error) {
      console.error('Error loading customer service staff:', error);
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredStaff = staff.filter(member => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (member.fullName && member.fullName.toLowerCase().includes(searchLower)) ||
      (member.email && member.email.toLowerCase().includes(searchLower)) ||
      (member.phoneNumber && member.phoneNumber.includes(searchTerm)) ||
      (member.id && member.id.toString().includes(searchTerm))
    );
  });

  const getStatusBadge = (status) => {
    const isActive = status === 'ACTIVE';
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
        isActive 
          ? 'bg-green-100 text-green-800 border-green-300' 
          : 'bg-red-100 text-red-800 border-red-300'
      }`}>
        {isActive ? (
          <>
            <FaCheckCircle className="inline mr-1" />
            {t('common.active')}
          </>
        ) : (
          <>
            <FaTimesCircle className="inline mr-1" />
            {t('common.inactive')}
          </>
        )}
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl p-6 mb-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
              <FaHeadphones className="text-3xl" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-1">
                {t('admin.customer_service_staff') || 'Nhân Viên Chăm Sóc Khách Hàng'}
              </h2>
              <p className="text-blue-100">
                {t('admin.manage_customer_service_team') || 'Quản lý đội ngũ chăm sóc khách hàng'}
              </p>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-blue-200 text-sm mb-1">
              {t('admin.total_staff') || 'Tổng số nhân viên'}
            </p>
            <p className="text-4xl font-bold">{staff.length}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t('admin.search_by_name_email_phone') || 'Tìm kiếm theo tên, email, số điện thoại...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStaff.map((member) => (
          <div
            key={member.id}
            className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full"></div>
              <div className="relative">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-blue-900 font-bold text-2xl mx-auto mb-3 shadow-lg">
                  {getInitials(member.fullName)}
                </div>
                <h3 className="font-bold text-xl mb-1">{member.fullName || 'N/A'}</h3>
                <p className="text-sm text-blue-200 mb-2">ID: {member.id}</p>
                <span className="px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold">
                  {t('admin.customer_service') || 'Chăm Sóc Khách Hàng'}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* Status */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                {getStatusBadge(member.status)}
                <span className="text-sm text-gray-600">
                  {t('admin.staff_member') || 'Nhân viên'}
                </span>
              </div>

              {/* Contact Info */}
              <div className="space-y-3 mb-4">
                {member.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <FaEnvelope className="text-blue-600" />
                    <span className="truncate">{member.email}</span>
                  </div>
                )}
                {member.phoneNumber && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <FaPhone className="text-blue-600" />
                    <span>{member.phoneNumber}</span>
                  </div>
                )}
                {member.address && (
                  <div className="flex items-start gap-2 text-sm text-gray-700">
                    <FaCalendarAlt className="text-blue-600 mt-1" />
                    <span className="line-clamp-2">{member.address}</span>
                  </div>
                )}
              </div>

              {/* Stats */}
              {member.point !== undefined && (
                <div className="bg-blue-50 rounded-xl p-4 mb-4">
                  <p className="text-xs text-gray-600 mb-1">
                    {t('admin.points') || 'Điểm tích lũy'}
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {member.point?.toLocaleString('vi-VN') || 0}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredStaff.length === 0 && !loading && (
        <div className="text-center py-12">
          <FaUserTie className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {searchTerm 
              ? (t('admin.no_staff_found') || 'Không tìm thấy nhân viên')
              : (t('admin.no_customer_service_staff') || 'Chưa có nhân viên chăm sóc khách hàng')
            }
          </h3>
          <p className="text-gray-600">
            {searchTerm 
              ? (t('admin.try_different_search') || 'Thử tìm kiếm với từ khóa khác')
              : (t('admin.add_customer_service_staff') || 'Vui lòng thêm nhân viên chăm sóc khách hàng')
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default CustomerServiceStaff;

