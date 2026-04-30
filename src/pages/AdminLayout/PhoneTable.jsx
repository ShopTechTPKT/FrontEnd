import React, { memo, useState, useEffect, useCallback } from 'react';
import { ImageOff, Search, Plus, Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import formatCurrency from "../../utils/formatCurrency";
import Button from '../../components/ui/Button';
import ProductGridSkeleton from '../../components/ui/ProductGridSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import { useProductCRUD, CATEGORY_IDS } from './hooks/useProductCRUD';

const CATEGORY_BRAND_MAPPING = {
  52: 'iPhone',
  53: 'Samsung',
  54: 'Xiaomi',
};

const PhoneForm = ({
  phone = {},
  onSave,
  onCancel,
  formTitle,
  theme,
  validCategoryIds = [52, 53, 54],
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: phone?.name || '',
    description: phone?.description || '',
    unitPrice: phone?.unitPrice || '',
    quantity: phone?.quantity || '',
    categoryId: phone?.categoryId || '',
    imageUrl: phone?.imageUrl || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'unitPrice' || name === 'quantity' ? parseFloat(value) || value : 
              name === 'categoryId' ? (value === '' ? '' : parseInt(value)) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSave(formData);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className={`w-full max-w-2xl rounded-xl shadow-2xl p-6 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
        <h3 className="text-xl font-bold mb-4">{formTitle}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tên điện thoại</label>
              <input name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hãng</label>
              <select name="categoryId" value={formData.categoryId} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700" required>
                <option value="">-- Chọn hãng --</option>
                {validCategoryIds.map(id => <option key={id} value={id}>{CATEGORY_BRAND_MAPPING[id]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Giá</label>
              <input type="number" name="unitPrice" value={formData.unitPrice} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Số lượng</label>
              <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mô tả</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700" rows="3" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Link ảnh</label>
            <input name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700" />
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <Button type="button" onClick={onCancel} variant="ghost">{t('common.cancel')}</Button>
            <Button type="submit" variant="primary">Lưu</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PhoneTable = memo(({ theme = 'light' }) => {
  const { t } = useTranslation();
  const { performOperation } = useProductCRUD();
  const [phones, setPhones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [formState, setFormState] = useState({ isOpen: false, currentPhone: null, type: 'add' });

  const fetchPhones = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8081/api/products', {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
      });
      if (response.ok) {
        const data = await response.json();
        const phoneIds = CATEGORY_IDS.phone;
        setPhones(data.filter(p => phoneIds.includes(p.categoryId)));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPhones();
  }, [fetchPhones]);

  const handleSave = async (formData) => {
    const op = formState.type === 'add' ? 'create' : 'update';
    const id = formState.currentPhone?.id || formState.currentPhone?.productID;
    await performOperation(op, 'phone', formData, id);
    setFormState({ isOpen: false, currentPhone: null, type: 'add' });
    fetchPhones();
  };

  const filteredPhones = phones.filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{t('admin.menu_phone')}</h2>
        <div className="flex items-center space-x-4">
          <Button onClick={() => setFormState({ isOpen: true, currentPhone: null, type: 'add' })} variant="primary" icon={<Plus size={18} />}>
            Thêm mới
          </Button>
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Tìm kiếm điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border dark:bg-gray-800"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>
      </div>

      {loading ? <ProductGridSkeleton count={5} /> : (
        <div className="overflow-x-auto rounded-lg border dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Ảnh</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Tên sản phẩm</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Giá</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Kho</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Hãng</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredPhones.map((phone) => (
                <tr key={phone.id || phone.productID}>
                  <td className="px-6 py-4">
                    {phone.imageUrl ? <img src={phone.imageUrl} alt="" className="h-12 w-12 object-cover rounded" /> : <ImageOff size={24} />}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">{phone.name}</td>
                  <td className="px-6 py-4 text-sm">{formatCurrency(phone.unitPrice)}</td>
                  <td className="px-6 py-4 text-sm">{phone.quantity}</td>
                  <td className="px-6 py-4 text-sm">{CATEGORY_BRAND_MAPPING[phone.categoryId] || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm">
                    <Button onClick={() => setFormState({ isOpen: true, currentPhone: phone, type: 'edit' })} variant="ghost" size="sm" icon={<Pencil size={16} />} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {formState.isOpen && (
        <PhoneForm
          phone={formState.currentPhone}
          onSave={handleSave}
          onCancel={() => setFormState({ isOpen: false, currentPhone: null, type: 'add' })}
          formTitle={formState.type === 'add' ? 'Thêm Điện Thoại' : 'Sửa Điện Thoại'}
          theme={theme}
        />
      )}
    </div>
  );
});

export default PhoneTable;
