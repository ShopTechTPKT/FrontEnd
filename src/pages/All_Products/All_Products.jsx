import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2, Grid, List, SlidersHorizontal } from 'lucide-react';
import ProductFilterSidebar from '../../components/product/ProductFilterSidebar';
import ProductCard from '../../components/product/ProductCard';
import ErrorBoundary from '../../components/ErrorBoundary';
import { filterProducts } from '../../apis/productApi';
import CategoryTabBar from '../../components/ui/CategoryTabBar';

function All_Products() {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentFilters, setCurrentFilters] = useState({});
    const [totalProducts, setTotalProducts] = useState(0);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [sortBy, setSortBy] = useState('default'); // 'default', 'price_asc', 'price_desc', 'name_asc'
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [activeCategoryTab, setActiveCategoryTab] = useState("all");

    const categoryPathToId = {
        "/all_products": "all",
        "/laptops": "laptop",
        "/desktops": "desktop",
        "/pc_parts": "pc_parts",
        "/printer_scanner": "printer_scanner",
        "/networking_devices": "networking",
    };

    const getAppliedFilterChips = () => {
        const chips = [];
        if (currentFilters.categoryName) {
            chips.push({ key: "categoryName", label: `Danh mục: ${currentFilters.categoryName}` });
        }
        if (currentFilters.brand) {
            chips.push({ key: "brand", label: `Hãng: ${currentFilters.brand}` });
        }
        if (currentFilters.searchName) {
            chips.push({ key: "searchName", label: `Từ khóa: ${currentFilters.searchName}` });
        }
        if (currentFilters.minPrice !== undefined || currentFilters.maxPrice !== undefined) {
            const min = currentFilters.minPrice ?? 0;
            const max = currentFilters.maxPrice ?? "∞";
            chips.push({ key: "price", label: `Giá: ${min} - ${max}` });
        }
        if (currentFilters.status) {
            chips.push({ key: "status", label: `Trạng thái: ${currentFilters.status}` });
        }
        if (currentFilters.categoryIds?.length) {
            chips.push({ key: "categoryIds", label: `${currentFilters.categoryIds.length} danh mục từ điều hướng` });
        }
        return chips;
    };

    const clearSingleFilter = (key) => {
        const next = { ...currentFilters };
        if (key === "price") {
            delete next.minPrice;
            delete next.maxPrice;
        } else {
            delete next[key];
        }
        setCurrentFilters(next);
        loadProducts(next);
    };

    // Load products on mount with filters from navigation state
    useEffect(() => {
        loadProducts(initialFilters);
    }, [location.key]); // Use location.key to trigger on every navigation

    useEffect(() => {
        const tab = categoryPathToId[location.pathname] || "all";
        setActiveCategoryTab(tab);
    }, [location.pathname]);

    useEffect(() => {
        if (!showMobileFilters) return;
        const original = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = original;
        };
    }, [showMobileFilters]);

    const loadProducts = async (filters) => {
        setLoading(true);
        setError(null);
        try {
            const response = await filterProducts(filters);
            // Backend trả về ProductFilterResponseDTO: { products: [], totalProducts: number }
            if (!response) {
                throw new Error("Response is null or undefined");
            }

            // Handle case where products might be in response.data or directly in response
            const productsData = response.products || response.data?.products || [];
            const totalCount = response.totalProducts || response.data?.totalProducts || 0;
            // Map backend ProductFilterDTO to frontend ProductCard format
            const mappedProducts = productsData.map((p, index) => {
                try {
                    return {
                        productID: p.id || index,
                        productName: p.name || 'Unknown Product',
                        price: p.hasDiscount ? (p.discountPrice || p.unitPrice || 0) : (p.unitPrice || 0),
                        originalPrice: p.unitPrice || 0,
                        image: p.imageUrl || '/images/placeholder.png',
                        inStock: p.status === 'ACTIVE',
                        categoryName: p.categoryName || 'Uncategorized',
                        hasDiscount: p.hasDiscount || false,
                        percentage: p.percentage || 0,
                        quantity: p.quantity || 0,
                        status: p.status || 'INACTIVE'
                    };
                } catch (err) {
                    console.error("❌ Error mapping product:", p, err);
                    return null;
                }
            }).filter(p => p !== null); // Remove failed mappings
            setProducts(mappedProducts);
            setTotalProducts(totalCount);
        } catch (err) {
            console.error("❌ Error loading products:", err);
            console.error("❌ Error details:", {
                message: err.message,
                response: err.response,
                status: err.response?.status,
                data: err.response?.data
            });

            const errorMessage = err.response?.data?.message
                || err.message
                || "Không thể kết nối đến server. Vui lòng kiểm tra Backend đã chạy chưa!";

            setError(errorMessage);
            setProducts([]);
            setTotalProducts(0);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (filters) => {
        setCurrentFilters(filters);
        setShowMobileFilters(false); // Close mobile filters after apply
        loadProducts(filters);
    };

    // Sort products locally
    const sortProducts = (productsToSort) => {
        const sorted = [...productsToSort];
        switch (sortBy) {
            case 'price_asc':
                return sorted.sort((a, b) => a.price - b.price);
            case 'price_desc':
                return sorted.sort((a, b) => b.price - a.price);
            case 'name_asc':
                return sorted.sort((a, b) => a.productName.localeCompare(b.productName));
            case 'name_desc':
                return sorted.sort((a, b) => b.productName.localeCompare(a.productName));
            default:
                return sorted;
        }
    };

    const displayedProducts = sortProducts(products);
    const appliedFilterChips = getAppliedFilterChips();
    const categoryCounts = {
        all: totalProducts || products.length,
        laptop: products.filter((p) => (p.categoryName || "").toLowerCase().includes("laptop")).length,
        desktop: products.filter((p) => (p.categoryName || "").toLowerCase().includes("desktop") || (p.categoryName || "").toLowerCase().includes("pc")).length,
        pc_parts: products.filter((p) => (p.categoryName || "").toLowerCase().includes("linh kiện") || (p.categoryName || "").toLowerCase().includes("part")).length,
        keyboard_mouse: products.filter((p) => {
            const c = (p.categoryName || "").toLowerCase();
            return c.includes("keyboard") || c.includes("bàn phím") || c.includes("chuột") || c.includes("mouse");
        }).length,
        mouse: products.filter((p) => (p.categoryName || "").toLowerCase().includes("chuột") || (p.categoryName || "").toLowerCase().includes("mouse")).length,
        headset: products.filter((p) => (p.categoryName || "").toLowerCase().includes("headset") || (p.categoryName || "").toLowerCase().includes("tai nghe")).length,
        printer_scanner: products.filter((p) => (p.categoryName || "").toLowerCase().includes("printer") || (p.categoryName || "").toLowerCase().includes("máy in")).length,
        networking: products.filter((p) => (p.categoryName || "").toLowerCase().includes("network")).length,
    };

    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 py-8">
                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {t('product.allproducts') || 'Tất Cả Sản Phẩm'}
                        </h1>
                        <p className="text-gray-600">
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {t('common.loading') || 'Đang tải...'}
                                </span>
                            ) : (
                                <span>
                                    {t('product.showing_results') || 'Hiển thị'} <span className="font-semibold text-blue-600">{totalProducts}</span> {t('common.products') || 'sản phẩm'}
                                    {appliedFilterChips.length > 0 && (
                                        <span className="ml-2 text-sm text-gray-500">
                                            ({appliedFilterChips.length} bộ lọc đang áp dụng)
                                        </span>
                                    )}
                                </span>
                            )}
                        </p>
                        {appliedFilterChips.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {appliedFilterChips.map((chip) => (
                                    <button
                                        key={chip.key}
                                        onClick={() => clearSingleFilter(chip.key)}
                                        className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 hover:bg-violet-100"
                                        title="Bấm để bỏ bộ lọc này"
                                    >
                                        <span>{chip.label}</span>
                                        <span aria-hidden="true">x</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <CategoryTabBar
                        activeId={activeCategoryTab}
                        sticky
                        counts={categoryCounts}
                        onSelect={(_, path) => {
                            if (path && location.pathname !== path) {
                                navigate(path);
                            }
                        }}
                    />

                    {/* Main Content */}
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Sidebar Filter - Desktop */}
                        <aside className="hidden lg:block lg:w-80 flex-shrink-0">
                            <div className="sticky top-4">
                                <ProductFilterSidebar
                                    onFilterChange={handleFilterChange}
                                    currentFilters={currentFilters}
                                />
                            </div>
                        </aside>

                        {/* Mobile Filter Button */}
                        <button
                            onClick={() => setShowMobileFilters(!showMobileFilters)}
                            className="lg:hidden fixed bottom-4 right-4 z-50 bg-violet-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-violet-700 flex items-center gap-2"
                        >
                            <SlidersHorizontal size={20} />
                            <span className="font-semibold">{t("common.filter") || "Lọc"}</span>
                            {appliedFilterChips.length > 0 && (
                                <span className="text-xs bg-white/20 rounded-full px-2 py-0.5">
                                    {appliedFilterChips.length}
                                </span>
                            )}
                        </button>

                        {/* Mobile Filter Modal */}
                        {showMobileFilters && (
                            <div className="lg:hidden fixed inset-0 z-50 bg-black/45 backdrop-blur-[1px]" onClick={() => setShowMobileFilters(false)}>
                                <div className="absolute bottom-0 left-0 right-0 max-h-[88vh] rounded-t-2xl bg-white overflow-y-auto animate-[slideUp_280ms_ease-out]" onClick={(e) => e.stopPropagation()}>
                                    <div className="p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-sm font-semibold text-gray-900">
                                                {t("common.filters") || "Bộ lọc"}
                                            </h3>
                                            <button
                                                onClick={() => setShowMobileFilters(false)}
                                                className="text-sm text-gray-600 hover:text-gray-900"
                                            >
                                                {t("common.close") || "Đóng"}
                                            </button>
                                        </div>
                                        <ProductFilterSidebar
                                            onFilterChange={handleFilterChange}
                                            currentFilters={currentFilters}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Products Grid */}
                        <main className="flex-1">
                            {/* Toolbar - Sort & View Mode */}
                            <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm">
                                <div className="flex items-center gap-4">
                                    {/* Sort Dropdown */}
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm text-gray-600">{t('common.sort_by') || 'Sắp xếp:'}  </label>
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="border rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="default">{t('common.default') || 'Mặc định'}</option>
                                            <option value="price_asc">{t('common.price_low_to_high') || 'Giá: Thấp đến Cao'}</option>
                                            <option value="price_desc">{t('common.price_high_to_low') || 'Giá: Cao đến Thấp'}</option>
                                            <option value="name_asc">{t('common.name_az') || 'Tên: A-Z'}</option>
                                            <option value="name_desc">{t('common.name_za') || 'Tên: Z-A'}</option>
                                        </select>
                                    </div>
                                </div>

                                {/* View Mode Toggle */}
                                <div className="hidden sm:flex items-center gap-2">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        <Grid size={20} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        <List size={20} />
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg mb-6 shadow-md">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-red-800">
                                                Lỗi kết nối
                                            </h3>
                                            <div className="mt-2 text-sm text-red-700">
                                                <p>{error}</p>
                                                <p className="mt-2">
                                                    <strong>Cách khắc phục:</strong>
                                                </p>
                                                <ul className="list-disc list-inside mt-1 space-y-1">
                                                    <li>Kiểm tra Backend đang chạy trên <code className="bg-red-100 px-1 rounded">http://localhost:8081</code></li>
                                                    <li>Kiểm tra endpoint <code className="bg-red-100 px-1 rounded">POST /api/products/filter</code> đã được implement chưa</li>
                                                    <li>Xem Console (F12) để biết thêm chi tiết</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {loading ? (
                                <div className="flex justify-center items-center h-64">
                                    <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                                </div>
                            ) : displayedProducts.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="mb-4 flex justify-center text-gray-300">
                                        <svg viewBox="0 0 24 24" fill="none" className="w-12 h-12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M3 7l9 5 9-5-9-5-9 5z" />
                                            <path d="M3 17l9 5 9-5" />
                                            <path d="M3 12l9 5 9-5" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                        {t('product.no_products') || 'Không tìm thấy sản phẩm'}
                                    </h3>
                                    <p className="text-gray-500">
                                        {t('product.try_different_filters') || 'Thử thay đổi bộ lọc để xem thêm sản phẩm'}
                                    </p>
                                </div>
                            ) : (
                                <div className={
                                    viewMode === 'grid'
                                        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                                        : "flex flex-col gap-4"
                                }>
                                    {displayedProducts.map((product) => {
                                        try {
                                            return (
                                                <ProductCard
                                                    key={product.productID}
                                                    product={product}
                                                />
                                            );
                                        } catch (err) {
                                            console.error("Error rendering product:", product, err);
                                            return (
                                                <div key={product.productID} className="p-4 border border-red-300 bg-red-50 rounded">
                                                    <p className="text-red-700">Lỗi hiển thị sản phẩm: {product.productName}</p>
                                                </div>
                                            );
                                        }
                                    })}
                                </div>
                            )}
                        </main>
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    );
}

export default All_Products;