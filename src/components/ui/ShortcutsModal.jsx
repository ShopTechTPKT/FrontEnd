import { useEffect, useState } from "react";

/**
 * ShortcutsModal — Keyboard shortcuts help modal triggered by Shift+?.
 * Shows all available keyboard shortcuts in a clean grid layout.
 */

const SHORTCUTS = [
  { keys: ["Ctrl", "K"], desc: "Tim kiem nhanh" },
  { keys: ["Shift", "?"], desc: "Xem phim tat" },
  { keys: ["Esc"], desc: "Dong modal / menu" },
  { keys: ["T"], desc: "Cuon len dau trang" },
  { keys: ["Arrow Up/Down"], desc: "Di chuyen ket qua" },
  { keys: ["Enter"], desc: "Chon ket qua" },
];

export default function ShortcutsModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "?" && e.shiftKey) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-[fadeSlideIn_200ms_ease-out]">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">Phim tat</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-4 space-y-3">
          {SHORTCUTS.map(({ keys, desc }, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{desc}</span>
              <div className="flex gap-1">
                {keys.map((key) => (
                  <kbd
                    key={key}
                    className="px-2 py-0.5 text-xs font-mono bg-gray-100 border border-gray-200 rounded text-gray-700"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-3 bg-gray-50 text-center">
          <span className="text-xs text-gray-400">
            An <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white border rounded">Esc</kbd> de dong
          </span>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
