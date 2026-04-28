import { useState, useEffect } from 'react';
import { FaTimes, FaCheckCircle, FaTimesCircle, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

// Icon mapping per toast type
const TOAST_ICONS = {
  success: FaCheckCircle,
  error: FaTimesCircle,
  warning: FaExclamationTriangle,
  info: FaInfoCircle,
};

const ICON_COLORS = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-amber-500',
  info: 'text-blue-500',
};

const PROGRESS_COLORS = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  warning: 'bg-amber-500',
  info: 'bg-blue-500',
};

// message supports string or JSX (ReactNode)
const Toast = ({ id, type = 'info', message, duration = 2500, onClose, position = 'top-right' }) => {
  const { t } = useTranslation();

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
    success: { bg: 'bg-white', text: 'text-gray-900', accent: 'border-green-500' },
    error: { bg: 'bg-white', text: 'text-gray-900', accent: 'border-red-500' },
    warning: { bg: 'bg-white', text: 'text-gray-900', accent: 'border-amber-500' },
    info: { bg: 'bg-white', text: 'text-gray-900', accent: 'border-blue-500' },
  };

  const config = toastConfig[type] || toastConfig.info;
  const IconComponent = TOAST_ICONS[type] || FaInfoCircle;

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2'
  };

  // Minimal motion: fade only for calmer UX
  const animationClasses = isExiting ? 'opacity-0' : 'opacity-100';

  return (
    <div
      className={`fixed ${positionClasses[position]} z-[9999] transition-opacity duration-150 ease-out ${animationClasses}`}
    >
      <div className={`${config.bg} min-w-[240px] max-w-sm rounded-md border ${config.accent} border-opacity-20 shadow-sm overflow-hidden`}>
        <div className="flex items-center gap-2 px-3 py-2">
          <IconComponent className={`${ICON_COLORS[type]} text-base shrink-0`} />
          <div className={`flex-1 ${config.text} text-sm leading-snug`}>
            {message}
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-100"
            aria-label="Close"
          >
            <FaTimes className="text-[10px]" />
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

