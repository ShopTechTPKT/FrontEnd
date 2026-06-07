import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getFilterOptions } from "../../apis/productApi";

/**
 * ProductFilterSidebar Component
 * Sidebar component for filtering products based on categories, price ranges, and status
 */
const ProductFilterSidebar = ({ onFilterChange, currentFilters }) => {
    const { t } = useTranslation();

    // State for filter options from backend
    const [filterOptions, setFilterOptions] = useState({
        categoryOptions: [],
        priceRanges: [],
        statusOptions: []
    });

    // State for expanded sections
    const [expanded, setExpanded] = useState({
        category: true,
        price: true,
        status: true,
        name: true,
    });

    // Local filter state
    const [filters, setFilters] = useState({
        categoryId: null,
        categoryName: "",
        minPrice: null,
        maxPrice: null,
        status: "",
        searchName: ""
    });

    useEffect(() => {
        setFilters((prev) => ({
            ...prev,
            ...currentFilters,
            categoryName: currentFilters?.categoryName || prev.categoryName || "",
        }));
    }, [currentFilters]);

    // Fetch filter options on component mount
    useEffect(() => {
        loadFilterOptions();
    }, []);

    const loadFilterOptions = async () => {
        try {
            const response = await getFilterOptions();

            // Backend trả về FilterOptionsResponseDTO trực tiếp
            setFilterOptions({
                categoryOptions: response.categoryOptions || [],
                priceRanges: response.priceRanges || [],
                statusOptions: response.statusOptions || []
            });
        } catch (error) {
            console.error("❌ Error loading filter options:", error);
            // Set empty arrays on error
            setFilterOptions({
                categoryOptions: [],
                priceRanges: [],
                statusOptions: []
            });
        }
    };

    const toggleSection = (section) => {
        setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleCategorySelect = (category) => {
        const isSelected = filters.categoryId === category.categoryId;
        const newFilters = {
            ...filters,
            categoryId: isSelected ? null : category.categoryId,
            categoryName: isSelected ? "" : category.categoryName
        };
        setFilters(newFilters);

        // Apply filter ngay lập tức
        const cleanedFilters = cleanFilters(newFilters);
        onFilterChange(cleanedFilters);
    };

    const handlePriceRangeSelect = (range) => {
        const isSelected =
            filters.minPrice === range.minPrice && filters.maxPrice === range.maxPrice;

        const newFilters = {
            ...filters,
            minPrice: isSelected ? null : range.minPrice,
            maxPrice: isSelected ? null : range.maxPrice
        };

        setFilters(newFilters);

        // Apply filter ngay lập tức
        const cleanedFilters = cleanFilters(newFilters);

        onFilterChange(cleanedFilters);
    };

    const handleStatusSelect = (status) => {
        const nextStatus = filters.status === status ? "" : status;
        const newFilters = {
            ...filters,
            status: nextStatus
        };
        setFilters(newFilters);

        // Apply filter ngay lập tức
        const cleanedFilters = cleanFilters(newFilters);
        onFilterChange(cleanedFilters);
    };

    const handleSearchNameChange = (e) => {
        setFilters({
            ...filters,
            searchName: e.target.value
        });
    };

    // Helper function to clean filters
    const cleanFilters = (filtersToClean) => {
        const cleaned = Object.entries(filtersToClean).reduce((acc, [key, value]) => {
            // Don't send categoryName to backend (only categoryId)
            if (key === 'categoryName') {
                return acc;
            }
            if (value !== null && value !== "" && value !== undefined) {
                acc[key] = value;
            }
            return acc;
        }, {});
        return cleaned;
    };

    const handleApplyFilters = () => {
        // Chỉ dùng cho search name hoặc custom input
        const cleanedFilters = cleanFilters(filters);
        onFilterChange(cleanedFilters);
    };

    const handleClearFilters = () => {
        const emptyFilters = {
            categoryId: null,
            categoryName: "",
            minPrice: null,
            maxPrice: null,
            status: "",
            searchName: ""
        };
        setFilters(emptyFilters);
        onFilterChange({});
    };

    const activeFilterCount = [
        filters.categoryId,
        filters.status,
        filters.searchName?.trim(),
        filters.minPrice != null || filters.maxPrice != null ? "price" : "",
    ].filter(Boolean).length;

    return (
        <div className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl shadow-sm">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-800">
                        {t("common.filters") || "Bộ Lọc"}
                    </h2>
                    {activeFilterCount > 0 && (
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                            {activeFilterCount} {t("common.apply_filters") || "đang áp dụng"}
                        </span>
                    )}
                </div>
            </div>

            <div className="px-5 py-4">
                {/* Clear Filter Button */}
                <button
                    onClick={handleClearFilters}
                    className="w-full border border-gray-300 text-gray-600 font-medium py-2.5 rounded-xl mb-5 hover:bg-gray-50 transition-colors"
                >
                    {t("common.clear_filters") || "Xóa Bộ Lọc"}
                </button>

                {/* Category Filter - Danh Mục */}
                <div className="mb-6">
                    <div
                        className="flex justify-between items-center cursor-pointer mb-3"
                        onClick={() => toggleSection("category")}
                    >
                        <span className="font-bold text-base text-gray-800">{t("common.category") || "Danh Mục"}</span>
                        {expanded.category ? (
                            <ChevronUp size={20} className="text-gray-600" />
                        ) : (
                            <ChevronDown size={20} className="text-gray-600" />
                        )}
                    </div>
                    {expanded.category && (
                        <div className="space-y-1.5 max-h-80 overflow-y-auto">
                            {filterOptions.categoryOptions && filterOptions.categoryOptions.length > 0 ? (
                                filterOptions.categoryOptions.map((category) => (
                                    <div
                                        key={category.categoryId}
                                        className={`flex justify-between items-center cursor-pointer px-3 py-2.5 rounded-lg border transition-colors ${filters.categoryId === category.categoryId
                                            ? "bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-400"
                                            : "hover:bg-gray-50 text-gray-700"
                                            }`}
                                        onClick={() => handleCategorySelect(category)}
                                    >
                                        <span className="text-sm font-medium">{category.categoryName}</span>
                                        <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full">
                                            {category.productCount}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-gray-400 text-sm text-center py-4">
                                    {t("common.loading") || "Đang tải..."}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Price Filter - Giá */}
                <div className="mb-6">
                    <div
                        className="flex justify-between items-center cursor-pointer mb-3"
                        onClick={() => toggleSection("price")}
                    >
                        <span className="font-bold text-base text-gray-800">{t("common.price") || "Giá"}</span>
                        {expanded.price ? (
                            <ChevronUp size={20} className="text-gray-600" />
                        ) : (
                            <ChevronDown size={20} className="text-gray-600" />
                        )}
                    </div>
                    {expanded.price && (
                        <div className="space-y-1.5">
                            {filterOptions.priceRanges && filterOptions.priceRanges.length > 0 ? (
                                filterOptions.priceRanges.map((range, index) => (
                                    <div
                                        key={index}
                                        className={`flex justify-between items-center cursor-pointer px-3 py-2.5 rounded-lg border transition-colors ${filters.minPrice === range.minPrice && filters.maxPrice === range.maxPrice
                                            ? "bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-400"
                                            : "hover:bg-gray-50 text-gray-700"
                                            }`}
                                        onClick={() => handlePriceRangeSelect(range)}
                                    >
                                        <span className="text-sm font-medium">{range.rangeLabel}</span>
                                        <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full">
                                            {range.productCount} {t("common.products") || "Sản phẩm"}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-gray-400 text-sm text-center py-4">
                                    {t("common.loading") || "Đang tải..."}
                                </div>
                            )}

                            {/* Custom price range input */}
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="flex items-center gap-2">
                                    <button
                                        className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        {t("common.min") || "Tối Thiểu"}
                                    </button>
                                    <button
                                        className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        {t("common.max") || "Tối Đa"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Status Filter */}
                <div className="mb-6">
                    <div
                        className="flex justify-between items-center cursor-pointer mb-3"
                        onClick={() => toggleSection("status")}
                    >
                        <span className="font-bold text-base text-gray-800">{t("common.status") || "Trạng thái"}</span>
                        {expanded.status ? (
                            <ChevronUp size={20} className="text-gray-600" />
                        ) : (
                            <ChevronDown size={20} className="text-gray-600" />
                        )}
                    </div>
                    {expanded.status && (
                        <div className="flex flex-wrap gap-2">
                            {(filterOptions.statusOptions || []).map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => handleStatusSelect(option)}
                                    className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                                        filters.status === option
                                            ? "bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-400"
                                            : "bg-white border-gray-200 text-gray-600 hover:border-indigo-200 hover:text-indigo-600"
                                    }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Ten Bo Loc - Filter Name */}
                <div className="mb-6">
                    <div
                        className="flex justify-between items-center cursor-pointer mb-3"
                        onClick={() => toggleSection("name")}
                    >
                        <span className="font-bold text-base text-gray-800">{t("common.filter_name") || "Tên sản phẩm"}</span>
                        {expanded.name ? (
                            <ChevronUp size={20} className="text-gray-600" />
                        ) : (
                            <ChevronDown size={20} className="text-gray-600" />
                        )}
                    </div>
                    {expanded.name && (
                        <input
                            type="text"
                            value={filters.searchName}
                            onChange={handleSearchNameChange}
                            placeholder={t("common.search_by_name") || "Tìm kiếm theo tên..."}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                    )}
                </div>

                {/* Apply Filters Button */}
                <button
                    className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 active:scale-[0.97] transition-all shadow-sm"
                    onClick={handleApplyFilters}
                >
                    {t("common.apply_filters") || "Áp dụng bộ lọc"}
                </button>
            </div>
        </div>
    );
};

export default ProductFilterSidebar;