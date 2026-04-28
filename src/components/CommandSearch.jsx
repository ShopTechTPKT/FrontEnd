import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import formatCurrency from "../utils/formatCurrency";

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

  // Load products from the mock service
  useEffect(() => {
    import("../services/MockProductService").then((mod) => {
      if (mod.getAllProducts) {
        mod.getAllProducts().then((res) => {
          if (res?.DT) setAllProducts(res.DT);
        });
      }
    });
  }, []);

  // Global keyboard shortcut
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
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Search logic
  const handleSearch = useCallback(
    (value) => {
      setQuery(value);
      setSelectedIndex(0);
      if (!value.trim()) {
        setResults([]);
        return;
      }
      const q = value.toLowerCase();
      const filtered = allProducts
        .filter(
          (p) =>
            (p.productName || p.name || "").toLowerCase().includes(q) ||
            (p.categoryName || "").toLowerCase().includes(q)
        )
        .slice(0, 8);
      setResults(filtered);
    },
    [allProducts]
  );

  const handleSelect = (product) => {
    navigate(`/product/${product.productID || product.id}/productAbout`);
    setIsOpen(false);
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
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
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Search panel */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-fadeIn mx-4">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("search.command_placeholder") || "Tìm kiếm sản phẩm..."}
            className="flex-1 text-base text-gray-900 placeholder:text-gray-400 bg-transparent border-0 outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-xs text-gray-400 bg-gray-100 rounded border border-gray-200 font-mono">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {results.length > 0 ? (
            <ul className="py-2">
              {results.map((product, idx) => (
                <li key={product.productID || product.id || idx}>
                  <button
                    onClick={() => handleSelect(product)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      idx === selectedIndex
                        ? "bg-violet-50 text-violet-700"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      <img
                        src={product.image || product.imageUrl}
                        alt=""
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {product.productName || product.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {product.categoryName || ""}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-violet-700 shrink-0">
                      {formatCurrency(product.price || product.unitPrice || 0)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : query.trim() ? (
            <div className="py-8 text-center text-sm text-gray-400">
              {t("search.no_results") || "Không tìm thấy sản phẩm"}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-gray-400">
              {t("search.start_typing") || "Gõ để tìm kiếm..."}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200 font-mono">↑↓</kbd>
            {t("search.navigate") || "di chuyển"}
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200 font-mono">↵</kbd>
            {t("search.select") || "chọn"}
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200 font-mono">Ctrl+K</kbd>
            {t("search.toggle") || "đóng/mở"}
          </span>
        </div>
      </div>
    </div>
  );
}
