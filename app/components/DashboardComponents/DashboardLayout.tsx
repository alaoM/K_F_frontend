"use client";

import { useState } from "react";
import AdminSidebarLayout from "../AdminComponents/AdminSidebarLayout";
import AdminHeader from "../AdminComponents/AdminHeader";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="bg-[#f8f9fa] min-h-screen text-[#111111]">
      <AdminSidebarLayout
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className={`transition-all duration-300 flex flex-col min-h-screen ${collapsed ? "lg:pl-20" : "lg:pl-64"}`}>
        <AdminHeader
          onToggleMobileSidebar={() => setMobileOpen(prev => !prev)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>

        <footer className="px-6 py-4 sm:px-8 sm:py-5 border-t-2 border-gray-200 bg-white text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
          © {new Date().getFullYear()} F&K Stores. All rights reserved.
        </footer>
      </div>
    </div>
  );
}