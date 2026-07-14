// AdminLayoutClient.tsx
"use client";

import { useState } from "react";
import AdminSidebarLayout from "../AdminComponents/AdminSidebarLayout";
import AdminHeader from "../AdminComponents/AdminHeader";
 
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <AdminSidebarLayout collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className={`transition-all duration-300 flex flex-col min-h-screen ${collapsed ? "lg:pl-20" : "lg:pl-64"}`}>
        <AdminHeader />

        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>

        <footer className="px-8 py-6 border-t text-center text-xs text-gray-400">
          © 2026 Fashion Pro Admin Dashboard
        </footer>
      </div>
    </>
  );
}