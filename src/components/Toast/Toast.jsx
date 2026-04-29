import { useState, useEffect } from "react";

const ICON_COLORS = {
  success: "text-green-500",
  error: "text-red-500",
  warning: "text-amber-500",
  info: "text-blue-500",
};

const PROGRESS_COLORS = {
  success: "bg-green-500",
  error: "bg-red-500",
  warning: "bg-amber-500",
  info: "bg-blue-500",
};

// message supports string or JSX (ReactNode)
const Toast = ({ id, type = "info", message, duration = 3000, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  const toastConfig = {
    success: { bg: "bg-white", text: "text-gray-900", accent: "border-green-500" },
    error: { bg: "bg-white", text: "text-gray-900", accent: "border-red-500" },
    warning: { bg: "bg-white", text: "text-gray-900", accent: "border-amber-500" },
    info: { bg: "bg-white", text: "text-gray-900", accent: "border-blue-500" },
  };

  const config = toastConfig[type] || toastConfig.info;

  // Minimal motion: fade only for calmer UX
  const animationClasses = isExiting ? "opacity-0" : "opacity-100";

  return (
    <div className={`transition-opacity duration-150 ease-out ${animationClasses}`}>
      <div className={`${config.bg} min-w-[240px] max-w-sm rounded-md border ${config.accent} border-opacity-20 shadow-sm overflow-hidden`}>
        <div className="flex items-center gap-2 px-3 py-2">
          <span className={`${ICON_COLORS[type]} shrink-0`}>
            {type === "success" && (
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            )}
            {type === "error" && (
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            )}
            {type === "warning" && (
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v4M12 17h.01" />
                <path d="M10.29 3.86L1.82 18A2 2 0 003.53 21h16.94a2 2 0 001.71-3l-8.47-14.14a2 2 0 00-3.42 0z" />
              </svg>
            )}
            {type === "info" && (
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 10v6M12 7h.01" />
              </svg>
            )}
          </span>
          <div className={`flex-1 ${config.text} text-sm leading-snug`}>
            {message}
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-100"
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Progress bar: shrinks from 100% to 0% over duration */}
        <div className="h-0.5 w-full bg-gray-100">
          <div
            className={`h-full ${PROGRESS_COLORS[type]} opacity-60`}
            style={{
              animation: `toast-progress ${duration}ms linear forwards`,
            }}
          />
        </div>
      </div>
      <style>{`
        @keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default Toast;

