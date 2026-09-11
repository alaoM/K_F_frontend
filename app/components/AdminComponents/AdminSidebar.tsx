"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  ChevronRight,
  Package,
  ClipboardList,
  X,
  Shield,
  Layers,
  Sparkles,
  FileText,
  BadgeCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

type MenuItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
};

type MenuSection = {
  section?: string;
  items: MenuItem[];
};

const adminMenuSections: MenuSection[] = [
  {
    section: "Overview",
    items: [
      { href: "/dashboard/admin", label: "Dashboard", icon: <LayoutDashboard size={17} /> },
    ],
  },
  {
    section: "Commerce & Inventory",
    items: [
      { href: "/dashboard/admin/products", label: "Products", icon: <ShoppingBag size={17} /> },
      { href: "/dashboard/admin/orders", label: "Orders", icon: <ClipboardList size={17} /> },
      { href: "/dashboard/admin/categories", label: "Categories", icon: <Package size={17} /> },
    ],
  },
  {
    section: "Users & Governance",
    items: [
      { href: "/dashboard/admin/customers", label: "Customers", icon: <Users size={17} /> },
      { href: "/dashboard/admin/verify-sellers", label: "Verify Sellers", icon: <BadgeCheck size={17} /> },
      { href: "/dashboard/admin/disputes", label: "Disputes Center", icon: <Shield size={17} /> },
    ],
  },
  {
    section: "Content & Platform",
    items: [
      { href: "/dashboard/admin/blog", label: "Blog Management", icon: <FileText size={17} /> },
      { href: "/dashboard/admin/settings", label: "Settings", icon: <Settings size={17} /> },
    ],
  },
];

const sellerMenuSections: MenuSection[] = [
  {
    section: "Overview",
    items: [
      { href: "/dashboard/seller", label: "Dashboard", icon: <LayoutDashboard size={17} /> },
    ],
  },
  {
    section: "Store Management",
    items: [
      { href: "/dashboard/seller/products", label: "My Products", icon: <ShoppingBag size={17} /> },
      { href: "/dashboard/seller/orders", label: "Orders", icon: <ClipboardList size={17} /> },
    ],
  },
  {
    section: "Store Settings",
    items: [
      { href: "/dashboard/seller/settings", label: "Settings", icon: <Settings size={17} /> },
    ],
  },
];

const buyerMenuSections: MenuSection[] = [
  {
    section: "Overview",
    items: [
      { href: "/dashboard/buyer", label: "Dashboard", icon: <LayoutDashboard size={17} /> },
      { href: "/dashboard/buyer/orders", label: "My Orders", icon: <ClipboardList size={17} /> },
      { href: "/dashboard/buyer/settings", label: "Settings", icon: <Settings size={17} /> },
    ],
  },
];

const AdminSidebar: React.FC<SidebarProps> = ({
  collapsed,
  setCollapsed,
  mobileOpen = false,
  setMobileOpen,
}) => {
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen?.(false);
  }, [pathname, setMobileOpen]);

  const role = user?.role;
  const sections: MenuSection[] = 
    role === 'admin' ? adminMenuSections :
    role === 'seller' ? sellerMenuSections :
    buyerMenuSections;

  if (!mounted) return null;

  return (
    <>
      {/* Backdrop Overlay on Mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setMobileOpen?.(false)}
        />
      )}

      {/* Modern Sleek Sidebar */}
      <aside
        className={`
        fixed top-0 left-0 h-screen bg-[#0d0d0d] text-white flex flex-col
        border-r border-white/10 transition-all duration-300 ease-in-out z-50 select-none
        ${collapsed ? "w-20" : "w-64"}
        ${mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
        lg:translate-x-0
      `}
      >
        {/* Header Branding */}
        <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between min-h-[72px] relative bg-black/40">
          {!collapsed ? (
            <Link href="/" className="transition-transform hover:opacity-90 flex items-center gap-2">
              <Image src="/logo.png" alt="logo" width={130} height={36} className="object-contain" priority />
            </Link>
          ) : (
            <Link href="/" className="w-10 h-10 bg-[#f6c947] rounded-none flex items-center justify-center text-[#111111] font-black text-xl mx-auto shadow-md hover:scale-105 transition-transform">
              F
            </Link>
          )}

          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileOpen?.(false)}
            className="lg:hidden p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-none transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>

          {/* Desktop Collapse Toggle Button */}
          <div className="absolute -right-3 hidden lg:block">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex text-[#111111] hover:text-[#f6c947] hover:bg-[#111111] border border-white/20 rounded-none w-6 h-6 bg-[#f6c947] transition-all items-center justify-center cursor-pointer shadow-md"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ChevronRight
                size={14}
                className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* User Role Banner */}
        {!collapsed && user && (
          <div className="px-5 py-3 border-b border-white/[0.06] bg-white/[0.02] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Portal Active
              </span>
            </div>
            <span className="bg-[#f6c947] text-[#111111] text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-none shadow-xs">
              {user.role}
            </span>
          </div>
        )}

        {/* Menu Navigation with Grouped Sections */}
        <nav className="flex-1 py-3 overflow-y-auto space-y-4 px-2.5">
          {sections.map((sec, secIdx) => (
            <div key={secIdx} className="space-y-1">
              {!collapsed && sec.section && (
                <div className="px-3 pt-2 pb-1 text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">
                  {sec.section}
                </div>
              )}

              <ul className="space-y-0.5">
                {sec.items.map((item) => {
                  const active = 
                    pathname === item.href || 
                    (item.href !== "/dashboard/admin" && 
                     item.href !== "/dashboard/seller" && 
                     item.href !== "/dashboard/buyer" && 
                     pathname.startsWith(item.href));

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen?.(false)}
                        title={collapsed ? item.label : undefined}
                        className={`
                          w-full flex items-center justify-between px-3 py-2.5 transition-all text-xs font-black uppercase tracking-wider rounded-none group border-l-[3px]
                          ${active
                            ? "bg-white/[0.08] text-[#f6c947] border-[#f6c947] shadow-xs"
                            : "border-transparent text-gray-400 hover:text-white hover:bg-white/[0.04]"
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`transition-colors shrink-0 ${active ? "text-[#f6c947]" : "text-gray-400 group-hover:text-white"}`}>
                            {item.icon}
                          </span>
                          {!collapsed && <span className="truncate">{item.label}</span>}
                        </div>

                        {!collapsed && active && (
                          <div className="w-1.5 h-1.5 rounded-none bg-[#f6c947]" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Logout CTA */}
        <div className="p-3 border-t border-white/[0.08] bg-black/40">
          <button
            onClick={() => logout()}
            className="flex items-center gap-3 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 px-3 py-2.5 w-full text-xs font-black uppercase tracking-wider transition-all rounded-none cursor-pointer border border-transparent hover:border-rose-500/20"
          >
            <LogOut size={16} className="shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;