import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { fetchTrendingKeywords } from "../../apis/aiApi";
import { getAllProducts } from "../../apis/productApi";
import VoiceSearch from "./VoiceSearch";
import BarcodeScanner from "./BarcodeScanner";

const RECENT_KEY = "shop_recent_searches";
const MAX_RECENT = 6;

function readRecent() {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string").slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

function writeRecent(term) {
  const t = term.trim();
  if (!t) return;
  const prev = readRecent().filter((x) => x.toLowerCase() !== t.toLowerCase());
  localStorage.setItem(RECENT_KEY, JSON.stringify([t, ...prev].slice(0, MAX_RECENT)));
}

let productCache = null;
async function getProductsCached() {
  if (productCache) return productCache;
  const res = await getAllProducts();
  const list = res?.EC === 1 && Array.isArray(res.DT) ? res.DT : [];
  productCache = list;
  return list;
}

function normalizeTrending(data) {
  if (!data) return [];
  if (Array.isArray(data)) {
    return data
      .map((x) => (typeof x === "string" ? x : x.keyword || x.term || x.text || x.name))
      .filter(Boolean)
      .slice(0, 8);
  }
  if (Array.isArray(data.keywords)) return normalizeTrending(data.keywords);
  return [];
}

/**
 * HeaderSearchBar - desktop inline or mobile fullscreen overlay caller
 */
export default function HeaderSearchBar({ className = "", autoFocus = false, onNavigate }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [trending, setTrending] = useState([]);
  const [recent, setRecent] = useState(() => readRecent());
  const [suggestions, setSuggestions] = useState([]);
  const rootRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    const onDoc = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const loadTrending = useCallback(async () => {
    try {
      const data = await fetchTrendingKeywords();
      setTrending(normalizeTrending(data));
    } catch {
      setTrending([]);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    loadTrending();
    setRecent(readRecent());
  }, [open, loadTrending]);

  useEffect(() => {
    if (!open || q.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const all = await getProductsCached();
        const needle = q.trim().toLowerCase();
        const match = all
          .filter((p) => {
            const name = (p.name || p.productName || "").toLowerCase();
            return name.includes(needle);
          })
          .slice(0, 5);
        if (!cancelled) setSuggestions(match);
      } catch {
        if (!cancelled) setSuggestions([]);
      }
    }, 280);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [q, open]);

  const goSearch = (term) => {
    const s = term.trim();
    if (!s) return;
    writeRecent(s);
    setOpen(false);
    if (onNavigate) onNavigate(`/search?q=${encodeURIComponent(s)}`);
    else navigate(`/search?q=${encodeURIComponent(s)}`);
    setQ("");
  };

  const formatPrice = useMemo(
    () => (p) => {
      const v = p.unitPrice ?? p.price;
      if (v == null) return "";
      const n = typeof v === "number" ? v : parseFloat(String(v).replace(/[^\d.]/g, "")) || 0;
      try {
        return new Intl.NumberFormat(undefined, { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);
      } catch {
        return `${n} ₫`;
      }
    },
    []
  );

  return (
    <div ref={rootRef} className={["relative w-full max-w-xl", className].filter(Boolean).join(" ")}>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          ref={inputRef}
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") goSearch(q);
          }}
          placeholder={t("header.searchPlaceholder", { defaultValue: "Tìm sản phẩm, danh mục..." })}
          className="h-9 w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-10 pr-28 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-950"
          autoComplete="off"
        />
        <div className="absolute inset-y-0 right-1 flex items-center gap-1">
          <BarcodeScanner
            onDetected={(code) => {
              setQ(code);
              goSearch(code);
            }}
          />
          <VoiceSearch
            onResult={(text) => {
              setQ(text);
              goSearch(text);
            }}
          />
          <button
            type="button"
            onClick={() => goSearch(q)}
            className="rounded-lg bg-indigo-600 px-3.5 py-1 text-xs font-semibold text-white hover:bg-indigo-700 active:scale-[0.96] transition-all shadow-sm shadow-indigo-500/10 mr-0.5"
          >
            {t("common.search", { defaultValue: "Tìm" })}
          </button>
        </div>
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full z-[var(--z-popover)] mt-1.5 max-h-[min(70vh,420px)] overflow-y-auto rounded-xl border border-slate-100 bg-white p-3.5 shadow-xl dark:border-slate-800 dark:bg-slate-950">
          {suggestions.length > 0 && (
            <section className="mb-3">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {t("header.suggestions", { defaultValue: "Gợi ý sản phẩm" })}
              </p>
              <ul className="space-y-1">
                {suggestions.map((p) => (
                  <li key={p.id || p.productId || p.name}>
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-colors"
                      onClick={() => {
                        const id = p.id || p.productId;
                        setOpen(false);
                        navigate(id ? `/product/${id}` : `/products?search=${encodeURIComponent(p.name || "")}`);
                      }}
                    >
                      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-slate-50 dark:bg-slate-900">
                        {p.imageUrl || p.thumbnail ? (
                          <img src={p.imageUrl || p.thumbnail} alt="" className="h-full w-full object-cover" loading="lazy" />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-950 dark:text-slate-100">{p.name || p.productName}</p>
                        <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{formatPrice(p)}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {trending.length > 0 && (
            <section className="mb-3">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {t("header.trending", { defaultValue: "Xu hướng" })}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {trending.map((kw) => (
                  <button
                    key={kw}
                    type="button"
                    className="rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-indigo-950/55 dark:hover:text-indigo-300 transition-colors"
                    onClick={() => goSearch(kw)}
                  >
                    {kw}
                  </button>
                ))}
              </div>
            </section>
          )}

          {recent.length > 0 && (
            <section className="mb-3">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {t("header.recentSearches", { defaultValue: "Tìm gần đây" })}
              </p>
              <ul className="space-y-0.5">
                {recent.map((r) => (
                  <li key={r}>
                    <button
                      type="button"
                      className="w-full rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-350 dark:hover:bg-slate-900/60 transition-colors"
                      onClick={() => goSearch(r)}
                    >
                      {r}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <button
            type="button"
            className="mt-1 w-full rounded-xl border border-slate-200 py-2.5 text-center text-xs font-semibold text-indigo-600 hover:bg-indigo-50/50 hover:border-indigo-200 dark:border-slate-800 dark:text-indigo-300 dark:hover:bg-indigo-950/30 transition-colors"
            onClick={() => goSearch(q || recent[0] || trending[0] || "")}
            disabled={!q.trim() && !recent[0] && !trending[0]}
          >
            {t("header.viewAllResults", { defaultValue: "Xem tất cả kết quả" })}
          </button>
        </div>
      )}
    </div>
  );
}
