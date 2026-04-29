import React from "react";
import { useNavigate } from "react-router-dom";

/* ── Inline SVG Illustrations ────────────────────────── */
const CartIllustration = () => (
  <svg viewBox="0 0 120 100" fill="none" className="w-full h-full">
    <circle cx="60" cy="50" r="45" fill="#f5f3ff" />
    <rect x="25" y="30" width="55" height="40" rx="6" fill="#ede9fe" stroke="#7c3aed" strokeWidth="1.5"/>
    <path d="M25 44h55" stroke="#7c3aed" strokeWidth="1.5" strokeDasharray="4 3"/>
    <circle cx="40" cy="78" r="5" fill="#7c3aed"/>
    <circle cx="68" cy="78" r="5" fill="#7c3aed"/>
    <path d="M15 22h8l6 24" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="55" cy="44" r="7" fill="#fff" stroke="#a78bfa" strokeWidth="1.5"/>
    <path d="M52 44l2 2 4-4" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const HeartIllustration = () => (
  <svg viewBox="0 0 120 100" fill="none" className="w-full h-full">
    <circle cx="60" cy="50" r="45" fill="#f5f3ff"/>
    <path d="M60 75 C60 75 28 56 28 38a18 18 0 0 1 32-11 18 18 0 0 1 32 11C92 56 60 75 60 75z" fill="#ede9fe" stroke="#7c3aed" strokeWidth="1.5"/>
    <circle cx="43" cy="33" r="3" fill="#a78bfa" opacity="0.5"/>
    <circle cx="77" cy="33" r="3" fill="#a78bfa" opacity="0.5"/>
  </svg>
);

const BoxIllustration = () => (
  <svg viewBox="0 0 120 100" fill="none" className="w-full h-full">
    <circle cx="60" cy="50" r="45" fill="#f5f3ff"/>
    <rect x="28" y="42" width="64" height="36" rx="4" fill="#ede9fe" stroke="#7c3aed" strokeWidth="1.5"/>
    <path d="M28 55h64" stroke="#7c3aed" strokeWidth="1.5"/>
    <path d="M45 30l-17 12h64l-17-12z" fill="#c4b5fd" stroke="#7c3aed" strokeWidth="1.5"/>
    <path d="M50 55v23M70 55v23" stroke="#7c3aed" strokeWidth="1.5" strokeDasharray="3 2"/>
    <path d="M50 30v12M70 30v12" stroke="#7c3aed" strokeWidth="1.5"/>
  </svg>
);

const SearchIllustration = () => (
  <svg viewBox="0 0 120 100" fill="none" className="w-full h-full">
    <circle cx="60" cy="50" r="45" fill="#f5f3ff"/>
    <circle cx="52" cy="46" r="20" fill="#ede9fe" stroke="#7c3aed" strokeWidth="1.5"/>
    <path d="M66 60l16 16" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="52" cy="46" r="10" fill="#fff" stroke="#a78bfa" strokeWidth="1"/>
    <path d="M46 46h12M52 40v12" stroke="#c4b5fd" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const StarIllustration = () => (
  <svg viewBox="0 0 120 100" fill="none" className="w-full h-full">
    <circle cx="60" cy="50" r="45" fill="#f5f3ff"/>
    <path d="M60 22l6.18 12.53L80 36.5l-10 9.75 2.36 13.75L60 53.5 47.64 60 50 46.25 40 36.5l13.82-1.97z" fill="#ede9fe" stroke="#7c3aed" strokeWidth="1.5" strokeLinejoin="round"/>
    <circle cx="40" cy="65" r="4" fill="#c4b5fd" opacity="0.6"/>
    <circle cx="80" cy="65" r="4" fill="#c4b5fd" opacity="0.6"/>
    <circle cx="60" cy="78" r="3" fill="#a78bfa" opacity="0.5"/>
  </svg>
);

const ILLUSTRATIONS = {
  cart:   CartIllustration,
  heart:  HeartIllustration,
  box:    BoxIllustration,
  search: SearchIllustration,
  star:   StarIllustration,
};

/**
 * EmptyState — Reusable empty placeholder
 * Props: type, title, description, ctaLabel, ctaPath, ctaAction, size
 */
const EmptyState = ({
  icon,
  type = "box",
  title = "Không có dữ liệu",
  description = "",
  ctaLabel,
  ctaPath,
  ctaAction,
  size = "md",
  className = "",
}) => {
  const navigate = useNavigate();
  const IllustrationComp = ILLUSTRATIONS[type] || BoxIllustration;

  const sizeMap = {
    sm: { wrap: "py-8",  img: "w-24 h-24", title: "text-base", desc: "text-xs" },
    md: { wrap: "py-12", img: "w-32 h-32", title: "text-lg",   desc: "text-sm" },
    lg: { wrap: "py-16", img: "w-40 h-40", title: "text-xl",   desc: "text-sm" },
  };
  const s = sizeMap[size] || sizeMap.md;

  const handleCta = () => {
    if (ctaAction) { ctaAction(); return; }
    if (ctaPath)   { navigate(ctaPath); }
  };

  return (
    <div className={`flex flex-col items-center justify-center text-center ${s.wrap} px-4 select-none ${className}`}>
      <div className={`${s.img} mb-4 flex items-center justify-center`}>
        {icon || <IllustrationComp />}
      </div>
      <h3 className={`font-semibold text-gray-800 ${s.title} mb-1`}>{title}</h3>
      {description && (
        <p className={`text-gray-400 ${s.desc} max-w-xs`}>{description}</p>
      )}
      {(ctaLabel && (ctaPath || ctaAction)) && (
        <button
          onClick={handleCta}
          className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
                     bg-violet-700 text-white text-sm font-semibold
                     hover:bg-violet-800 active:scale-95 transition-all duration-200"
        >
          {ctaLabel}
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      )}
    </div>
  );
};

export default EmptyState;
