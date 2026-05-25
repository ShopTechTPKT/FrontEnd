import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import formatCurrency from "../utils/formatCurrency";
import { getAllProducts } from "../apis/productApi";
import useDebouncedValue from "../hooks/useDebouncedValue";

/**
 * CommandSearch — Global command palette search (Ctrl+K / Cmd+K).
 * Fullscreen overlay with instant product search results.
 */
export default function CommandSearch() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [allProducts, setAllProducts] = useState([]);
  const debouncedQuery = useDebouncedValue(query, 180);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await getAllProducts();
        if (res?.DT) setAllProducts(res.DT);
      } catch (error) {
        console.error("Failed to load products for command search:", error);
        setAllProducts([]);
      }
    };
    loadProducts();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    const handleOpenCommandSearch = () => {
      setIsOpen(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-command-search", handleOpenCommandSearch);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-command-search", handleOpenCommandSearch);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }

    const q = debouncedQuery.toLowerCase();
    const filtered = allProducts
      .filter(
        (p) =>
          (p.productName || p.name || "").toLowerCase().includes(q) ||
          (p.categoryName || "").toLowerCase().includes(q)
      )
      .slice(0, 8);

    setResults(filtered);
  }, [debouncedQuery, allProducts]);

  const handleSearch = useCallback((value) => {
    setQuery(value);
    setSelectedIndex(0);
  }, []);

  const handleSelect = (product) => {
    navigate(`/product/${product.productID || product.id}/productAbout`);
    setIsOpen(false);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      handleSelect(results[selectedIndex]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh]" role="dialog" aria-modal="true" aria-label={t("search.search") || "Search"}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

      <div className="relative mx-4 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl animate-fadeIn">
        <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
          <svg className="h-5 w-5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder={t("search.command_placeholder") || "Tìm kiếm sản phẩm..."}
            className="flex-1 border-0 bg-transparent text-base text-gray-900 placeholder:text-gray-400 outline-none"
            aria-label={t("search.search_for_products") || "Tìm kiếm sản phẩm"}
          />
          <kbd className="hidden items-center rounded border border-gray-200 bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-400 sm:inline-flex">ESC</kbd>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {results.length > 0 ? (
            <ul className="py-2">
              {results.map((product, idx) => (
                <li key={product.productID || product.id || idx}>
                  <button
                    onClick={() => handleSelect(product)}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${idx === selectedIndex ? "bg-violet-50 text-violet-700" : "text-gray-700 hover:bg-gray-50"}`}
                  >
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      <img
                        src={product.image || product.imageUrl}
                        alt={product.productName || product.name || "Product image"}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{product.productName || product.name}</p>
                      <p className="text-xs text-gray-400">{product.categoryName || ""}</p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-violet-700">{formatCurrency(product.price || product.unitPrice || 0)}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : query.trim() ? (
            <div className="py-8 text-center text-sm text-gray-400">{t("search.no_results") || "Không tìm thấy sản phẩm"}</div>
          ) : (
            <div className="py-8 text-center text-sm text-gray-400">{t("search.start_typing") || "Gõ để tìm kiếm..."}</div>
          )}
        </div>

        <div className="flex items-center gap-4 border-t border-gray-100 px-4 py-2 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 font-mono">↑↓</kbd>
            {t("search.navigate") || "di chuyển"}
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 font-mono">↵</kbd>
            {t("search.select") || "chọn"}
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 font-mono">Ctrl+K</kbd>
            {t("search.toggle") || "đóng/mở"}
          </span>
        </div>
      </div>
    </div>
  );
}
