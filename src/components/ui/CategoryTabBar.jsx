import React, { useRef, useEffect } from "react";

/* ── SVG Category Icons ──────────────────────────────── */
const LaptopIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2"/>
    <path d="M1 21h22"/>
  </svg>
);

const CpuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2"/>
    <rect x="9" y="9" width="6" height="6"/>
    <path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2"/>
  </svg>
);

const MonitorIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2"/>
    <path d="M8 21h8M12 17v4"/>
  </svg>
);

const KeyboardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="20" height="12" rx="2"/>
    <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8M6 14h.01M18 14h.01"/>
  </svg>
);

const MouseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 9a7 7 0 0 1 14 0v6a7 7 0 0 1-14 0V9z"/>
    <path d="M12 3v6"/>
  </svg>
);

const HeadsetIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
  </svg>
);

const PrinterIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9V2h12v7"/>
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
    <rect x="6" y="14" width="12" height="8"/>
  </svg>
);

const NetworkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="6" height="6" rx="1"/>
    <rect x="16" y="2" width="6" height="6" rx="1"/>
    <rect x="9" y="16" width="6" height="6" rx="1"/>
    <path d="M5 8v3h14V8M12 11v5"/>
  </svg>
);

const AllIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="9" height="9" rx="1"/>
    <rect x="13" y="2" width="9" height="9" rx="1"/>
    <rect x="2" y="13" width="9" height="9" rx="1"/>
    <rect x="13" y="13" width="9" height="9" rx="1"/>
  </svg>
);

/* ── Config ──────────────────────────────────────────── */
export const CATEGORIES = [
  { id: "all",               label: "Tất Cả",       Icon: AllIcon,      path: "/all_products" },
  { id: "laptop",            label: "Laptop",        Icon: LaptopIcon,   path: "/laptops" },
  { id: "desktop",           label: "PC Để Bàn",     Icon: MonitorIcon,  path: "/desktops" },
  { id: "pc_parts",          label: "Linh Kiện PC",  Icon: CpuIcon,      path: "/pc_parts" },
  { id: "keyboard_mouse",    label: "Bàn Phím/Chuột", Icon: KeyboardIcon, path: "/all_products?category=keyboard" },
  { id: "mouse",             label: "Chuột",         Icon: MouseIcon,    path: "/all_products?category=mouse" },
  { id: "headset",           label: "Tai Nghe",      Icon: HeadsetIcon,  path: "/all_products?category=headset" },
  { id: "printer_scanner",   label: "Máy In",        Icon: PrinterIcon,  path: "/printer_scanner" },
  { id: "networking",        label: "Mạng",          Icon: NetworkIcon,  path: "/networking_devices" },
];

/* ── Component ───────────────────────────────────────── */
/**
 * CategoryTabBar
 * Props:
 *  - activeId: string  — id of active tab
 *  - onSelect: (id, path) => void
 *  - counts: Record<id, number> — optional product counts
 *  - sticky: boolean — whether to make the bar sticky on scroll
 */
const CategoryTabBar = ({
  activeId = "all",
  onSelect,
  counts = {},
  sticky = false,
}) => {
  const scrollRef = useRef(null);

  // Auto-scroll active tab into view
  useEffect(() => {
    const active = scrollRef.current?.querySelector(`[data-id="${activeId}"]`);
    active?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [activeId]);

  return (
    <div className={`bg-white border-b border-gray-100 ${sticky ? "sticky top-16 z-30" : ""}`}>
      <div
        ref={scrollRef}
        className="flex gap-1.5 overflow-x-auto px-4 sm:px-6 py-2.5
                   [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {CATEGORIES.map(({ id, label, Icon }) => {
          const isActive = id === activeId;
          const count = counts[id];
          return (
            <button
              key={id}
              data-id={id}
              onClick={() => onSelect?.(id, CATEGORIES.find(c => c.id === id)?.path)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium
                          whitespace-nowrap shrink-0 transition-all duration-200
                          ${isActive
                            ? "bg-violet-700 text-white shadow-sm"
                            : "bg-gray-50 text-gray-600 hover:bg-violet-50 hover:text-violet-700 border border-gray-200 hover:border-violet-200"
                          }`}
            >
              <Icon />
              <span>{label}</span>
              {count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold leading-none
                                  ${isActive ? "bg-white/20 text-white" : "bg-gray-200 text-gray-500"}`}>
                  {count > 999 ? "999+" : count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryTabBar;
