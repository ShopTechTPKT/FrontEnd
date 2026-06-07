import React, { useState, useEffect, useRef } from "react";
import formatCurrency from "../../utils/formatCurrency";

const PCBuilderModal = ({ category, components = [], selectedId, onSelect, onClose }) => {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("price_asc");
  const [view, setView] = useState("grid"); // "grid" | "list"
  const searchRef = useRef(null);

  // Focus search on open
  useEffect(() => {
    const t = setTimeout(() => searchRef.current?.focus(), 80);
    return () => clearTimeout(t);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Filter & sort
  const filtered = components
    .filter((c) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        (c.brand || "").toLowerCase().includes(q) ||
        (c.specs || "").toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === "price_asc")  return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      if (sortBy === "name_asc")   return a.name.localeCompare(b.name);
      return 0;
    });

  const BadgeEl = ({ text }) => {
    if (!text) return null;
    const colorMap = {
      "Best Seller": "bg-red-100 text-red-700 border-red-200",
      "Best Value":  "bg-green-100 text-green-700 border-green-200",
    };
    return (
      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${colorMap[text] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
        {text}
      </span>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 w-full sm:max-w-2xl bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[80vh] animate-slideInUp sm:animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-indigo-600">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M8 8h8v8H8z"/>
              </svg>
            </span>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Chọn {category?.label}
              </h2>
              <p className="text-xs text-gray-500">{filtered.length} sản phẩm</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 shrink-0">
          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
            </svg>
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Tìm ${category?.label}...`}
              className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs border border-gray-200 rounded-xl px-2 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer"
          >
            <option value="price_asc">Giá ↑</option>
            <option value="price_desc">Giá ↓</option>
            <option value="name_asc">Tên A–Z</option>
          </select>

          {/* View toggle */}
          <div className="flex border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setView("grid")}
              className={`px-2.5 py-2 transition-colors ${view === "grid" ? "bg-indigo-700 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z" />
              </svg>
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-2.5 py-2 transition-colors ${view === "list" ? "bg-indigo-700 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Component list */}
        <div className="overflow-y-auto flex-1 p-4">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <span className="mb-3 text-gray-300">
                <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.3-4.3" />
                </svg>
              </span>
              <p className="text-sm font-medium">Không tìm thấy sản phẩm phù hợp</p>
            </div>
          ) : view === "grid" ? (
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((comp) => {
                const isSelected = comp.id === selectedId;
                return (
                  <button
                    key={comp.id}
                    onClick={() => { onSelect(comp); onClose(); }}
                    className={`text-left p-3 rounded-xl border-2 transition-all ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-100"
                        : "border-gray-100 hover:border-indigo-300 hover:bg-indigo-50/40 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <BadgeEl text={comp.badge} />
                      {isSelected && (
                        <span className="w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center shrink-0">
                          <svg viewBox="0 0 12 12" fill="white" className="w-2.5 h-2.5">
                            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                          </svg>
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-gray-900 line-clamp-2 leading-snug mb-1">
                      {comp.name}
                    </p>
                    {comp.specs && (
                      <p className="text-[10px] text-gray-500 line-clamp-2 mb-1.5">{comp.specs}</p>
                    )}
                    <p className="text-sm font-bold text-indigo-700">{formatCurrency(comp.price)}</p>
                    {comp.watt > 0 && (
                      <p className="text-[10px] text-amber-600 mt-0.5 flex items-center gap-1">
                        <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                        </svg>
                        {comp.watt}W
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((comp) => {
                const isSelected = comp.id === selectedId;
                return (
                  <button
                    key={comp.id}
                    onClick={() => { onSelect(comp); onClose(); }}
                    className={`w-full text-left flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-100 hover:border-indigo-300 hover:bg-indigo-50/30 bg-white"
                    }`}
                  >
                    {/* Check indicator */}
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      isSelected ? "border-indigo-600 bg-indigo-600" : "border-gray-300"
                    }`}>
                      {isSelected && (
                        <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                          <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <p className="text-sm font-semibold text-gray-900 truncate">{comp.name}</p>
                        <BadgeEl text={comp.badge} />
                      </div>
                      {comp.specs && (
                        <p className="text-xs text-gray-500 truncate">{comp.specs}</p>
                      )}
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold text-indigo-700">{formatCurrency(comp.price)}</p>
                      {comp.watt > 0 && (
                        <p className="text-[10px] text-amber-600 flex items-center justify-end gap-1">
                          <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                          </svg>
                          {comp.watt}W
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer: skip option */}
        <div className="px-5 py-3 border-t border-gray-100 shrink-0">
          <button
            onClick={() => { onSelect(null); onClose(); }}
            className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
          >
            Bỏ qua / Chưa chọn {category?.label}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PCBuilderModal;
