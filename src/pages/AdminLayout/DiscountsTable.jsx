import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../components/Toast';
import DiscountsToolbar from './components/discounts/DiscountsToolbar';
import DiscountsStatCards from './components/discounts/DiscountsStatCards';
import DiscountsDataTable from './components/discounts/DiscountsDataTable';
import {
  fetchDiscounts,
  fetchProducts,
  createDiscount,
  updateDiscount,
  activateDiscount,
  deactivateDiscount,
  fetchActiveDiscounts,
  fetchExpiredDiscounts,
  fetchUpcomingDiscounts,
  fetchBestActiveDiscounts,
  fetchDiscountsByRateRange,
  fetchDiscountsByCategory,
  searchDiscountsByKeyword,
  deactivateExpiredDiscounts,
  sendDiscountEmail,
  sendBulkDiscountEmail,
  fetchAllCustomers,
} from "../../apis/adminApi";
import DiscountFormModal from "./components/forms/DiscountFormModal";
import DiscountEmailModal from "./components/forms/DiscountEmailModal";
import ConfirmModal from "../../components/ConfirmModal";

const DiscountsTable = () => {
  const { t } = useTranslation();
  const { showSuccess, showError, showWarning } = useToast();
  const [discounts, setDiscounts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    minRate: '',
    maxRate: '',
    categoryId: '',
    dateFrom: '',
    dateTo: ''
  });
  const [viewMode, setViewMode] = useState('all'); // all, active, expired, upcoming, best
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [showCustomerSelector, setShowCustomerSelector] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [isSelectAllMode, setIsSelectAllMode] = useState(false);
  const [statusToggleTarget, setStatusToggleTarget] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'PERCENTAGE', // Mặc định là PERCENTAGE
    description: '',
    discountRate: '',
    discountStatus: true,
    startDate: '',
    endDate: '',
    productId: ''
  });

  const fetchDiscountsData = useCallback(async () => {
    try {
      setLoading(true);
      let data;
      
      // Build URL based on view mode
      const today = new Date().toISOString().split('T')[0];
      
      switch (viewMode) {
        case 'active':
          data = await fetchActiveDiscounts(today);
          break;
        case 'expired':
          data = await fetchExpiredDiscounts(today);
          break;
        case 'upcoming': {
          const nextMonth = new Date();
          nextMonth.setMonth(nextMonth.getMonth() + 1);
          data = await fetchUpcomingDiscounts(today, nextMonth.toISOString().split('T')[0]);
          break;
        }
        case 'best':
          data = await fetchBestActiveDiscounts();
          break;
        default:
          data = await fetchDiscounts();
      }
      setDiscounts(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching discounts:', error);
      setError(error.message);
      setDiscounts([]);
    } finally {
      setLoading(false);
    }
  }, [viewMode, setError]);

  const fetchProductsData = useCallback(async () => {
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  }, []);

  useEffect(() => {
    fetchDiscountsData();
    fetchProductsData();
  }, [fetchDiscountsData, fetchProductsData]);

  const applyAdvancedFilters = async () => {
    try {
      setLoading(true);
      let data;
      
      // Apply advanced filters
      if (advancedFilters.minRate && advancedFilters.maxRate) {
        data = await fetchDiscountsByRateRange(advancedFilters.minRate, advancedFilters.maxRate);
      } else if (advancedFilters.categoryId) {
        data = await fetchDiscountsByCategory(advancedFilters.categoryId);
      } else if (searchTerm) {
        data = await searchDiscountsByKeyword(searchTerm);
      } else {
        data = await fetchDiscounts();
      }

      setDiscounts(data);
    } catch (error) {
      console.error('Error applying filters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDeactivateExpired = async () => {
    try {
      const count = await deactivateExpiredDiscounts();
      showSuccess(`Đã vô hiệu hóa ${count} discount hết hạn`, 4000, 'top-right');
      fetchDiscountsData();
    } catch (error) {
      console.error('Error deactivating expired discounts:', error);
      showError('Lỗi khi vô hiệu hóa discount hết hạn: ' + (error.response?.data?.message || error.message), 5000, 'top-right');
    }
  };

  const filteredDiscounts = discounts.filter(discount => {
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && discount.discountStatus) ||
      (filterStatus === 'inactive' && !discount.discountStatus);
    
    const matchesSearch = 
      discount.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      discount.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      discount.type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Không cần filter type nữa vì chỉ dùng PERCENTAGE
    const matchesType = true; // Tất cả đều là PERCENTAGE
    
    // Cho phép hiển thị cả discount không có productId (trước đây có thể bị bỏ qua)
    const allowNoProductId = true;

    return matchesStatus && matchesSearch && matchesType && allowNoProductId;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate discountRate
      const discountRateValue = parseFloat(formData.discountRate);
      if (isNaN(discountRateValue) || discountRateValue < 0 || discountRateValue > 1) {
        showError('Phần trăm giảm phải từ 0 đến 1 (0 = 0%, 0.3 = 30%, 1 = 100%)');
        return;
      }

      // Validate dates
      if (!formData.startDate || !formData.endDate) {
        showError('Vui lòng chọn ngày bắt đầu và ngày kết thúc');
        return;
      }

      // Validate date range
      if (new Date(formData.startDate) > new Date(formData.endDate)) {
        showError('Ngày bắt đầu không được lớn hơn ngày kết thúc');
        return;
      }

      // Xử lý productId: nếu là empty string thì set null, nếu có thì parse int
      let productIdValue = null;
      if (formData.productId) {
        // Chuyển productId sang string để xử lý (có thể là string hoặc number)
        const productIdStr = String(formData.productId).trim();
        if (productIdStr !== '') {
          const parsedId = parseInt(productIdStr);
          if (isNaN(parsedId)) {
            showError('ID sản phẩm không hợp lệ');
            return;
          }
          productIdValue = parsedId;
        }
      }

      const discountData = {
        name: formData.name.trim(),
        type: 'PERCENTAGE', // Luôn là PERCENTAGE
        description: formData.description ? formData.description.trim() : null,
        discountRate: discountRateValue,
        discountStatus: formData.discountStatus === 'true' || formData.discountStatus === true,
        startDate: formData.startDate,
        endDate: formData.endDate,
        productId: productIdValue
      };

      if (editingDiscount) {
        await updateDiscount(editingDiscount.id, discountData);
        showSuccess('Discount đã được cập nhật thành công!');
      } else {
        await createDiscount(discountData);
        showSuccess('Discount đã được tạo thành công!');
      }

      fetchDiscountsData();
      setShowForm(false);
      setEditingDiscount(null);
      setFormData({
        name: '',
        type: 'PERCENTAGE', // Mặc định là PERCENTAGE
        description: '',
        discountRate: '',
        discountStatus: true,
        startDate: '',
        endDate: '',
        productId: ''
      });
    } catch (error) {
      console.error('Error saving discount:', error);
      
      // Xử lý validation errors từ backend
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Kiểm tra nếu có validation errors trong result
        if (errorData.result && typeof errorData.result === 'object') {
          const validationErrors = errorData.result;
          
          // Hiển thị warning cho từng validation error
          Object.entries(validationErrors).forEach(([field, msg]) => {
            showWarning(`${field}: ${msg}`);
          });
        } else if (errorData.message) {
          // Hiển thị error message từ backend
          showError(errorData.message);
        } else {
          showError('Lỗi khi lưu discount');
        }
      } else {
        showError(error.message || 'Lỗi khi lưu discount');
      }
    }
  };

  const handleEdit = (discount) => {
    setEditingDiscount(discount);
    
    // Format discountRate để hiển thị trong form (luôn là PERCENTAGE)
    let displayDiscountRate = discount.discountRate || '';
    
    // Backend có thể trả về 30 (cho 30%) hoặc 0.3 (cho 30%)
    // Frontend form hiển thị: 0.3 (cho 30%)
    if (discount.discountRate) {
      if (discount.discountRate > 1) {
        displayDiscountRate = discount.discountRate / 100; // 30 -> 0.3
      } else {
        displayDiscountRate = discount.discountRate; // 0.3 -> 0.3
      }
    }
    
    setFormData({
      name: discount.name || '',
      type: 'PERCENTAGE', // Luôn là PERCENTAGE
      description: discount.description || '',
      discountRate: displayDiscountRate,
      discountStatus: discount.discountStatus,
      startDate: discount.startDate ? discount.startDate.split('T')[0] : '',
      endDate: discount.endDate ? discount.endDate.split('T')[0] : '',
      productId: discount.productId ? String(discount.productId) : '' // Chuyển sang string để tránh lỗi trim()
    });
    setShowForm(true);
    showSuccess('Đã mở form chỉnh sửa discount', 2000, 'top-right');
  };

  // Ẩn function handleDelete vì không cho phép xóa discount
  // const handleDelete = async (discountId) => {
  //   if (window.confirm('Bạn có chắc chắn muốn xóa discount này?')) {
  //     try {
  //       await deleteDiscount(discountId);
  //       fetchDiscountsData();
  //       alert('Xóa discount thành công!');
  //     } catch (error) {
  //       console.error('Error deleting discount:', error);
  //       alert('Lỗi khi xóa discount');
  //     }
  //   }
  // };

  const handleToggleStatus = async (discountId, currentStatus) => {
    try {
      if (currentStatus) {
        await deactivateDiscount(discountId);
        showSuccess('Đã vô hiệu hóa discount thành công!', 3000, 'top-right');
      } else {
        await activateDiscount(discountId);
        showSuccess('Đã kích hoạt discount thành công!', 3000, 'top-right');
      }
      fetchDiscountsData();
    } catch (error) {
      console.error('Error updating status:', error);
      showError('Lỗi khi cập nhật trạng thái: ' + (error.response?.data?.message || error.message), 5000, 'top-right');
    }
  };

  const requestToggleStatus = (discount) => {
    if (!discount?.discountStatus) {
      handleToggleStatus(discount.id, discount.discountStatus);
      return;
    }
    setStatusToggleTarget(discount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getProductName = (productId) => {
    if (!productId) return 'Tất cả sản phẩm';
    const product = products.find(p => p.id === productId);
    return product ? product.name : `Product #${productId}`;
  };

  const handleSendEmailClick = async (discount) => {
    setSelectedDiscount(discount);
    setShowEmailModal(true);
    setSelectedCustomers([]);
    setShowCustomerSelector(false);
    setIsSelectAllMode(false);
    
    // Load danh sách khách hàng
    try {
      setLoadingCustomers(true);
      const customersList = await fetchAllCustomers();
      setCustomers(customersList);
    } catch (error) {
      console.error('Error fetching customers:', error);
      showError('Lỗi khi tải danh sách khách hàng', 3000, 'top-right');
    } finally {
      setLoadingCustomers(false);
    }
  };
  
  const handleSelectCustomers = () => {
    // Nếu đang ở chế độ "chọn tất cả", reset lại danh sách khi chuyển sang "chọn khách"
    if (isSelectAllMode) {
      setSelectedCustomers([]);
    }
    // Hiển thị danh sách để có thể chọn nhiều hoặc xóa
    setShowCustomerSelector(true);
    setIsSelectAllMode(false);
  };
  
  const handleSelectAllCustomers = () => {
    // Chọn tất cả khách hàng - không hiển thị bảng xanh
    const allEmails = customers.map(c => c.email).filter(e => e && e.trim() !== '');
    setSelectedCustomers(allEmails);
    setShowCustomerSelector(false);
    setIsSelectAllMode(true);
  };
  
  const toggleCustomerSelection = (email) => {
    // Toggle: nếu đã chọn thì xóa ra, chưa chọn thì thêm vào
    if (selectedCustomers.includes(email)) {
      // Xóa khỏi danh sách đã chọn
      setSelectedCustomers(selectedCustomers.filter(e => e !== email));
    } else {
      // Thêm vào danh sách đã chọn
      setSelectedCustomers([...selectedCustomers, email]);
    }
  };
  
  const removeSelectedCustomer = (email) => {
    // Xóa khách hàng khỏi danh sách đã chọn
    setSelectedCustomers(selectedCustomers.filter(e => e !== email));
  };
  
  const clearAllSelected = () => {
    // Xóa tất cả khách hàng đã chọn
    setSelectedCustomers([]);
  };

  const closeEmailModal = useCallback(() => {
    setShowEmailModal(false);
    setSelectedDiscount(null);
    setSelectedCustomers([]);
    setShowCustomerSelector(false);
    setIsSelectAllMode(false);
  }, []);

  const handleSendEmail = async () => {
    if (!selectedDiscount) return;
    
    if (selectedCustomers.length === 0) {
      showWarning('Vui lòng chọn ít nhất một khách hàng!', 3000, 'top-right');
      return;
    }
    
    try {
      setSendingEmail(true);
      
      if (selectedCustomers.length === 1) {
        // Gửi cho 1 khách hàng
        const customer = customers.find(c => c.email === selectedCustomers[0]);
        const response = await sendDiscountEmail(
          selectedDiscount.id,
          selectedCustomers[0],
          customer?.fullName || customer?.name || 'Quý khách'
        );
        showSuccess(response.message || 'Đã gửi email thành công!', 4000, 'top-right');
      } else {
        // Gửi cho nhiều khách hàng
        const response = await sendBulkDiscountEmail(selectedDiscount.id, selectedCustomers);
        showSuccess(response.message || `Đã gửi email cho ${selectedCustomers.length} khách hàng!`, 4000, 'top-right');
      }
      
      closeEmailModal();
    } catch (error) {
      console.error('Error sending email:', error);
      showError('Lỗi khi gửi email: ' + (error.response?.data?.message || error.message), 5000, 'top-right');
    } finally {
      setSendingEmail(false);
    }
  };

  const resetDiscountForm = useCallback(() => {
    setShowForm(false);
    setEditingDiscount(null);
    setFormData({
      name: "",
      type: "PERCENTAGE",
      description: "",
      discountRate: "",
      discountStatus: true,
      startDate: "",
      endDate: "",
      productId: "",
    });
  }, []);

  const handleClearAdvancedFilters = useCallback(() => {
    setAdvancedFilters({
      minRate: "",
      maxRate: "",
      categoryId: "",
      dateFrom: "",
      dateTo: "",
    });
    setViewMode("all");
    fetchDiscountsData();
  }, [fetchDiscountsData]);

  if (loading) {
    return (
      <div className="admin-card p-6 rounded-[var(--radius-lg)] animate-pageIn">
        <div className="space-y-3 py-2" aria-busy="true" aria-label={t("admin.ang_ti_d_liu")}>
          {[1, 2, 3, 4, 5, 6].map((row) => (
            <div
              key={row}
              className="admin-skeleton h-12 rounded-[var(--radius-md)] border border-[var(--color-border)]"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-pageIn">
      <DiscountsToolbar
        t={t}
        error={error}
        onRetryFetch={fetchDiscountsData}
        onBulkDeactivate={handleBulkDeactivateExpired}
        onAddClick={() => setShowForm(true)}
        viewMode={viewMode}
        setViewMode={setViewMode}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        showAdvancedFilters={showAdvancedFilters}
        setShowAdvancedFilters={setShowAdvancedFilters}
        advancedFilters={advancedFilters}
        setAdvancedFilters={setAdvancedFilters}
        onApplyAdvancedFilters={applyAdvancedFilters}
        onClearAdvancedFilters={handleClearAdvancedFilters}
      />

      <DiscountsStatCards discounts={discounts} t={t} />

      <DiscountsDataTable
        filteredDiscounts={filteredDiscounts}
        t={t}
        getProductName={getProductName}
        formatDate={formatDate}
        handleToggleStatus={requestToggleStatus}
        handleEdit={handleEdit}
        handleSendEmailClick={handleSendEmailClick}
      />

      {showForm ? (
        <DiscountFormModal
          editingDiscount={editingDiscount}
          formData={formData}
          setFormData={setFormData}
          products={products}
          onSubmit={handleSubmit}
          onCancel={resetDiscountForm}
        />
      ) : null}

      {showEmailModal && selectedDiscount ? (
        <DiscountEmailModal
          discount={selectedDiscount}
          customers={customers}
          loadingCustomers={loadingCustomers}
          selectedCustomers={selectedCustomers}
          showCustomerSelector={showCustomerSelector}
          isSelectAllMode={isSelectAllMode}
          sendingEmail={sendingEmail}
          onClose={closeEmailModal}
          onSelectCustomers={handleSelectCustomers}
          onSelectAllCustomers={handleSelectAllCustomers}
          onToggleCustomer={toggleCustomerSelection}
          onRemoveCustomer={removeSelectedCustomer}
          onClearSelected={clearAllSelected}
          onSend={handleSendEmail}
        />
      ) : null}
      {statusToggleTarget ? (
        <ConfirmModal
          isOpen={Boolean(statusToggleTarget)}
          title="Xác nhận vô hiệu hóa"
          message={`Bạn có chắc muốn vô hiệu hóa "${statusToggleTarget.name}"?`}
          onConfirm={() => {
            handleToggleStatus(statusToggleTarget.id, statusToggleTarget.discountStatus);
            setStatusToggleTarget(null);
          }}
          onCancel={() => setStatusToggleTarget(null)}
        />
      ) : null}
    </div>
  );
};

export default DiscountsTable;
