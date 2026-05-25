import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { addToCart } from "../../utils/redux/cartSlice";
import notify from "../../utils/notify";
import formatCurrency from "../../utils/formatCurrency";
import getCurrentUserId from "../../utils/getCurrentUserId";
import {
  PC_CATEGORIES,
  PRESET_BUILDS,
  getAllComponents,
  checkCompatibility,
  calcTotalWatt,
  resolvePreset,
  savePCBuild,
  getSharedPCBuild,
} from "../../apis/pcBuilderApi";
import PCBuilderModal from "./PCBuilderModal";

const PC_BUILDER_LOCAL_KEY = "pc_builder_save";
const PC_BUILDER_RECENTS_KEY = "pc_builder_recent";

/* ── SVG Icon map ─────────────────────────────────────────── */
const CAT_ICONS = {
  cpu: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="7" y="7" width="10" height="10" rx="1"/>
      <path d="M7 9H5M7 12H5M7 15H5M17 9h2M17 12h2M17 15h2M9 7V5M12 7V5M15 7V5M9 17v2M12 17v2M15 17v2"/>
    </svg>
  ),
  mainboard: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="2"/>
      <rect x="7" y="7" width="5" height="5" rx="0.5"/>
      <path d="M14 9h3M14 12h3M9 14v3M12 14v3M5 9h2M5 12h2M9 5v2M12 5v2"/>
      <circle cx="17" cy="17" r="1.5"/>
    </svg>
  ),
  ram: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7" width="18" height="10" rx="1.5"/>
      <path d="M7 7V5M10 7V5M13 7V5M16 7V5"/>
      <rect x="6" y="10" width="2" height="4" rx="0.5"/>
      <rect x="10" y="10" width="2" height="4" rx="0.5"/>
      <rect x="14" y="10" width="2" height="4" rx="0.5"/>
    </svg>
  ),
  gpu: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2"/>
      <rect x="6" y="9" width="4" height="4" rx="0.5"/>
      <path d="M14 11h4M5 18v1M8 18v1M11 18v1M4 6V4h16v2"/>
      <circle cx="16" cy="11" r="1"/>
      <circle cx="19" cy="11" r="1"/>
    </svg>
  ),
  storage: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="6" width="18" height="5" rx="1.5"/>
      <rect x="3" y="13" width="18" height="5" rx="1.5"/>
      <circle cx="18" cy="8.5" r="1"/>
      <circle cx="18" cy="15.5" r="1"/>
    </svg>
  ),
  psu: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <path d="M13 9l-3 3h4l-3 3"/>
      <path d="M19 8h.01M19 11h.01M19 14h.01"/>
    </svg>
  ),
  case: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2"/>
      <path d="M9 6h6M9 10h2"/>
      <circle cx="12" cy="15" r="2"/>
    </svg>
  ),
  cooler: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 3c0 3-2 4-2 6s2 3 2 3M12 21c0-3 2-4 2-6s-2-3-2-3M3 12c3 0 4 2 6 2s3-2 3-2M21 12c-3 0-4-2-6-2s-3 2-3 2"/>
    </svg>
  ),
  monitor: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/>
      <path d="M8 21h8M12 17v4"/>
    </svg>
  ),
};

const getCatIcon = (iconKey) =>
  CAT_ICONS[iconKey] || (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="9"/>
    </svg>
  );


/* ── Wattage bar ──────────────────────────────────────────── */
const WattBar = ({ watts }) => {
  const pct = Math.min(100, (watts / 800) * 100);
  const color =
    pct > 85 ? "bg-red-500" : pct > 60 ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span className="flex items-center gap-1">
          <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-amber-500" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
          Tổng tiêu thụ điện
        </span>
        <span className={`font-semibold ${pct > 85 ? "text-red-600" : "text-gray-700"}`}>
          ~{watts}W
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

/* ── Component row ────────────────────────────────────────── */
const ComponentRow = ({ cat, selected, onOpen, onRemove }) => (
  <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0 group">
    {/* Icon */}
    <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--color-primary-)] text-[var(--color-primary-)] shrink-0">
      {getCatIcon(cat.iconKey)}
    </div>

    <div className="flex-1 min-w-0">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">
        {cat.label}{cat.required && <span className="text-red-400 ml-0.5">*</span>}
      </p>
      {selected ? (
        <div>
          <p className="text-sm font-semibold text-gray-900 truncate leading-tight">
            {selected.name}
          </p>
          <p className="text-xs text-gray-500 truncate">{selected.specs}</p>
        </div>
      ) : (
        <p className="text-sm text-gray-400 italic">Chưa chọn</p>
      )}
    </div>

    <div className="flex items-center gap-2 shrink-0">
      {selected && (
        <p className="text-sm font-bold text-[var(--color-primary-)] tabular-nums">
          {formatCurrency(selected.price)}
        </p>
      )}

      <button
        onClick={onOpen}
        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
          selected
            ? "bg-gray-100 text-gray-700 hover:bg-[var(--color-primary-)] hover:text-[var(--color-primary-)]"
            : "bg-[var(--color-primary-)] text-white hover:bg-[var(--color-primary-)]"
        }`}
      >
        {selected ? "Đổi" : "Chọn"}
      </button>

      {selected && (
        <button
          onClick={onRemove}
          className="p-1.5 text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
          title="Xóa"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5">
            <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════
   PCBuilder — Main page
   ══════════════════════════════════════════════════════════════ */
export default function PCBuilder() {
  const { presetId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [allComponents, setAllComponents] = useState({});
  const [selected, setSelected] = useState({}); // { catId: componentObj }
  const [openModal, setOpenModal] = useState(null); // catId string
  const [loading, setLoading] = useState(true);
  const [addingAll, setAddingAll] = useState(false);
  const [buildName, setBuildName] = useState("Cấu hình của tôi");
  const [recentLocalBuilds, setRecentLocalBuilds] = useState([]);

  // Load all components
  useEffect(() => {
    getAllComponents().then((data) => {
      setAllComponents(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!Object.keys(allComponents).length) return;
    const selectedFromUrl = {};
    for (const cat of PC_CATEGORIES) {
      const compId = searchParams.get(cat.id);
      if (!compId) continue;
      const comp = (allComponents[cat.id] || []).find((item) => String(item.id) === String(compId));
      if (comp) selectedFromUrl[cat.id] = comp;
    }
    if (Object.keys(selectedFromUrl).length) {
      setSelected(selectedFromUrl);
    }
  }, [allComponents, searchParams]);

  useEffect(() => {
    const shareCode = searchParams.get("build");
    if (!shareCode || !Object.keys(allComponents).length) return;
    const loadSharedBuild = async () => {
      try {
        const payload = await getSharedPCBuild(shareCode);
        const data = payload?.result || payload?.DT || payload?.data || payload;
        const componentsMap = data?.components || {};
        const resolved = {};
        for (const [catId, compId] of Object.entries(componentsMap)) {
          const comp = (allComponents[catId] || []).find((item) => String(item.id) === String(compId));
          if (comp) resolved[catId] = comp;
        }
        if (Object.keys(resolved).length) {
          setSelected(resolved);
          if (data?.name) setBuildName(data.name);
        }
      } catch {
        notify.warning("Không tải được cấu hình chia sẻ từ hệ thống.");
      }
    };
    loadSharedBuild();
  }, [allComponents, searchParams]);

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(PC_BUILDER_RECENTS_KEY) || "[]");
      setRecentLocalBuilds(Array.isArray(raw) ? raw.slice(0, 5) : []);
    } catch {
      setRecentLocalBuilds([]);
    }
  }, []);

  useEffect(() => {
    if (!Object.keys(allComponents).length) return;
    const hasBuildCode = searchParams.get("build");
    const hasAnyUrlComponent = PC_CATEGORIES.some((cat) => Boolean(searchParams.get(cat.id)));
    if (hasBuildCode || hasAnyUrlComponent) return;
    try {
      const saved = JSON.parse(localStorage.getItem(PC_BUILDER_LOCAL_KEY) || "null");
      if (!saved?.components) return;
      const restored = {};
      for (const [catId, compId] of Object.entries(saved.components)) {
        const comp = (allComponents[catId] || []).find((item) => String(item.id) === String(compId));
        if (comp) restored[catId] = comp;
      }
      if (Object.keys(restored).length) {
        setSelected(restored);
        if (saved?.name) setBuildName(saved.name);
      }
    } catch {
      // skip invalid local save
    }
  }, [allComponents, searchParams]);

  useEffect(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      for (const cat of PC_CATEGORIES) {
        if (selected[cat.id]?.id) {
          next.set(cat.id, String(selected[cat.id].id));
        } else {
          next.delete(cat.id);
        }
      }
      return next;
    }, { replace: true });
  }, [selected, setSearchParams]);

  // Apply preset if presetId param
  useEffect(() => {
    if (!presetId || !Object.keys(allComponents).length) return;
    const preset = PRESET_BUILDS.find((p) => p.id === presetId);
    if (preset) {
      const resolved = resolvePreset(preset, allComponents);
      setSelected(resolved);
      setBuildName(preset.name);
    }
  }, [presetId, allComponents]);

  // Derived values
  const totalPrice = Object.values(selected).reduce(
    (sum, c) => sum + (c?.price || 0),
    0
  );
  const totalWatt = calcTotalWatt(
    Object.fromEntries(Object.entries(selected).map(([k, v]) => [k, v?.id])),
    allComponents
  );
  const warnings = checkCompatibility(
    Object.fromEntries(Object.entries(selected).map(([k, v]) => [k, v?.id])),
    allComponents
  );
  const missingRequired = PC_CATEGORIES.filter(
    (c) => c.required && !selected[c.id]
  );
  const completedCount = PC_CATEGORIES.filter((c) => selected[c.id]).length;
  const progress = Math.round((completedCount / PC_CATEGORIES.length) * 100);

  // Handlers
  const handleSelect = useCallback((catId, comp) => {
    setSelected((prev) => {
      if (!comp) {
        const next = { ...prev };
        delete next[catId];
        return next;
      }
      return { ...prev, [catId]: comp };
    });
  }, []);

  const handleAddAllToCart = async () => {
    if (missingRequired.length > 0) {
      notify.error(`Vui lòng chọn: ${missingRequired.map((c) => c.label).join(", ")}`);
      return;
    }
    setAddingAll(true);
    const userId = getCurrentUserId();
    let successCount = 0;
    for (const [catId, comp] of Object.entries(selected)) {
      if (!comp) continue;
      try {
        await dispatch(
          addToCart({
            userId,
            productId: comp.id,
            quantity: 1,
            productData: {
              id: comp.id,
              name: comp.name,
              unitPrice: comp.price,
              imageUrl: comp.image || "",
            },
          })
        ).unwrap();
        successCount++;
      } catch {
        // skip failed items
      }
    }
    setAddingAll(false);
    if (successCount > 0) {
      notify.success(`Đã thêm ${successCount} linh kiện vào giỏ hàng!`);
      navigate("/shopping_card");
    } else {
      notify.error("Lỗi khi thêm vào giỏ hàng");
    }
  };

  const handleSaveBuild = async () => {
    const buildData = {
      name: buildName,
      components: Object.fromEntries(
        Object.entries(selected).map(([k, v]) => [k, v?.id])
      ),
      totalPrice,
      savedAt: new Date().toISOString(),
    };
    try {
      const userId = getCurrentUserId();
      if (!userId) throw new Error("No user id");
      const res = await savePCBuild({
        userId,
        name: buildData.name,
        components: buildData.components,
        totalPrice: buildData.totalPrice,
      });
      const saved = res?.result || res?.DT || res?.data || res;
      const shareCode = saved?.shareCode;
      if (shareCode) {
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev);
          next.set("build", shareCode);
          return next;
        });
      }
      notify.success("Đã lưu cấu hình lên hệ thống.");
      return;
    } catch {
      localStorage.setItem(PC_BUILDER_LOCAL_KEY, JSON.stringify(buildData));
      const recentItem = {
        id: Date.now(),
        name: buildData.name || "Cấu hình chưa đặt tên",
        components: buildData.components,
        totalPrice: buildData.totalPrice,
        savedAt: buildData.savedAt,
      };
      const updated = [recentItem, ...recentLocalBuilds].slice(0, 5);
      setRecentLocalBuilds(updated);
      localStorage.setItem(PC_BUILDER_RECENTS_KEY, JSON.stringify(updated));
      notify.success("Đã lưu cấu hình cục bộ.");
    }
  };

  const handleShareBuild = async () => {
    let shareCode = searchParams.get("build");
    if (!shareCode) {
      try {
        const userId = getCurrentUserId();
        if (userId) {
          const res = await savePCBuild({
            userId,
            name: buildName,
            components: Object.fromEntries(
              Object.entries(selected).map(([k, v]) => [k, v?.id])
            ),
            totalPrice,
          });
          const saved = res?.result || res?.DT || res?.data || res;
          shareCode = saved?.shareCode;
        }
      } catch {
        // fallback query-share below
      }
    }
    const params = new URLSearchParams(
      Object.fromEntries(
        Object.entries(selected).map(([k, v]) => [k, v?.id || ""])
      )
    );
    if (shareCode) params.set("build", shareCode);
    const url = `${window.location.origin}/pc-builder?${params.toString()}`;
    try {
      await navigator.clipboard.writeText(url);
      notify.success("Đã copy link cấu hình!");
    } catch {
      window.prompt("Sao chép link cấu hình bên dưới:", url);
      notify.info("Clipboard bị chặn, đã mở hộp sao chép thủ công.");
    }
  };

  const handleLoadRecentBuild = (item) => {
    const restored = {};
    for (const [catId, compId] of Object.entries(item?.components || {})) {
      const comp = (allComponents[catId] || []).find((x) => String(x.id) === String(compId));
      if (comp) restored[catId] = comp;
    }
    if (Object.keys(restored).length) {
      setSelected(restored);
      if (item?.name) setBuildName(item.name);
      notify.success(`Đã tải cấu hình "${item.name || "đã lưu"}"`);
    } else {
      notify.warning("Không tìm thấy linh kiện khớp với cấu hình đã lưu.");
    }
  };

  const handleClearAll = () => {
    setSelected({});
    notify.success("Đã xóa toàn bộ linh kiện");
  };

  const applyPreset = (preset) => {
    const resolved = resolvePreset(preset, allComponents);
    setSelected(resolved);
    setBuildName(preset.name);
    notify.success(`Đã áp dụng cấu hình "${preset.name}"`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[var(--color-primary-)] border-t-[var(--color-primary-)] rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Đang tải linh kiện...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* ── Page header ── */}
      <div className="bg-gradient-to-r from-[var(--color-primary-)] to-[var(--color-primary-)] text-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2"/>
                <path d="M8 21h8M12 17v4"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">PC Builder</h1>
              <p className="text-[var(--color-primary-)] text-sm">Xây dựng cấu hình PC theo ý muốn</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-5">
            <div className="flex justify-between text-xs text-[var(--color-primary-)] mb-1.5">
              <span className="font-medium">Tiến độ cấu hình</span>
              <span className="font-semibold">{completedCount}/{PC_CATEGORIES.length} linh kiện đã chọn</span>
            </div>
            <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${progress}%` }}
              />
            </div>
            {completedCount === PC_CATEGORIES.length && (
              <p className="text-[11px] text-emerald-300 font-semibold mt-1.5 flex items-center gap-1">
                <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Cấu hình hoàn chỉnh!
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
        {/* ── Preset quick-select ── */}
        <section className="mb-6">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-[var(--color-primary-)]" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            Cấu hình gợi ý
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PRESET_BUILDS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className="relative text-left p-4 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 group border border-gray-100 bg-white hover:-translate-y-0.5"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${preset.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${preset.color} rounded-t-2xl`} />
                <div className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full text-white bg-gradient-to-r ${preset.color} mb-2 mt-1`}>
                  {preset.badge}
                </div>
                <p className="text-sm font-bold text-gray-900 mb-1">{preset.name}</p>
                <p className="text-[11px] text-gray-400 line-clamp-2 leading-tight mb-2">
                  {preset.description}
                </p>
                <p className={`text-sm font-bold bg-gradient-to-r ${preset.color} bg-clip-text text-transparent`}>
                  ~{formatCurrency(preset.totalPrice)}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* ── Main 2-col layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Component list */}
          <div className="lg:col-span-2">
            {/* Build name editor */}
            <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-5 mb-4">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                Tên cấu hình
              </label>
              <input
                type="text"
                value={buildName}
                onChange={(e) => setBuildName(e.target.value)}
                className="w-full text-base font-semibold text-gray-900 border-0 border-b-2 border-[var(--color-primary-)] focus:border-[var(--color-primary-)] outline-none pb-1 transition-colors bg-transparent"
                placeholder="Đặt tên cho cấu hình..."
              />
              {recentLocalBuilds.length > 0 && (
                <div className="mt-3">
                  <p className="text-[11px] text-gray-500 mb-2">Lưu gần đây (cục bộ)</p>
                  <div className="flex flex-wrap gap-2">
                    {recentLocalBuilds.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleLoadRecentBuild(item)}
                        className="px-2.5 py-1 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-[var(--color-primary-)] hover:text-[var(--color-primary-)] hover:border-[var(--color-primary-)] transition-colors"
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Component rows */}
            <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-5">
              {PC_CATEGORIES.map((cat) => (
                <ComponentRow
                  key={cat.id}
                  cat={cat}
                  selected={selected[cat.id] || null}
                  onOpen={() => setOpenModal(cat.id)}
                  onRemove={() => handleSelect(cat.id, null)}
                />
              ))}
            </div>
          </div>

          {/* Right: Summary panel */}
          <div className="lg:col-span-1 space-y-4">
            {/* Price summary */}
            <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-5 sticky top-24">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Tóm tắt cấu hình</h3>

              {/* Line items */}
              <div className="space-y-2 mb-4 max-h-64 overflow-y-auto pr-1">
                {PC_CATEGORIES.map((cat) => {
                  const comp = selected[cat.id];
                  if (!comp) return null;
                  return (
                    <div key={cat.id} className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 flex items-center gap-1.5">
                        <span className="text-[var(--color-primary-)] w-3.5 h-3.5 shrink-0">{getCatIcon(cat.iconKey)}</span>
                        {comp.name.slice(0, 22)}
                        {comp.name.length > 22 ? "..." : ""}
                      </span>
                      <span className="font-semibold text-gray-800 tabular-nums shrink-0 ml-2">
                        {formatCurrency(comp.price)}
                      </span>
                    </div>
                  );
                })}
                {Object.keys(selected).length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4 italic">
                    Chưa chọn linh kiện nào
                  </p>
                )}
              </div>

              {/* Total */}
              <div className="border-t border-gray-100 pt-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900">Tổng cộng</span>
                  <span className="text-lg font-bold text-[var(--color-primary-)] tabular-nums">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
              </div>

              {/* Wattage bar */}
              {totalWatt > 0 && (
                <div className="mb-4">
                  <WattBar watts={totalWatt} />
                </div>
              )}

              {/* Warnings */}
              {warnings.length > 0 && (
                <div className="mb-4 space-y-2">
                  {warnings.map((w, i) => (
                    <div key={i} className="bg-amber-50 border border-amber-200 rounded-xl p-2.5">
                      <p className="text-xs text-amber-700">{w}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Missing required */}
              {missingRequired.length > 0 && (
                <div className="mb-4 bg-red-50 border border-red-100 rounded-xl p-2.5">
                  <p className="text-xs text-red-600 font-medium mb-0.5">Còn thiếu:</p>
                  <p className="text-xs text-red-500">
                    {missingRequired.map((c) => c.label).join(" · ")}
                  </p>
                </div>
              )}

              {/* CTA buttons */}
              <div className="space-y-2">
                <button
                  onClick={handleAddAllToCart}
                  disabled={addingAll || totalPrice === 0}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--color-primary-)] text-white text-sm font-bold rounded-xl hover:bg-[var(--color-primary-)] disabled:opacity-50 transition-colors"
                >
                  {addingAll ? (
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                      <path d="M3 4H5L7.2 14.5a1 1 0 00.98.8h9.6a1 1 0 00.98-.8L20.3 8H6.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="9" cy="19" r="1.5" fill="currentColor" />
                      <circle cx="17" cy="19" r="1.5" fill="currentColor" />
                    </svg>
                  )}
                  Thêm tất cả vào giỏ
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleSaveBuild}
                    className="flex items-center justify-center gap-1.5 py-2.5 border border-[var(--color-primary-)] text-[var(--color-primary-)] text-xs font-semibold rounded-xl hover:bg-[var(--color-primary-)] transition-colors"
                  >
                    <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5">
                      <path d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Lưu cấu hình
                  </button>
                  <button
                    onClick={handleShareBuild}
                    className="flex items-center justify-center gap-1.5 py-2.5 border border-gray-200 text-gray-600 text-xs font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5">
                      <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Chia sẻ
                  </button>
                </div>

                {Object.keys(selected).length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="w-full py-2 text-xs text-gray-400 hover:text-red-500 font-medium transition-colors"
                  >
                    Xóa toàn bộ
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Component selection modal ── */}
      {openModal && (
        <PCBuilderModal
          category={PC_CATEGORIES.find((c) => c.id === openModal)}
          components={allComponents[openModal] || []}
          selectedId={selected[openModal]?.id}
          onSelect={(comp) => handleSelect(openModal, comp)}
          onClose={() => setOpenModal(null)}
        />
      )}
    </div>
  );
}
