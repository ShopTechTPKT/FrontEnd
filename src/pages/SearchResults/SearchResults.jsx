import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { searchAdvancedProducts } from "../../apis/productApi";
import ProductCard from "../../components/product/ProductCard";
import { VirtualProductGrid } from "../../components/ui";
import Button from "../../components/ui/Button";
import { Search, SlidersHorizontal, ArrowUpDown, Tag, Check, RefreshCw } from "lucide-react";

export default function SearchResults() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [facets, setFacets] = useState({ categories: {}, statuses: {} });
  const [inputVal, setInputVal] = useState("");

  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const sortBy = searchParams.get("sortBy") || "relevance";
  const inStock = searchParams.get("inStock") || "";

  useEffect(() => {
    setInputVal(q);
  }, [q]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await searchAdvancedProducts({
          q: q || undefined,
          category: category || undefined,
          inStock: inStock || undefined,
          sortBy,
        });
        setProducts(Array.isArray(data?.products) ? data.products : []);
        setFacets(data?.facets || { categories: {}, statuses: {} });
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [q, category, inStock, sortBy]);

  const categoryList = useMemo(() => Object.entries(facets?.categories || {}), [facets]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (inputVal.trim()) next.set("q", inputVal.trim());
      else next.delete("q");
      return next;
    });
  };

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 animate-fadeIn">
      {/* Top Section */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-gray-100 pb-6 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Kết quả tìm kiếm</h1>
          <p className="mt-1 text-sm text-gray-500">
            {q ? `Tìm thấy ${products.length} sản phẩm tương ứng với từ khóa "${q}"` : `Hiển thị tất cả ${products.length} sản phẩm`}
          </p>
        </div>

        {/* Input search box right inside page */}
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-sm shrink-0">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Tìm kiếm sản phẩm khác..."
            className="w-full rounded-full border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-[var(--color-primary-)] focus:bg-white dark:border-gray-800 dark:bg-gray-900"
          />
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
        </form>
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* Sidebar Filters */}
        <aside className="space-y-6 h-fit">
          {/* Sorting Box */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-3 flex items-center gap-2 font-bold text-gray-900 dark:text-gray-100 text-sm uppercase tracking-wide">
              <ArrowUpDown className="h-4 w-4 text-[var(--color-primary-)]" />
              <span>Sắp xếp</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                next.set("sortBy", e.target.value);
                return next;
              })}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-primary-)] focus:bg-white dark:border-gray-850 dark:bg-gray-950"
            >
              <option value="relevance">Mức độ liên quan</option>
              <option value="price_asc">Giá tăng dần</option>
              <option value="price_desc">Giá giảm dần</option>
              <option value="name_asc">Tên từ A-Z</option>
            </select>
          </div>

          {/* Categories Filter Box */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-3 flex items-center gap-2 font-bold text-gray-900 dark:text-gray-100 text-sm uppercase tracking-wide">
              <Tag className="h-4 w-4 text-[var(--color-primary-)]" />
              <span>Danh mục</span>
            </div>
            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
              <button
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-medium transition-all ${
                  !category 
                    ? "bg-[var(--color-primary-)] text-[var(--color-primary-)] dark:bg-[var(--color-primary-)]/30 dark:text-[var(--color-primary-)]" 
                    : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/40"
                }`}
                onClick={() => setSearchParams((prev) => {
                  const next = new URLSearchParams(prev);
                  next.delete("category");
                  return next;
                })}
              >
                <span>Tất cả</span>
                {!category && <Check className="h-4 w-4" />}
              </button>

              {categoryList.map(([name, count]) => {
                const isActive = category === name;
                return (
                  <button
                    key={name}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-medium transition-all ${
                      isActive 
                        ? "bg-[var(--color-primary-)] text-[var(--color-primary-)] dark:bg-[var(--color-primary-)]/30 dark:text-[var(--color-primary-)]" 
                        : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/40"
                    }`}
                    onClick={() => setSearchParams((prev) => {
                      const next = new URLSearchParams(prev);
                      next.set("category", name);
                      return next;
                    })}
                  >
                    <span className="truncate pr-2">{name}</span>
                    <span className={`text-xs ${isActive ? "text-[var(--color-primary-)] font-bold" : "text-gray-400"}`}>({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick options */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                if (inStock) next.delete("inStock");
                else next.set("inStock", "true");
                return next;
              })}
              className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold border transition-all ${
                inStock 
                  ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-500/10" 
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300"
              }`}
            >
              <Check className={`h-4 w-4 ${inStock ? "block" : "hidden"}`} />
              <span>Chỉ hiện sản phẩm còn hàng</span>
            </button>

            <button
              onClick={() => navigate("/search")}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 text-sm font-bold text-gray-500 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-400 transition-all"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Xóa bộ lọc</span>
            </button>
          </div>
        </aside>

        {/* Search Results Grid */}
        <main>
          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl border border-gray-150 p-4 space-y-3 dark:border-gray-800">
                  <div className="aspect-square w-full rounded-xl bg-gray-200 dark:bg-gray-800" />
                  <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />
                  <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-800" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16 px-4 text-center dark:border-gray-800 dark:bg-gray-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary-)] text-[var(--color-primary-)] dark:bg-[var(--color-primary-)]/40 dark:text-[var(--color-primary-)] mb-4">
                <Search className="h-6 w-6" />
              </div>
              <p className="font-bold text-gray-850 dark:text-gray-100">Không tìm thấy sản phẩm phù hợp</p>
              <p className="mt-1 text-sm text-gray-500 max-w-xs">Thử tìm kiếm với từ khóa khác hoặc nới lỏng các bộ lọc để có kết quả tốt hơn.</p>
            </div>
          ) : (
            <VirtualProductGrid
              products={products}
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
              chunkSize={6}
              minChunkHeight="450px"
              renderItem={(p) => (
                <ProductCard
                  key={p.id}
                  product={{
                    productID: p.id,
                    productName: p.name,
                    price: p.unitPrice,
                    image: p.imageUrl,
                    inStock: (p.quantity || 0) > 0,
                  }}
                />
              )}
            />
          )}
        </main>
      </div>
    </div>
  );
}
