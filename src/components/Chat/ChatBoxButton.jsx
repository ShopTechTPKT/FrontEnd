import React from "react";

export default function ChatBoxButton({ icon, onClick, unreadCount, theme }) {
  const labelDotClass = "bg-violet-500";

  return (
    <div className="group relative">
      <div className={`absolute -inset-2 rounded-full ${theme.animateColor} animate-ping opacity-10`} />
      <div className={`absolute -inset-1 rounded-full ${theme.animateColor} animate-pulse opacity-15 delay-200`} />

      {unreadCount > 0 && (
        <div className="absolute -right-2 -top-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white animate-bounce">
          {unreadCount > 9 ? "9+" : unreadCount}
        </div>
      )}

      <div className="pointer-events-none absolute right-full top-1/2 z-30 mr-3 translate-x-2 -translate-y-1/2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
        <div className="relative whitespace-nowrap rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-lg">
          <span className="flex items-center gap-2">
            <span className={`inline-flex h-2 w-2 rounded-full ${labelDotClass}`} />
            <span>Chat Box AI</span>
          </span>
          <div className="absolute left-full top-1/2 h-0 w-0 -translate-y-1/2 border-b-[7px] border-l-[9px] border-t-[7px] border-b-transparent border-l-white border-t-transparent" />
          <div className="absolute left-full top-1/2 -z-10 h-0 w-0 -translate-y-1/2 translate-x-[1px] border-b-[8px] border-l-[10px] border-t-[8px] border-b-transparent border-l-gray-200 border-t-transparent" />
        </div>
      </div>

      <button
        onClick={onClick}
        className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-full border border-white/20 ${theme.buttonBg} ${theme.textPrimary} ${theme.accentGlow} backdrop-blur-sm transition-all duration-200 ease-out hover:scale-105 focus:outline-none`}
      >
        <div className={`${theme.buttonBg} absolute inset-0 -z-10 rounded-full`} />
        <div className="transform transition-transform duration-200 group-hover:scale-110">{icon}</div>
      </button>
    </div>
  );
}
