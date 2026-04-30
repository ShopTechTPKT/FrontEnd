import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./components/layout/AdminSidebar";
import AdminHeader from "./components/layout/AdminHeader";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Sync with document theme
    const isDark = document.documentElement.classList.contains("dark");
    setDarkMode(isDark);
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          setDarkMode(document.documentElement.classList.contains("dark"));
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const mainBg = "bg-gray-50 dark:bg-gray-900";
  const textColor = "text-gray-900 dark:text-gray-100";

  return (
    <div className={`admin-layout flex h-screen w-full ${mainBg} ${textColor} relative overflow-hidden`}>
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <AdminSidebar 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen} 
        darkMode={darkMode} 
      />

      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Header */}
        <AdminHeader 
          setIsSidebarOpen={setIsSidebarOpen} 
          darkMode={darkMode} 
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
