"use client";

import React from "react";
import AdminSidebar from "./AdminSidebar";

interface SidebarLayoutProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

const AdminSidebarLayout: React.FC<SidebarLayoutProps> = ({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) => {
  return (
    <AdminSidebar
      collapsed={collapsed}
      setCollapsed={setCollapsed}
      mobileOpen={mobileOpen}
      setMobileOpen={setMobileOpen}
    />
  );
};

export default AdminSidebarLayout;