import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "react-i18next";

const subCategoryMapping = {
  "All Laptops": { list: [45, 46, 47, 48, 49, 50, 51] },
  "Mouse": { list: [6, 7, 8, 9, 10] },
  "KeyBoard": { list: [1, 2, 3, 4, 5] },
  "Game Gear": { list: [14, 15, 16] },
  "Mouse Pad": { list: [11, 12, 13] },
  "Headphone": { list: [42, 43] },
  "Monitor": { list: [36, 37, 38, 39] },
  "Case": { list: [17] },
  "CPU": { list: [18, 19] },
  "MainBoard": { list: [20, 21, 22] },
  "PSU": { list: [23, 24, 25, 26] },
  "Storage": { list: [27, 28, 29] },
  "RAM": { list: [30, 31, 32] },
  "iPhone": { list: [52, 53, 54], brand: "iPhone" },
  "Samsung": { list: [52, 53, 54], brand: "Samsung" },
  "Xiaomi": { list: [52, 53, 54], brand: "Xiaomi" },
  "iPad": { list: [44] }
};

const SidebarFilters = ({ products = [], allProducts, dbProducts = [], onApplyFilters }) => {
  const { t } = useTranslation();

  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [selectedPriceRange, setSelectedPriceRange] = useState("");
  const [filterName, setFilterName] = useState("");
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expanded, setExpanded] = useState({
    category: true,
    price: true,
    name: true,
  });

  // Categories with subcategories
  const categoryStructure = {
    "Laptops": ["All Laptops"],
    "Gaming Gear": ["Mouse", "KeyBoard", "Game Gear", "Mouse Pad", "Headphone"],
    "PC Parts": ["Monitor", "Case", "CPU", "MainBoard", "PSU", "Storage", "RAM"],
    "Smart Device": ["iPhone", "Samsung", "Xiaomi", "iPad"]
  };

  const toggleCategory = (categoryName) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  const toggleSection = section => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const clearFilters = () => {
    setSelectedPriceRange("");
    setFilterName("");
    setSelectedSubCategory("");
    onApplyFilters(allProducts);
  };

  const priceRanges = [
    { min: 0, max: 1000000, label: "0đ - 1,000,000đ" },
    { min: 1000000, max: 2000000, label: "1,000,000đ - 2,000,000đ" },
    { min: 2000000, max: 3000000, label: "2,000,000đ - 3,000,000đ" },
    { min: 3000000, max: 4000000, label: "3,000,000đ - 4,000,000đ" },
    { min: 4000000, max: 5000000, label: "4,000,000đ - 5,000,000đ" },
    { min: 5000000, max: 6000000, label: "5,000,000đ - 6,000,000đ" },
    { min: 6000000, max: 7000000, label: "6,000,000đ - 7,000,000đ" },
    { min: 7000000, max: Infinity, label: "7,000,000đ trở lên" },
  ];

  // Lọc sản phẩm theo lựa chọn hiện tại để tính số lượng sản phẩm hiển thị trong mỗi khoảng giá
  const filteredProducts = useMemo(() => {
    const sourceList = selectedSubCategory ? dbProducts : (allProducts || products);
    let filtered = [...sourceList];

    if (selectedSubCategory && subCategoryMapping[selectedSubCategory]) {
      const { list, brand } = subCategoryMapping[selectedSubCategory];
      filtered = filtered.filter(product => {
        const matchesCategory = list.includes(product.categoryId);
        if (!matchesCategory) return false;
        if (brand) {
          const itemBrandName = (product.brandName || product.brand?.name || product.brand || "").toLowerCase();
          const productName = (product.name || product.productName || "").toLowerCase();
          const searchBrand = brand.toLowerCase();
          return itemBrandName.includes(searchBrand) || productName.includes(searchBrand);
        }
        return true;
      });
    }

    if (selectedPriceRange) {
      const [minStr, maxStr] = selectedPriceRange.split(" - ");
      const min = parseFloat(minStr.replace(/[₫,]/g, ""));
      const max = maxStr ? parseFloat(maxStr.replace(/[₫,]/g, "")) : Infinity;
      filtered = filtered.filter(product => {
        const priceValue = typeof product.unitPrice === 'string'
          ? parseFloat(product.unitPrice.replace(/[₫,]/g, ""))
          : parseFloat(product.unitPrice || product.price || 0);
        return priceValue >= min && priceValue <= max;
      });
    }

    return filtered;
  }, [allProducts, dbProducts, products, selectedSubCategory, selectedPriceRange]);

  // Tính priceCounts dựa trên filteredProducts
  const priceCounts = priceRanges.map(({ min, max }) => {
    return filteredProducts.filter(product => {
      const productPrice = typeof product.unitPrice === 'string'
        ? parseFloat(product.unitPrice.replace(/[₫,]/g, ""))
        : parseFloat(product.unitPrice || 0);
      return (
        (min ? productPrice >= min : true) && (max ? productPrice <= max : true)
      );
    }).length;
  });

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h2 className="text-gray-800 text-lg font-bold flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          {t("common.filters") || "Bộ Lọc"}
        </h2>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Clear Filter Button */}
        <button
          onClick={clearFilters}
          className="w-full border-2 border-gray-300 text-gray-600 font-medium py-2.5 px-4 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          {t("common.clear_filters") || "Xóa Bộ Lọc"}
        </button>

        {/* Category */}
        <div>
          <div
            className="flex justify-between items-center font-bold text-gray-800 cursor-pointer hover:text-gray-600 transition-colors pb-3 border-b border-gray-200"
            onClick={() => toggleSection("category")}
          >
            <span className="text-base">{t("common.category") || "Danh Mục"}</span>
            {expanded.category ? (
              <ChevronUp size={20} className="text-gray-500" />
            ) : (
              <ChevronDown size={20} className="text-gray-500" />
            )}
          </div>
          {expanded.category && (
            <div className="mt-3 space-y-2">
              {Object.keys(categoryStructure).map(parentCategory => (
                <div key={parentCategory} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Parent Category - display only, no selection */}
                  <div
                    className="flex justify-between items-center cursor-pointer px-3 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-800 font-medium transition-all duration-200"
                    onClick={() => toggleCategory(parentCategory)}
                  >
                    <span className="text-sm">{parentCategory}</span>
                    {expandedCategories[parentCategory] ? (
                      <ChevronUp size={16} className="text-gray-600" />
                    ) : (
                      <ChevronDown size={16} className="text-gray-600" />
                    )}
                  </div>

                  {/* Sub Categories */}
                  {expandedCategories[parentCategory] && (
                    <div className="bg-white">
                      {categoryStructure[parentCategory].map(subCategory => {
                        const isSelected = selectedSubCategory === subCategory;
                        return (
                          <div
                            key={subCategory}
                            className={`px-5 py-2 text-sm cursor-pointer transition-all duration-200 ${
                              isSelected
                                ? "bg-indigo-50 text-indigo-700 font-semibold"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                            onClick={() => {
                              setSelectedSubCategory(isSelected ? "" : subCategory);
                            }}
                          >
                            {subCategory}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Price */}
        <div>
          <div
            className="flex justify-between items-center font-bold text-gray-800 cursor-pointer hover:text-gray-600 transition-colors pb-3 border-b border-gray-200"
            onClick={() => toggleSection("price")}
          >
            <span className="text-base">{t("common.price") || "Giá"}</span>
            {expanded.price ? (
              <ChevronUp size={20} className="text-gray-500" />
            ) : (
              <ChevronDown size={20} className="text-gray-500" />
            )}
          </div>
          {expanded.price && (
            <div className="mt-3 space-y-1.5">
              {priceRanges.map(({ label }, index) => (
                <div
                  key={label}
                  className={`flex justify-between items-center cursor-pointer px-3 py-2.5 rounded-lg transition-all duration-200 ${selectedPriceRange === label
                      ? "bg-gray-100 text-gray-900 font-medium border border-gray-300"
                      : "hover:bg-gray-50 text-gray-700 border border-transparent"
                    }`}
                  onClick={() => {
                    setSelectedPriceRange(label);
                  }}
                >
                  <span className="text-xs font-medium whitespace-nowrap truncate mr-2">{label}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${selectedPriceRange === label
                      ? "bg-gray-200 text-gray-800"
                      : "bg-gray-100 text-gray-600"
                    }`}>
                    {priceCounts[index]} SP
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filter Name */}
        <div>
          <div
            className="flex justify-between items-center font-bold text-gray-800 cursor-pointer hover:text-gray-600 transition-colors pb-3 border-b border-gray-200"
            onClick={() => toggleSection("name")}
          >
            <span className="text-base">{t("common.filter_name") || "Tên Sản Phẩm"}</span>
            {expanded.name ? (
              <ChevronUp size={20} className="text-gray-500" />
            ) : (
              <ChevronDown size={20} className="text-gray-500" />
            )}
          </div>
          {expanded.name && (
            <input
              type="text"
              value={filterName}
              onChange={e => setFilterName(e.target.value)}
              placeholder={t("common.search_by_name") || "Tìm kiếm theo tên..."}
              className="mt-3 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 transition-all"
            />
          )}
        </div>

        {/* Apply Filters Button */}
        <button
          type="button"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
          onClick={() => {
            const sourceList = selectedSubCategory ? dbProducts : (allProducts || products);
            let finalFiltered = [...sourceList];

            if (selectedSubCategory && subCategoryMapping[selectedSubCategory]) {
              const { list, brand } = subCategoryMapping[selectedSubCategory];
              finalFiltered = finalFiltered.filter(product => {
                const matchesCategory = list.includes(product.categoryId);
                if (!matchesCategory) return false;
                if (brand) {
                  const itemBrandName = (product.brandName || product.brand?.name || product.brand || "").toLowerCase();
                  const productName = (product.name || product.productName || "").toLowerCase();
                  const searchBrand = brand.toLowerCase();
                  return itemBrandName.includes(searchBrand) || productName.includes(searchBrand);
                }
                return true;
              });
            }

            if (selectedPriceRange) {
              const [minStr, maxStr] = selectedPriceRange.split(" - ");
              const min = parseFloat(minStr.replace(/[₫,]/g, ""));
              const max = maxStr
                ? parseFloat(maxStr.replace(/[₫,]/g, ""))
                : Infinity;

              finalFiltered = finalFiltered.filter(product => {
                const priceValue = typeof product.unitPrice === 'string'
                  ? parseFloat(product.unitPrice.replace(/[₫,]/g, ""))
                  : parseFloat(product.unitPrice || product.price || 0);

                return priceValue >= min && priceValue <= max;
              });
            }
            if (filterName.trim()) {
              const q = filterName.trim().toLowerCase();
              finalFiltered = finalFiltered.filter(product =>
                product.name?.toLowerCase().includes(q)
              );
            }

            onApplyFilters(finalFiltered);
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {t("common.apply_filters") || "Áp Dụng Bộ Lọc"}
        </button>
      </div>
    </div>
  );
};

export default SidebarFilters;