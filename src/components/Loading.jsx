import React from "react";

/**
 * Loading Component - Hiển thị loading indicator đơn giản và đẹp
 * @param {Object} props
 * @param {string} props.size - Kích thước: 'sm', 'md', 'lg' (default: 'md')
 * @param {string} props.text - Text hiển thị (default: 'Đang tải...')
 * @param {boolean} props.fullScreen - Hiển thị full screen (default: false)
 * @param {string} props.className - Custom className
 */
const Loading = ({
  size = "md",
  text = "Đang tải...",
  fullScreen = false,
  className = "",
}) => {
  const sizeClasses = {
    sm: "h-24",
    md: "h-32",
    lg: "h-40",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const loadingContent = (
    <div className={`w-full max-w-4xl ${className}`}>
      <div className={`relative overflow-hidden rounded-2xl border border-violet-100 dark:border-[var(--color-border)] bg-white dark:bg-[var(--color-bg-subtle)] p-5 ${sizeClasses[size]}`}>
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-violet-100/60 dark:via-violet-900/30 to-transparent" />
        <div className="relative z-10 space-y-3">
          <div className="h-4 w-40 rounded bg-violet-100 dark:bg-violet-900/40" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="space-y-2 rounded-xl border border-gray-100 dark:border-[var(--color-border)] bg-gray-50 dark:bg-[var(--color-bg-muted)] p-3">
                <div className="h-14 rounded-lg bg-gray-200 dark:bg-gray-800" />
                <div className="h-3 w-5/6 rounded bg-gray-200 dark:bg-gray-800" />
                <div className="h-3 w-3/5 rounded bg-gray-200 dark:bg-gray-800" />
              </div>
            ))}
          </div>
        </div>
      </div>
      {text && (
        <p className={`${textSizeClasses[size]} mt-3 text-center text-gray-600 dark:text-gray-400 font-medium`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/85 dark:bg-gray-950/85 backdrop-blur-sm p-4">
        {loadingContent}
      </div>
    );
  }

  return loadingContent;
};

export default Loading;

