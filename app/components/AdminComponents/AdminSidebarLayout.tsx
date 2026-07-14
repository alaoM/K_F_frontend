"use client"

import React, { useState } from "react"
import AdminSidebar from "./AdminSidebar"

interface SidebarLayoutProps {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
}

const AdminSidebarLayout: React.FC<SidebarLayoutProps> = ({
  collapsed,
  setCollapsed,
}) => {
  return (
    <AdminSidebar
      collapsed={collapsed}
      setCollapsed={setCollapsed}
    />
  )
}

export default AdminSidebarLayout