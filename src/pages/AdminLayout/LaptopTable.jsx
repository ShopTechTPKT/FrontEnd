import React, { memo, useState, useEffect, useCallback } from 'react';
import { ImageOff, Search, Plus, Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import formatCurrency from "../../utils/formatCurrency";
import Button from '../../components/ui/Button';
import StatusNotice from '../../components/ui/StatusNotice';
import ProductGridSkeleton from '../../components/ui/ProductGridSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import { useProductCRUD, CATEGORY_IDS } from './hooks/useProductCRUD';

// Ánh xạ categoryID với tên hãng
const CATEGORY_BRAND_MAPPING = {
  45: 'Acer',
  46: 'Asus',
  47: 'Dell',
  48: 'Gigabyte',
  49: 'Lenovo',
  50: 'Apple',
  51: 'MSI',
};

// Component LaptopForm
const LaptopForm = ({
  computer = {},
  onSave,
  onCancel,
  formTitle,
  theme,
  validCategoryIds = [45, 46, 47, 48, 49, 50, 51],
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: computer?.name || '',
    description: computer?.description || '',
    unitPrice: computer?.unitPrice || '',
    quantity: computer?.quantity || '',
    categoryId: computer?.categoryId || '',
    imageUrl: computer?.imageUrl || '',
    isLoading: false,
    error: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'unitPrice' || name === 'quantity'
          ? parseFloat(value) || value
          : name === 'categoryId'
          ? value === '' ? '' : parseInt(value)
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormData((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      await onSave(formData);
    } catch (err) {
      setFormData((prev) => ({ ...prev, isLoading: false, error: err.message }));
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className={`w-full max-w-2xl rounded-xl shadow-2xl p-6 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
        <h3 className="text-xl font-bold mb-4">{formTitle}</h3>
        {formData.error && <div className="mb-4 text-red-500 text-sm">{formData.error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('admin.tn_sn_phm')}</label>
              <input name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('admin.hng')}</label>
              <select name="categoryId" value={formData.categoryId} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700" required>
                <option value="">-- Chọn hãng --</option>
                {validCategoryIds.map(id => <option key={id} value={id}>{CATEGORY_BRAND_MAPPING[id]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('product.price')}</label>
              <input type="number" name="unitPrice" value={formData.unitPrice} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('admin.tn_kho')}</label>
              <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('admin.m_t')}</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700" rows="3" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Image URL</label>
            <input name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700" />
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <Button type="button" onClick={onCancel} variant="ghost">{t('common.cancel')}</Button>
            <Button type="submit" variant="primary" disabled={formData.isLoading}>
              {formData.isLoading ? 'Saving...' : t('common.save')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const LaptopTable = memo(({ theme = 'light' }) => {
  const { t } = useTranslation();
  const { performOperation, loading: crudLoading } = useProductCRUD();
  const [laptops, setLaptops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formState, setFormState] = useState({ isOpen: false, currentLaptop: null, type: 'add' });

  const fetchLaptops = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8081/api/products', {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
      });
      if (response.ok) {
        const data = await response.json();
        const laptopIds = CATEGORY_IDS.laptop;
        setLaptops(data.filter(p => laptopIds.includes(p.categoryId)));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLaptops();
  }, [fetchLaptops]);

  const handleSave = async (formData) => {
    const op = formState.type === 'add' ? 'create' : 'update';
    const id = formState.currentLaptop?.id || formState.currentLaptop?.productID;
    await performOperation(op, 'laptop', formData, id);
    setFormState({ isOpen: false, currentLaptop: null, type: 'add' });
    fetchLaptops();
  };

  const filteredLaptops = laptops.filter(l => 
    l.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentTheme = theme === 'dark' ? {
    container: 'bg-gray-900 text-white',
    table: 'border-gray-700',
    tableHeader: 'bg-gray-800 text-gray-300',
    tableRow: 'hover:bg-gray-800',
    secondaryText: 'text-gray-400',
    input: 'bg-gray-800 border-gray-700 text-white',
  } : {
    container: 'bg-white text-gray-900',
    table: 'border-gray-200',
    tableHeader: 'bg-gray-50 text-gray-600',
    tableRow: 'hover:bg-gray-50',
    secondaryText: 'text-gray-500',
    input: 'bg-white border-gray-300 text-gray-900',
  };

  return (
    <div className={`p-6 rounded-xl ${currentTheme.container}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{t('admin.menu_laptops')}</h2>
        <div className="flex items-center space-x-4">
          <Button onClick={() => setFormState({ isOpen: true, currentLaptop: null, type: 'add' })} variant="primary" icon={<Plus size={18} />}>
            {t('admin.thm')}
          </Button>
          <div className="relative w-64">
            <input
              type="text"
              placeholder={t('admin.tm_kim_my_tnh')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 ${currentTheme.input}`}
            />
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${currentTheme.secondaryText}`} size={20} />
          </div>
        </div>
      </div>

      {loading ? (
        <ProductGridSkeleton count={5} />
      ) : laptops.length === 0 ? (
        <EmptyState title="No laptops found" />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={currentTheme.tableHeader}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('admin.hnh_nh')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('admin.tn_sn_phm')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('product.price')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('admin.tn_kho')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('admin.hng')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredLaptops.map((laptop) => (
                <tr key={laptop.id || laptop.productID} className={currentTheme.tableRow}>
                  <td className="px-6 py-4">
                    {laptop.imageUrl ? <img src={laptop.imageUrl} alt="" className="h-12 w-12 object-cover rounded shadow-sm" /> : <ImageOff size={24} />}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">{laptop.name}</td>
                  <td className="px-6 py-4 text-sm">{formatCurrency(laptop.unitPrice)}</td>
                  <td className="px-6 py-4 text-sm">{laptop.quantity}</td>
                  <td className="px-6 py-4 text-sm">{CATEGORY_BRAND_MAPPING[laptop.categoryId] || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm">
                    <Button onClick={() => setFormState({ isOpen: true, currentLaptop: laptop, type: 'edit' })} variant="ghost" size="sm" icon={<Pencil size={16} />} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {formState.isOpen && (
        <LaptopForm
          computer={formState.currentLaptop}
          onSave={handleSave}
          onCancel={() => setFormState({ isOpen: false, currentLaptop: null, type: 'add' })}
          formTitle={formState.type === 'add' ? 'Thêm Laptop' : 'Sửa Laptop'}
          theme={theme}
        />
      )}
    </div>
  );
});

export default LaptopTable;
