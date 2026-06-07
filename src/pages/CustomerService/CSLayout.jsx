import React, { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { id: "chat", label: "Chat Support", path: "/cs", icon: "💬" },
  { id: "dashboard", label: "Dashboard", path: "/cs/dashboard", icon: "📊" },
  { id: "appointments", label: "Lịch hẹn", path: "/cs/appointments", icon: "📅" },
];

const CSLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="cs-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-[1029] lg:hidden bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`cs-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="p-5 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-primary-)] to-indigo-700 text-white flex items-center justify-center font-bold text-sm shadow-md">CS</div>
            <div>
              <h2 className="font-bold text-sm text-[var(--color-text)]">Customer Service</h2>
              <p className="text-[10px] text-[var(--color-text-muted)]">Support Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path || (item.path === "/cs" && location.pathname === "/cs");
            return (
              <button
                key={item.id}
                onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                className={`profile-nav-item ${isActive ? "active" : ""}`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main */}
      <div className="cs-main">
        {/* Header */}
        <header className="cs-header">
          <button className="lg:hidden p-2 rounded-lg hover:bg-[var(--color-bg-muted)]" onClick={() => setSidebarOpen(true)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div className="flex items-center gap-2 ml-auto">
            <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-success)]">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Online
            </span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CSLayout;
