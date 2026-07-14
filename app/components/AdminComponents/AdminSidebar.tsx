"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  ChevronRight,
  Package,
  ClipboardList,
  Menu,
  X,
  Shield,
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import Image from "next/image"

interface SidebarProps {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
}

const roleMenus = {
  admin: [
    { href: "/dashboard/admin", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { href: "/dashboard/admin/products", label: "Products", icon: <ShoppingBag size={20} /> },
    { href: "/dashboard/admin/orders", label: "Orders", icon: <ClipboardList size={20} /> },
    { href: "/dashboard/admin/customers", label: "Customers", icon: <Users size={20} /> },
    { href: "/dashboard/admin/verify-sellers", label: "Verify Sellers", icon: <Shield size={20} /> },
    { href: "/dashboard/admin/disputes", label: "Disputes Center", icon: <Shield size={20} /> },
    { href: "/dashboard/admin/blog", label: "Blog Management", icon: <ClipboardList size={20} /> },
    { href: "/dashboard/admin/categories", label: "Categories", icon: <Package size={20} /> },
    { href: "/dashboard/admin/settings", label: "Settings", icon: <Settings size={20} /> },
  ],
  seller: [
    { href: "/dashboard/seller", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { href: "/dashboard/seller/products", label: "My Products", icon: <ShoppingBag size={20} /> },
    { href: "/dashboard/seller/orders", label: "Orders", icon: <ClipboardList size={20} /> },
    { href: "/dashboard/seller/settings", label: "Settings", icon: <Settings size={20} /> },
  ],
  buyer: [
    { href: "/dashboard/buyer", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { href: "/dashboard/buyer/orders", label: "My Orders", icon: <ClipboardList size={20} /> },
    { href: "/dashboard/buyer/settings", label: "Settings", icon: <Settings size={20} /> },
  ],
}

const AdminSidebar: React.FC<SidebarProps> = ({
  collapsed,
  setCollapsed,
}) => {
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  const role = user?.role
  const menuItems = role ? roleMenus[role] : []

  useEffect(() => {
    if (!mounted || !user) return

    const allowedRoutes = roleMenus[user.role] || []
    const isAllowed = allowedRoutes.some((item) =>
      pathname.startsWith(item.href)
    )

    if (!isAllowed && pathname !== '/dashboard') {
      // logout() // Be careful with auto-logout on hydration
    }
  }, [pathname, user, logout, mounted])

  if (!mounted) return null

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-[#243e6b] p-2 rounded text-white"
      >
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      <div
        className={`
        fixed top-0 left-0 h-screen bg-[#243e6b] text-white flex flex-col
        transition-all duration-300 z-40
        ${collapsed ? "w-20" : "w-64"}
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-center min-h-[80px]">
          {!collapsed ? (
            <Link href="/" className="transition-transform hover:scale-105">
              <Image src="/logo.png" alt="logo" width={140} height={40} className="object-contain" priority />
            </Link>
          ) : (
            <div className="w-8 h-8 bg-[#f6c947] rounded-lg flex items-center justify-center text-[#243e6b] font-black">
              F
            </div>
          )}

          {/* Collapse Button */}
          <div className="absolute -right-3 hidden lg:block">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex text-[#243e6b] hover:text-white rounded-full w-6 h-6 bg-[#f6c947] transition-colors items-center justify-center  cursor-pointer shadow-lg"
            >
              <ChevronRight
                size={18}
                className={`transition-transform ${collapsed ? "rotate-180" : ""
                  }`}
              />
            </button>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 py-6">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const active = pathname.startsWith(item.href)

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`
                      w-full flex items-center justify-between px-6 py-3 transition-colors
                      ${active
                        ? "bg-white text-[#243e6b] font-bold"
                        : "hover:bg-white/5 text-white/70 hover:text-white"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      {!collapsed && <span>{item.label}</span>}
                    </div>

                    {!collapsed && active && (
                      <ChevronRight size={16} />
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-6 border-t border-white/10">
          <button className="flex items-center gap-3 text-white/70 hover:text-white transition-colors w-full cursor-pointer" onClick={() => logout()}>
            <LogOut size={20} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </>
  )
}

export default AdminSidebar