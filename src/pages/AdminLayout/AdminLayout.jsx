import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./components/layout/AdminSidebar";
import AdminHeader from "./components/layout/AdminHeader";
import axiosInstance from "../../custom/axios";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [pendingOrders, setPendingOrders] = useState(0);

  useEffect(() => {
    let mounted = true;
    const fetchPendingOrders = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const { data } = await axiosInstance.get("/orders/count/status/PENDING");
        if (mounted) setPendingOrders(Number(data) || 0);
      } catch {
        if (mounted) setPendingOrders(0);
      }
    };
    fetchPendingOrders();
    const timer = setInterval(fetchPendingOrders, 60000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  const mainBg = "bg-[var(--color-bg-muted)]";
  const textColor = "text-[var(--color-text)]";

  return (
    <div className={`admin-layout flex h-screen w-full ${mainBg} ${textColor} relative overflow-hidden`}>
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden bg-black/45 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
          role="presentation"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <AdminSidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        pendingOrders={pendingOrders}
      />

      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Header */}
        <AdminHeader
          setIsSidebarOpen={setIsSidebarOpen}
          pendingOrders={pendingOrders}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
