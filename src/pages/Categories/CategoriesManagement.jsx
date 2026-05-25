import { useState } from 'react';
import { FaFolder, FaLaptop, FaDesktop, FaMobileAlt, FaKeyboard, FaMouse, FaHeadphones, FaPlus, FaEdit, FaTrash, FaBox, FaSearch } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const CategoriesManagement = () => {
  const { t } = useTranslation();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  const categories = [
    {
      id: 'CAT-001',
      name: 'Laptops',
      icon: FaLaptop,
      description: 'Portable computers for work and entertainment',
      productCount: 156,
      subcategories: ['Gaming Laptops', 'Business Laptops', 'Ultrabooks', 'Workstations'],
      status: 'active',
      createdDate: '2023-01-15'
    },
    {
      id: 'CAT-002',
      name: 'Desktops',
      icon: FaDesktop,
      description: 'Complete desktop computer systems',
      productCount: 89,
      subcategories: ['Gaming PCs', 'Office PCs', 'All-in-One', 'Mini PCs'],
      status: 'active',
      createdDate: '2023-01-15'
    },
    {
      id: 'CAT-003',
      name: 'Mobile Devices',
      icon: FaMobileAlt,
      description: 'Smartphones and tablets',
      productCount: 234,
      subcategories: ['Smartphones', 'Tablets', 'Smart Watches', 'Accessories'],
      status: 'active',
      createdDate: '2023-02-20'
    },
    {
      id: 'CAT-004',
      name: 'Keyboards',
      icon: FaKeyboard,
      description: 'Mechanical and membrane keyboards',
      productCount: 78,
      subcategories: ['Mechanical', 'Gaming', 'Wireless', 'Ergonomic'],
      status: 'active',
      createdDate: '2023-03-10'
    },
    {
      id: 'CAT-005',
      name: 'Mice',
      icon: FaMouse,
      description: 'Gaming and office mice',
      productCount: 92,
      subcategories: ['Gaming', 'Wireless', 'Ergonomic', 'Trackballs'],
      status: 'active',
      createdDate: '2023-03-10'
    },
    {
      id: 'CAT-006',
      name: 'Headphones',
      icon: FaHeadphones,
      description: 'Audio devices and headsets',
      productCount: 67,
      subcategories: ['Gaming Headsets', 'Wireless', 'Studio', 'Earbuds'],
      status: 'active',
      createdDate: '2023-04-05'
    },
    {
      id: 'CAT-007',
      name: 'PC Components',
      icon: FaBox,
      description: 'Computer hardware components',
      productCount: 345,
      subcategories: ['CPUs', 'GPUs', 'RAM', 'Storage', 'Motherboards', 'Power Supplies'],
      status: 'active',
      createdDate: '2023-01-15'
    }
  ];

  const filteredCategories = categories.filter(category => {
    const matchesSearch = 
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const totalProducts = categories.reduce((sum, cat) => sum + cat.productCount, 0);

  return (
    <div className="animate-pageIn pb-10">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <FaFolder className="text-6xl mb-4 text-[var(--color-primary-)]" />
              <h1 className="text-5xl font-bold mb-3">{t('category.categories_management')}</h1>
              <p className="text-xl text-[var(--color-primary-)]">{t('category.organize_your_product_catalog')}</p>
            </div>
            <div className="flex gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <p className="text-[var(--color-primary-)] text-sm mb-1">{t('category.categories')}</p>
                <p className="text-4xl font-bold">{categories.length}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <p className="text-[var(--color-primary-)] text-sm mb-1">{t('common.products')}</p>
                <p className="text-4xl font-bold">{totalProducts}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Actions */}
      <div className="sticky top-0 z-30 admin-header-glass border-b border-[var(--color-border)] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input
                type="text"
                placeholder={t('category.search_categories')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="admin-input w-full pl-12 pr-4 py-3 rounded-[var(--radius-lg)] dark:bg-gray-900 dark:border-gray-700"
              />
            </div>
            <button type="button" className="btn-admin-primary px-8 py-3 rounded-[var(--radius-lg)] font-bold shrink-0 flex items-center gap-2">
              <FaPlus />
              Add Category
            </button>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map(category => {
            const Icon = category.icon;
            return (
              <div 
                key={category.id}
                className="group admin-card rounded-[var(--radius-xl)] overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 border border-[var(--color-border)]"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-[var(--color-primary-)] to-[var(--color-primary-)] text-white p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full"></div>
                  <div className="relative">
                    <Icon className="text-5xl mb-4 text-[var(--color-primary-)]" />
                    <h3 className="font-bold text-2xl mb-2">{category.name}</h3>
                    <p className="text-sm text-[var(--color-primary-)]">{category.id}</p>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6">
                  {/* Description */}
                  <p className="text-[var(--color-text-secondary)] mb-4 text-sm">
                    {category.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-[var(--color-border)]">
                    <div>
                      <p className="text-xs text-[var(--color-text-muted)] mb-1">{t('category.total_products')}</p>
                      <p className="text-2xl font-bold text-[var(--color-primary-)]">{category.productCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--color-text-muted)] mb-1">{t('category.subcategories')}</p>
                      <p className="text-2xl font-bold text-[var(--color-text)]">{category.subcategories.length}</p>
                    </div>
                  </div>

                  {/* Subcategories */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-[var(--color-text)] mb-2">{t('remaining.subcategories')}</p>
                    <div className="flex flex-wrap gap-2">
                      {category.subcategories.slice(0, 3).map((sub, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-[var(--color-primary-)] text-[var(--color-primary-)] rounded-full text-xs font-medium"
                        >
                          {sub}
                        </span>
                      ))}
                      {category.subcategories.length > 3 && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                          +{category.subcategories.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Date */}
                  <p className="text-xs text-[var(--color-text-muted)] mb-4">
                    Created: {new Date(category.createdDate).toLocaleDateString('vi-VN')}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button type="button" className="flex-1 btn-admin-outline py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold">
                      <FaEdit />{t('account.edit')}</button>
                    <button type="button" className="flex-1 btn-admin-primary bg-red-600 hover:bg-red-700 border-0 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold">
                      <FaTrash />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <FaFolder className="text-6xl text-[var(--color-text-muted)] mx-auto mb-4 opacity-60" />
            <h3 className="text-2xl font-bold text-[var(--color-text)] mb-2">{t('category.no_categories_found')}</h3>
            <p className="text-[var(--color-text-secondary)]">{t('common.try_adjusting_your_search')}</p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-[var(--color-text)] mb-6">{t('category.category_statistics')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.slice(0, 4).map((category, index) => {
            const Icon = category.icon;
            const colors = [
              'from-[var(--color-primary-)] to-[var(--color-primary-)]',
              'from-[var(--color-primary-)] to-[var(--color-primary-)]',
              'from-green-500 to-green-600',
              'from-orange-500 to-orange-600'
            ];
            return (
              <div 
                key={category.id}
                className={`bg-gradient-to-br ${colors[index]} text-white p-6 rounded-2xl shadow-lg`}
              >
                <Icon className="text-4xl mb-3" />
                <p className="text-3xl font-bold">{category.productCount}</p>
                <p className="opacity-90">{category.name}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoriesManagement;
