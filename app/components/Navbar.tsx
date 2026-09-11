'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import {
  Search,
  User as UserIcon,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  LogOut,
  Package,
  Sparkles,
  Store,
  Tag,
  ArrowRight,
  Flame,
  BadgePercent,
  ShieldCheck,
  FolderTree,
  ExternalLink,
  Layers,
  CheckCircle2,
  Trash2,
  Clock,
  SlidersHorizontal,
  ChevronUp,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuth } from '@/context/AuthContext';
import NotificationBell from './AdminComponents/NotificationBell';
import CartDrawer from './marketplace/CartDrawer';

export interface CategoryItem {
  id: string;
  name: string;
  slug?: string;
  image?: string;
  icon?: string;
  parentId?: string;
  parent?: { id: string };
  children?: CategoryItem[];
}

interface ProductSearchResult {
  id: string;
  title: string;
  price: number;
  primaryImage?: string;
  category?: { name: string };
  seller?: { businessName: string };
}

/* -------------------------------------------------------------------------- */
/* HELPER: Count all deep nested children recursively                         */
/* -------------------------------------------------------------------------- */
function countTotalDescendants(cat: CategoryItem): number {
  if (!cat.children || cat.children.length === 0) return 0;
  return cat.children.reduce((acc, child) => acc + 1 + countTotalDescendants(child), 0);
}

/* -------------------------------------------------------------------------- */
/* RECURSIVE MOBILE ACCORDION CATEGORY NODE (Supports Generations 1 to 5)    */
/* -------------------------------------------------------------------------- */
const RecursiveMobileCategory: React.FC<{
  category: CategoryItem;
  depth: number;
  onClose: () => void;
}> = ({ category, depth, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = category.children && category.children.length > 0;
  const totalSubCount = countTotalDescendants(category);

  const depthStyles: Record<number, string> = {
    1: 'font-black text-xs text-[#111111]',
    2: 'font-bold text-xs text-gray-800',
    3: 'font-semibold text-[11px] text-gray-700',
    4: 'font-medium text-[11px] text-gray-600',
    5: 'font-normal text-[10px] text-gray-500',
  };

  const depthBadges: Record<number, string> = {
    1: 'bg-[#f6c947] text-[#111111]',
    2: 'bg-[#111111] text-white',
    3: 'bg-blue-600 text-white',
    4: 'bg-emerald-600 text-white',
    5: 'bg-purple-600 text-white',
  };

  return (
    <div className={`w-full ${depth > 1 ? 'ml-3 pl-2.5 border-l-2 border-dashed border-gray-200 mt-1.5' : ''}`}>
      <div className="flex items-center justify-between py-1.5 group">
        <Link
          href={`/collections?category=${encodeURIComponent(category.name)}`}
          className={`${depthStyles[depth] || 'text-xs text-gray-700'} uppercase tracking-wider hover:text-[#f6c947] flex items-center gap-2 flex-1 transition-colors`}
          onClick={onClose}
        >
          {category.icon ? (
            <span className="text-sm shrink-0">{category.icon}</span>
          ) : (
            <span className="w-1.5 h-1.5 bg-[#f6c947] rounded-none shrink-0" />
          )}
          <span className="line-clamp-1">{category.name}</span>

          {/* Depth Badge */}
          {depth > 1 && (
            <span className={`text-[8px] font-black px-1.5 py-0.2 rounded-none uppercase ${depthBadges[depth] || 'bg-gray-200 text-gray-700'}`}>
              G{depth}
            </span>
          )}

          {/* Child count */}
          {totalSubCount > 0 && (
            <span className="text-[9px] font-bold text-gray-400">
              ({totalSubCount})
            </span>
          )}
        </Link>

        {hasChildren && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 text-gray-400 hover:text-[#111111] hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Toggle subcategories"
          >
            <ChevronDown size={14} className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {hasChildren && isOpen && (
        <div className="space-y-1 pb-1 pt-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
          {category.children!.map((child) => (
            <RecursiveMobileCategory
              key={child.id || child.name}
              category={child}
              depth={depth + 1}
              onClose={onClose}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* RECURSIVE FLYOUT SUBTREE RENDERER (For Desktop Flyout Generations 3, 4, 5) */
/* -------------------------------------------------------------------------- */
const RecursiveFlyoutTree: React.FC<{
  category: CategoryItem;
  depth: number;
  onClose: () => void;
}> = ({ category, depth, onClose }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = category.children && category.children.length > 0;
  const childCount = countTotalDescendants(category);

  return (
    <div className={`${depth > 2 ? 'pl-2.5 ml-1.5 border-l border-gray-200 my-1' : ''}`}>
      <div className="flex items-center justify-between py-1 group/item">
        <Link
          href={`/collections?category=${encodeURIComponent(category.name)}`}
          className={`flex items-center gap-1.5 text-xs transition-all flex-1 ${depth === 2
              ? 'font-black text-[#111111] hover:text-[#f6c947] uppercase'
              : depth === 3
                ? 'font-bold text-gray-700 hover:text-[#f6c947] hover:translate-x-1'
                : 'font-medium text-gray-500 hover:text-[#111111] hover:translate-x-1 text-[11px]'
            }`}
          onClick={onClose}
        >
          {category.icon && <span className="text-xs">{category.icon}</span>}
          <span className="line-clamp-1">{category.name}</span>

          {depth > 2 && (
            <span className="text-[8px] font-black px-1 py-0.2 bg-gray-100 text-gray-600 uppercase">
              G{depth}
            </span>
          )}

          {childCount > 0 && depth === 2 && (
            <span className="text-[9px] font-bold text-gray-400">
              ({childCount})
            </span>
          )}
        </Link>

        {hasChildren && depth >= 3 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-gray-400 hover:text-[#111111] cursor-pointer"
            title="Toggle deeper levels"
          >
            <ChevronDown size={11} className={`transform transition-transform duration-150 ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {/* Auto-expand Generation 2 children; for Gen 3+, allow smooth collapsible view up to Gen 5 */}
      {hasChildren && (depth === 2 || isExpanded) && depth < 5 && (
        <div className={`space-y-0.5 ${depth === 2 ? 'pt-1.5 pb-2' : 'pt-0.5'}`}>
          {category.children!.map((child) => (
            <RecursiveFlyoutTree
              key={child.id || child.name}
              category={child}
              depth={depth + 1}
              onClose={onClose}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* MAIN NAVBAR COMPONENT                                                */
/* -------------------------------------------------------------------------- */
export default function Navbar({
  initialCategories = [],
}: {
  initialCategories?: CategoryItem[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  // Desktop Categories Dropdown & Hovered Root Node
  const [isCatMenuOpen, setIsCatMenuOpen] = useState(false);
  const [hoveredRootCat, setHoveredRootCat] = useState<CategoryItem | null>(
    initialCategories && initialCategories.length > 0 ? initialCategories[0] : null
  );
  const [categoryFilterQuery, setCategoryFilterQuery] = useState('');

  // Mobile Accordion States
  const [mobileCatOpen, setMobileCatOpen] = useState(false);
  const [mobileHomeOpen, setMobileHomeOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const [mobileCollectionsOpen, setMobileCollectionsOpen] = useState(false);

  // Live Instant Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ProductSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Cart Drawer State (Slide-in from right)
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Dynamic Announcement Rotator
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const announcements = useMemo(
    () => [
      { text: 'FREE NATIONWIDE DELIVERY ON ORDERS OVER ₦50,000', icon: <Sparkles size={14} className="text-[#111111]" /> },
      { text: 'MID-SEASON CLEARANCE SALE: UP TO 50% OFF VERIFIED BRANDS', icon: <Flame size={14} className="text-red-700" /> },
      { text: 'VERIFIED ESCROW PROTECTION FOR BUYERS & SELLERS', icon: <ShieldCheck size={14} className="text-emerald-800" /> },
    ],
    []
  );

  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const catMenuRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);
  const removeItem = useCartStore((state) => state.removeItem);

  // Rotate Announcement ticker every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setAnnouncementIndex((prev) => (prev + 1) % announcements.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [announcements.length]);

  // Sync Categories from SSR prop or fallback to client fetch if empty
  useEffect(() => {
    setMounted(true);
    if (initialCategories && initialCategories.length > 0) {
      setCategories(initialCategories);
      setHoveredRootCat((prev) => prev || initialCategories[0]);
      return;
    }

    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setCategories(json.data);
          if (json.data.length > 0) {
            setHoveredRootCat(json.data[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCategories();
  }, [initialCategories]);

  // Debounced Live Instant Search Handler
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery.trim())}&limit=5`);
        const json = await res.json();
        if (json && Array.isArray(json.products)) {
          setSearchResults(json.products.slice(0, 5));
        } else if (Array.isArray(json)) {
          setSearchResults(json.slice(0, 5));
        } else if (json.data && Array.isArray(json.data)) {
          setSearchResults(json.data.slice(0, 5));
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error('Live search error:', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (catMenuRef.current && !catMenuRef.current.contains(event.target as Node)) {
        setIsCatMenuOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile drawer and dropdowns on route change
  useEffect(() => {
    setIsMobileDrawerOpen(false);
    setIsMobileSearchOpen(false);
    setIsCatMenuOpen(false);
    setIsSearchFocused(false);
    setIsCartDrawerOpen(false);
    setIsUserMenuOpen(false);
  }, [pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/collections?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileSearchOpen(false);
      setIsSearchFocused(false);
    }
  };

  const userDashboardUrl = user
    ? user.role === 'seller'
      ? '/dashboard/seller'
      : user.role === 'admin'
        ? '/dashboard/admin'
        : '/account'
    : '/login';

  const rootCategories = useMemo(() => {
    return categories.filter((c) => !c.parentId && !c.parent);
  }, [categories]);

  const displayCategories = rootCategories.length > 0 ? rootCategories : categories;

  // Filter root categories dynamically if user types in category search input
  const filteredRootCategories = useMemo(() => {
    if (!categoryFilterQuery.trim()) return displayCategories;
    const q = categoryFilterQuery.toLowerCase();
    return displayCategories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.children && c.children.some((child) => child.name.toLowerCase().includes(q)))
    );
  }, [displayCategories, categoryFilterQuery]);

  // Live Matching Category suggestions for the global search bar
  const matchingCategories = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return [];
    const q = searchQuery.toLowerCase();
    const matches: { name: string; rootName?: string; depth: number }[] = [];

    const searchTree = (list: CategoryItem[], depth = 1, rootName?: string) => {
      for (const item of list) {
        const currentRoot = depth === 1 ? item.name : rootName;
        if (item.name.toLowerCase().includes(q)) {
          matches.push({ name: item.name, rootName: currentRoot, depth });
        }
        if (item.children && item.children.length > 0) {
          searchTree(item.children, depth + 1, currentRoot);
        }
      }
    };

    searchTree(displayCategories);
    return matches.slice(0, 4);
  }, [displayCategories, searchQuery]);

  return (
    <header className="w-full font-sans sticky top-0 z-[100] bg-white shadow-xs transition-all duration-300">
      {/* 1. TOP DYNAMIC ROTATING ANNOUNCEMENT BAR */}
      <div className="bg-[#f6c947] text-[#111111] py-2 px-4 text-[11px] font-bold uppercase tracking-widest border-b border-[#e5b836]">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          {/* Dynamic Rotating Promo Ticker */}
          <div className="flex items-center gap-2 h-5 overflow-hidden">
            <div
              key={announcementIndex}
              className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              {announcements[announcementIndex].icon}
              <span className="font-extrabold tracking-wide line-clamp-1">
                {announcements[announcementIndex].text}
              </span>
            </div>
          </div>

          <div className="hidden lg:block text-center text-[10px] font-extrabold tracking-widest opacity-90">
            DISCOVER 500+ VERIFIED AFRICAN FASHION BRANDS
          </div>

          {/* User Auth Quick Links */}
          <div className="flex items-center gap-3 text-[10px]">
            {!mounted || !user ? (
              <>
                <Link href="/login" className="hover:opacity-75 transition-opacity font-extrabold">Login</Link>
                <span className="opacity-40">|</span>
                <Link href="/signup" className="hover:opacity-75 transition-opacity font-extrabold">Register</Link>
                <span className="opacity-40 hidden sm:inline">|</span>
                <Link href="/signup?role=seller" className="hover:text-black font-extrabold underline decoration-2 underline-offset-2 transition-colors hidden sm:inline">
                  Become a Seller
                </Link>
              </>
            ) : (
              <>
                <span className="font-medium text-black">
                  Welcome, <strong className="font-extrabold">{user.fullName?.split(' ')[0]}</strong>
                </span>
                <span className="opacity-40">|</span>
                <Link
                  href={userDashboardUrl}
                  className="font-extrabold underline decoration-2 underline-offset-2 hover:text-black"
                >
                  Dashboard
                </Link>
                {user.role !== 'seller' && user.role !== 'admin' && (
                  <>
                    <span className="opacity-40">|</span>
                    <Link href="/onboarding/become-a-seller" className="hover:text-black font-extrabold underline decoration-2 underline-offset-2 transition-colors">
                      Sell on F&K
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. HEADER TOP AREA: Logo, Live Autocomplete Search, User Profile & Live Mini-Cart */}
      <div className="bg-white py-4 md:py-5 border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-4 lg:gap-8">
            {/* Mobile Toggler Button */}
            <button
              onClick={() => {
                setIsMobileDrawerOpen(true);
                setIsMobileSearchOpen(false);
                setIsSearchFocused(false);
              }}
              className="lg:hidden p-2 text-[#111111] hover:text-[#f6c947] transition-colors focus:outline-none cursor-pointer"
              aria-label="Open mobile menu"
            >
              <Menu size={26} />
            </button>

            {/* Brand Logo */}
            <div className="flex items-center shrink-0">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/logo.png"
                  alt="F&K Logo"
                  width={190}
                  height={65}
                  priority
                  className="object-contain w-auto h-12 sm:h-14 md:h-16 max-w-[210px]"
                />
              </Link>
            </div>

            {/* Desktop Live Autocomplete Search Bar */}
            <div className="hidden lg:flex flex-1 max-w-xl mx-auto relative" ref={searchContainerRef}>
              <form onSubmit={handleSearchSubmit} className="w-full">
                <div className="relative w-full flex items-center">
                  <input
                    type="search"
                    value={searchQuery}
                    onFocus={() => setIsSearchFocused(true)}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products, brands, 5-gen categories..."
                    className="w-full h-11 pl-4 pr-14 bg-[#f8f8f8] border border-gray-300 rounded-none text-xs font-medium text-[#111111] placeholder-gray-400 focus:bg-white focus:border-[#111111] outline-none transition-all"
                  />
                  <button
                    type="submit"
                    aria-label="Submit search"
                    className="absolute right-0 inset-y-0 w-12 bg-[#111111] text-white hover:bg-[#f6c947] hover:text-[#111111] transition-colors flex items-center justify-center rounded-none cursor-pointer"
                  >
                    <Search size={18} />
                  </button>
                </div>
              </form>

              {/* Live Instant Search Dropdown Panel */}
              {isSearchFocused && searchQuery.trim().length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 shadow-2xl z-[120] rounded-none animate-in fade-in slide-in-from-top-2 duration-150 divide-y divide-gray-100">
                  {/* Category Matches */}
                  {matchingCategories.length > 0 && (
                    <div className="p-3 bg-gray-50/70">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5 mb-2">
                        <FolderTree size={12} className="text-[#f6c947]" /> Matching Categories
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {matchingCategories.map((c, i) => (
                          <Link
                            key={i}
                            href={`/collections?category=${encodeURIComponent(c.name)}`}
                            className="bg-white border border-gray-200 px-2.5 py-1 text-xs font-bold text-gray-800 hover:border-[#111111] hover:text-[#f6c947] hover:bg-[#111111] transition-all flex items-center gap-1.5"
                            onClick={() => setIsSearchFocused(false)}
                          >
                            <span>{c.name}</span>
                            <span className="text-[8px] bg-gray-100 text-gray-500 px-1 py-0.2">
                              G{c.depth}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Product Matches */}
                  <div className="p-3 max-h-80 overflow-y-auto">
                    {isSearching ? (
                      <div className="py-6 text-center text-gray-400 text-xs flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-[#f6c947] border-t-transparent rounded-full animate-spin" />
                        <span>Searching catalog...</span>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">
                          Product Matches
                        </span>
                        {searchResults.map((product) => (
                          <Link
                            key={product.id}
                            href={`/collections/${product.id}`}
                            className="flex items-center gap-3 p-2 hover:bg-gray-50 transition-colors group"
                            onClick={() => setIsSearchFocused(false)}
                          >
                            <div className="w-10 h-10 bg-gray-100 shrink-0 relative overflow-hidden border border-gray-200">
                              {product.primaryImage ? (
                                <Image
                                  src={product.primaryImage}
                                  alt={product.title}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform"
                                />
                              ) : (
                                <Package size={16} className="m-auto text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="text-xs font-bold text-gray-900 truncate group-hover:text-[#f6c947] transition-colors">
                                {product.title}
                              </h5>
                              <p className="text-[10px] text-gray-400 font-medium">
                                {product.seller?.businessName || 'Verified Store'}
                              </p>
                            </div>
                            <span className="text-xs font-black text-[#111111] shrink-0">
                              ₦{Number(product.price).toLocaleString()}
                            </span>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="py-6 text-center text-gray-400 text-xs">
                        No direct product matches for &quot;{searchQuery}&quot;
                      </div>
                    )}
                  </div>

                  {/* View All Search Results Footer */}
                  <div className="p-2 bg-gray-50 text-center">
                    <button
                      onClick={handleSearchSubmit}
                      className="w-full py-1.5 text-xs font-black uppercase tracking-wider text-[#111111] hover:text-[#f6c947] flex items-center justify-center gap-1 cursor-pointer"
                    >
                      View All Results for &quot;{searchQuery}&quot; <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Header Action Elements */}
            <div className="flex items-center gap-3 sm:gap-6 shrink-0">
              {/* Mobile Search Trigger */}
              <button
                onClick={() => {
                  setIsMobileSearchOpen(!isMobileSearchOpen);
                  setIsMobileDrawerOpen(false);
                }}
                className="lg:hidden p-1.5 text-[#111111] hover:text-[#f6c947] transition-colors cursor-pointer"
                aria-label="Search"
              >
                <Search size={22} />
              </button>

              {/* Notification Bell (Live for logged in users) */}
              {mounted && user && (
                <div className="flex items-center">
                  <NotificationBell />
                </div>
              )}

              {/* Dynamic User Profile Dropdown Widget */}
              <div className="relative hidden md:block" ref={userMenuRef}>
                <div
                  className="flex items-center gap-2.5 group cursor-pointer"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  <div className="w-10 h-10 rounded-none bg-[#f8f8f8] border border-gray-200 flex items-center justify-center text-[#111111] group-hover:bg-[#111111] group-hover:text-white transition-all">
                    <UserIcon size={19} />
                  </div>
                  <div className="flex flex-col text-left">
                    {mounted && user ? (
                      <>
                        <span className="text-[11px] font-black uppercase text-[#111111] group-hover:text-[#f6c947] transition-colors line-clamp-1 flex items-center gap-1">
                          {user.fullName?.split(' ')[0] || 'Account'}
                          <ChevronDown size={11} className={`transform transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                        </span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                          {user.role}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Account</span>
                        <div className="flex items-center gap-1 text-[11px] font-extrabold uppercase text-[#111111]">
                          <Link href="/login" className="hover:text-[#f6c947] transition-colors">Log In</Link>
                          <span className="text-gray-300">/</span>
                          <Link href="/signup" className="hover:text-[#f6c947] transition-colors">Register</Link>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* User Dropdown Flyout Panel */}
                {mounted && user && isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 shadow-2xl z-[120] rounded-none animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="p-4 bg-gray-50 border-b border-gray-100">
                      <h4 className="text-xs font-black uppercase text-[#111111] truncate">{user.fullName || 'User'}</h4>
                      <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[9px] font-black uppercase px-2 py-0.5 bg-[#f6c947] text-[#111111]">
                        {user.role === 'seller' ? 'Verified Seller' : user.role === 'admin' ? 'Platform Admin' : 'Valued Buyer'}
                      </span>
                    </div>

                    <div className="p-2 space-y-1 text-xs font-bold text-gray-700">
                      <Link
                        href={userDashboardUrl}
                        className="block px-3 py-2 hover:bg-[#111111] hover:text-[#f6c947] transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Main Dashboard
                      </Link>
                      <Link
                        href="/orders"
                        className="block px-3 py-2 hover:bg-[#111111] hover:text-[#f6c947] transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        My Orders
                      </Link>
                      {user.role !== 'seller' && user.role !== 'admin' && (
                        <Link
                          href="/onboarding/become-a-seller"
                          className="block px-3 py-2 text-blue-600 hover:bg-blue-50 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Become a Seller →
                        </Link>
                      )}
                    </div>

                    <div className="p-2 border-t border-gray-100 bg-gray-50/50">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout(false);
                        }}
                        className="w-full px-3 py-2 text-xs font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                      >
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic Shopping Cart Trigger -> Opens Slider/Drawer from Right */}
              <div
                className="flex items-center gap-2.5 group cursor-pointer"
                onClick={() => setIsCartDrawerOpen(true)}
                title="Open Shopping Bag"
              >
                <div className="w-10 h-10 rounded-none bg-[#f8f8f8] border border-gray-200 flex items-center justify-center text-[#111111] group-hover:bg-[#111111] group-hover:text-white transition-all relative">
                  <ShoppingBag size={19} />
                  {mounted && cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-[#f6c947] text-[#111111] text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-none shadow-xs">
                      {cartCount}
                    </span>
                  )}
                </div>
                <div className="hidden xl:flex flex-col text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Shopping Cart</span>
                  <span className="text-[11px] font-extrabold uppercase text-[#111111] group-hover:text-[#f6c947] transition-colors">
                    {mounted && cartCount > 0 ? `₦${cartSubtotal.toLocaleString()}` : '₦0.00'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Collapsible Mobile Search Input */}
          {isMobileSearchOpen && (
            <form onSubmit={handleSearchSubmit} className="lg:hidden mt-3 pt-3 border-t border-gray-100">
              <div className="relative w-full flex items-center">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, brands, categories..."
                  className="w-full h-10 pl-3 pr-12 bg-gray-50 border border-gray-300 text-xs font-medium text-[#111111] rounded-none outline-none focus:bg-white focus:border-[#111111] transition-all"
                  autoFocus
                />
                <button
                  type="submit"
                  aria-label="Submit search"
                  className="absolute right-0 inset-y-0 w-11 bg-[#111111] text-white hover:bg-[#f6c947] hover:text-[#111111] flex items-center justify-center rounded-none cursor-pointer transition-colors"
                >
                  <Search size={16} />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* 3. HEADER BOTTOM AREA: Dynamic "Shop Categories" Cascading 5-Gen Flyout & Mega Menus */}
      <div className="hidden lg:block bg-[#111111] text-white relative">
        <div className="container mx-auto px-4 relative">
          <div className="flex items-stretch justify-between">
            {/* Left: Shop Categories Cascading Dropdown */}
            <div className="relative w-64 lg:w-72 shrink-0" ref={catMenuRef}>
              <button
                onClick={() => {
                  setIsCatMenuOpen(!isCatMenuOpen);
                  if (!hoveredRootCat && displayCategories.length > 0) {
                    setHoveredRootCat(displayCategories[0]);
                  }
                }}
                className="w-full h-12 bg-[#f6c947] text-[#111111] px-5 flex items-center justify-between font-black uppercase text-xs tracking-wider transition-colors hover:bg-white cursor-pointer rounded-none"
              >
                <div className="flex items-center gap-2.5">
                  <Menu size={18} />
                  <span>Shop Categories</span>
                </div>
                <ChevronDown
                  size={16}
                  className={`transform transition-transform duration-200 ${isCatMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dynamic 5-Generation Cascading Category Flyout Panel */}
              {isCatMenuOpen && (
                <div className="absolute top-full left-0 bg-white text-[#111111] shadow-2xl border border-gray-200 z-50 animate-in fade-in slide-in-from-top-2 duration-150 rounded-none flex">
                  {/* Left Column: Root Categories List with Filter Input */}
                  <div className="w-64 border-r border-gray-100 py-2 bg-gray-50/50 flex flex-col max-h-[460px]">
                    <div className="px-3 pb-2 border-b border-gray-200">
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          value={categoryFilterQuery}
                          onChange={(e) => setCategoryFilterQuery(e.target.value)}
                          placeholder="Filter categories..."
                          className="w-full h-8 pl-7 pr-2 text-[11px] bg-white border border-gray-200 rounded-none outline-none focus:border-[#111111]"
                        />
                        <Search size={12} className="absolute left-2 text-gray-400" />
                        {categoryFilterQuery && (
                          <button
                            onClick={() => setCategoryFilterQuery('')}
                            className="absolute right-2 text-gray-400 hover:text-black cursor-pointer text-xs"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>

                    <ul className="overflow-y-auto divide-y divide-gray-100 flex-1">
                      {filteredRootCategories.map((cat) => {
                        const isSelected = hoveredRootCat?.id === cat.id;
                        const totalDesc = countTotalDescendants(cat);
                        const hasChildren = cat.children && cat.children.length > 0;

                        return (
                          <li
                            key={cat.id || cat.name}
                            onMouseEnter={() => setHoveredRootCat(cat)}
                          >
                            <Link
                              href={`/collections?category=${encodeURIComponent(cat.name)}`}
                              className={`px-4 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-between transition-all ${isSelected
                                  ? 'bg-[#111111] text-[#f6c947]'
                                  : 'text-gray-800 hover:bg-gray-100 hover:text-[#111111]'
                                }`}
                              onClick={() => setIsCatMenuOpen(false)}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                {cat.icon ? (
                                  <span className="text-sm shrink-0">{cat.icon}</span>
                                ) : (
                                  <Package size={14} className={isSelected ? 'text-[#f6c947]' : 'text-gray-400'} />
                                )}
                                <span className="truncate">{cat.name}</span>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0 ml-1">
                                {totalDesc > 0 && (
                                  <span
                                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded-none ${isSelected ? 'bg-[#f6c947] text-[#111111]' : 'bg-gray-200 text-gray-600'
                                      }`}
                                  >
                                    {totalDesc}
                                  </span>
                                )}
                                {hasChildren && (
                                  <ChevronRight size={13} className={isSelected ? 'text-[#f6c947]' : 'text-gray-400'} />
                                )}
                              </div>
                            </Link>
                          </li>
                        );
                      })}
                      {filteredRootCategories.length === 0 && (
                        <li className="p-4 text-center text-xs text-gray-400">
                          No matching categories
                        </li>
                      )}
                    </ul>

                    <div className="p-2 border-t border-gray-200 text-center bg-white">
                      <Link
                        href="/collections"
                        className="text-[10px] font-black uppercase text-[#111111] hover:text-[#f6c947] tracking-wider"
                        onClick={() => setIsCatMenuOpen(false)}
                      >
                        Browse All {displayCategories.length} Collections →
                      </Link>
                    </div>
                  </div>

                  {/* Right Panel: Flyout showing Generations 2, 3, 4, 5 for the active root category */}
                  {hoveredRootCat && (
                    <div className="w-[560px] p-6 bg-white min-h-[380px] max-h-[460px] overflow-y-auto">
                      {/* Active Root Header */}
                      <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-200">
                        <div className="flex items-center gap-2.5">
                          {hoveredRootCat.icon && <span className="text-xl">{hoveredRootCat.icon}</span>}
                          <div>
                            <h4 className="text-sm font-black uppercase text-[#111111] tracking-tight">
                              {hoveredRootCat.name}
                            </h4>
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                              Root Category · {countTotalDescendants(hoveredRootCat)} Sub-tiers
                            </span>
                          </div>
                        </div>

                        <Link
                          href={`/collections?category=${encodeURIComponent(hoveredRootCat.name)}`}
                          className="bg-[#111111] text-[#f6c947] px-3 py-1.5 text-[10px] font-black uppercase tracking-wider hover:bg-[#f6c947] hover:text-[#111111] transition-colors flex items-center gap-1.5"
                          onClick={() => setIsCatMenuOpen(false)}
                        >
                          Shop Collection <ArrowRight size={12} />
                        </Link>
                      </div>

                      {/* Multi-Gen Hierarchy Grid (Generations 2 through 5) */}
                      {hoveredRootCat.children && hoveredRootCat.children.length > 0 ? (
                        <div className="grid grid-cols-2 gap-6">
                          {hoveredRootCat.children.map((subcat) => (
                            <div
                              key={subcat.id || subcat.name}
                              className="bg-gray-50/60 p-3.5 border border-gray-100 hover:border-gray-300 transition-all"
                            >
                              <RecursiveFlyoutTree
                                category={subcat}
                                depth={2}
                                onClose={() => setIsCatMenuOpen(false)}
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-12 text-center text-gray-400">
                          <Package size={36} className="mx-auto mb-2 text-gray-300" />
                          <p className="text-xs font-semibold text-gray-600">Direct collection with no nested sub-tiers.</p>
                          <p className="text-[11px] text-gray-400 mt-1">Discover verified products listed under {hoveredRootCat.name}.</p>
                          <Link
                            href={`/collections?category=${encodeURIComponent(hoveredRootCat.name)}`}
                            className="inline-block mt-4 bg-[#111111] text-white px-5 py-2 text-[10px] font-black uppercase tracking-wider hover:bg-[#f6c947] hover:text-[#111111] transition-colors"
                            onClick={() => setIsCatMenuOpen(false)}
                          >
                            Explore {hoveredRootCat.name} Products
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right: Main Navigation Menu with Dynamic Full-Width Mega Menus */}
            <nav className="flex items-center gap-1 xl:gap-2 flex-1 pl-6">
              {/* HOME LINK & FULL-WIDTH MEGA MENU */}
              <div className="group/home static px-3 py-3.5 flex items-center">
                <Link
                  href="/"
                  className={`relative text-xs font-black uppercase tracking-[0.2em] transition-colors flex items-center gap-1.5 ${pathname === '/' ? 'text-[#f6c947]' : 'text-white hover:text-[#f6c947]'
                    }`}
                >
                  <span>Home</span>
                  <span className="bg-[#f6c947] text-[#111111] text-[8px] font-black px-1.5 py-0.5 rounded-none uppercase absolute -top-2.5 right-0">
                    Hot
                  </span>
                  <ChevronDown size={12} className="group-hover/home:rotate-180 transition-transform duration-200" />
                </Link>

                {/* Home Full-Width Mega-Menu Dropdown */}
                <div className="absolute top-full left-4 right-4 bg-white text-[#111111] shadow-2xl border border-gray-200 p-8 opacity-0 invisible group-hover/home:opacity-100 group-hover/home:visible transition-all duration-200 z-50 rounded-none transform translate-y-2 group-hover/home:translate-y-0">
                  <div className="grid grid-cols-12 gap-8">
                    {/* Col 1: Curated Lookbooks & Themes */}
                    <div className="col-span-3">
                      <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#111111] border-b-2 border-[#111111] pb-2.5 mb-4 flex items-center gap-2">
                        <Flame size={14} className="text-[#f6c947]" />
                        <span>Curated Themes</span>
                      </h4>
                      <ul className="space-y-2.5 text-xs font-semibold text-gray-600">
                        <li><Link href="/collections" className="hover:text-[#f6c947] hover:translate-x-1 transition-all block">New Season Lookbook 2026</Link></li>
                        <li><Link href="/collections" className="hover:text-[#f6c947] hover:translate-x-1 transition-all block">Summer Style Showcase</Link></li>
                        <li><Link href="/collections" className="hover:text-[#f6c947] hover:translate-x-1 transition-all block">Luxury Designer Hub</Link></li>
                        <li><Link href="/collections" className="hover:text-[#f6c947] hover:translate-x-1 transition-all block">Afro-Urban & Streetwear</Link></li>
                        <li><Link href="/collections" className="hover:text-[#f6c947] hover:translate-x-1 transition-all block">Handcrafted Couture</Link></li>
                      </ul>
                    </div>

                    {/* Col 2: Dynamic Root Categories & Subcategories from Database */}
                    <div className="col-span-3">
                      <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#111111] border-b-2 border-[#111111] pb-2.5 mb-4 flex items-center gap-2">
                        <Tag size={14} className="text-[#f6c947]" />
                        <span>Top Collections</span>
                      </h4>
                      <ul className="space-y-2.5 text-xs font-semibold text-gray-600">
                        {displayCategories.slice(0, 5).map((cat) => (
                          <li key={cat.id || cat.name}>
                            <Link
                              href={`/collections?category=${encodeURIComponent(cat.name)}`}
                              className="hover:text-[#f6c947] hover:translate-x-1 transition-all flex items-center justify-between"
                            >
                              <span className="line-clamp-1">{cat.name}</span>
                              {cat.children && cat.children.length > 0 && (
                                <span className="text-[9px] bg-gray-100 text-gray-600 px-1 py-0.2 font-bold">
                                  {cat.children.length} sub
                                </span>
                              )}
                            </Link>
                          </li>
                        ))}
                        <li>
                          <Link href="/collections" className="hover:text-[#f6c947] transition-all block text-[#f6c947] font-black uppercase tracking-wider pt-1">
                            Browse All Catalog ({displayCategories.length}) →
                          </Link>
                        </li>
                      </ul>
                    </div>

                    {/* Col 3: Buyer Perks */}
                    <div className="col-span-3">
                      <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#111111] border-b-2 border-[#111111] pb-2.5 mb-4 flex items-center gap-2">
                        <ShieldCheck size={14} className="text-[#f6c947]" />
                        <span>Marketplace Perks</span>
                      </h4>
                      <ul className="space-y-2.5 text-xs font-semibold text-gray-600">
                        <li><Link href="/shops" className="hover:text-[#f6c947] hover:translate-x-1 transition-all block">100% Verified Stores</Link></li>
                        <li><Link href="/about" className="hover:text-[#f6c947] hover:translate-x-1 transition-all block">Escrow Protected Checkout</Link></li>
                        <li><Link href="/contact" className="hover:text-[#f6c947] hover:translate-x-1 transition-all block">Nationwide Swift Delivery</Link></li>
                        <li><Link href="/onboarding/become-a-seller" className="hover:text-[#f6c947] transition-all block text-blue-600 font-bold">Sell On F&K Marketplace</Link></li>
                        <li><Link href="/contact" className="hover:text-[#f6c947] hover:translate-x-1 transition-all block">24/7 Dedicated Support</Link></li>
                      </ul>
                    </div>

                    {/* Col 4: Promo Banner Card */}
                    <div className="col-span-3 relative group/promo overflow-hidden bg-[#111111] p-5 text-white flex flex-col justify-between rounded-none border border-gray-200 min-h-[220px]">
                      <Image
                        src="/slides/slider1.jpg"
                        alt="Promo Banner"
                        fill
                        className="object-cover opacity-40 group-hover/promo:scale-105 transition-transform duration-700"
                      />
                      <div className="relative z-10">
                        <span className="bg-[#f6c947] text-[#111111] text-[9px] font-black uppercase px-2.5 py-1 inline-block mb-3 shadow-xs">
                          HOT DEAL
                        </span>
                        <h5 className="text-base font-black uppercase tracking-tight leading-tight mb-1 text-white">
                          Summer 2026 Collection
                        </h5>
                        <p className="text-xs text-gray-300 font-medium leading-relaxed">
                          Up to 50% discount on select verified fashion brands.
                        </p>
                      </div>
                      <div className="relative z-10 pt-4">
                        <Link
                          href="/collections"
                          className="inline-flex items-center gap-2 bg-[#f6c947] text-[#111111] px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-colors"
                        >
                          Shop Now <ArrowRight size={13} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SHOP LINK & FULL-WIDTH MEGA MENU */}
              <div className="group/shop static px-3 py-3.5 flex items-center">
                <Link
                  href="/shops"
                  className={`relative text-xs font-black uppercase tracking-[0.2em] transition-colors flex items-center gap-1.5 ${pathname === '/shops' ? 'text-[#f6c947]' : 'text-white hover:text-[#f6c947]'
                    }`}
                >
                  <span>Shop</span>
                  <span className="bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-none uppercase absolute -top-2.5 right-0">
                    Sale
                  </span>
                  <ChevronDown size={12} className="group-hover/shop:rotate-180 transition-transform duration-200" />
                </Link>

                {/* Shop Full-Width Mega-Menu Dropdown */}
                <div className="absolute top-full left-4 right-4 bg-white text-[#111111] shadow-2xl border border-gray-200 p-8 opacity-0 invisible group-hover/shop:opacity-100 group-hover/shop:visible transition-all duration-200 z-50 rounded-none transform translate-y-2 group-hover/shop:translate-y-0">
                  <div className="grid grid-cols-12 gap-8">
                    {/* Col 1: Dynamic Top Categories from DB */}
                    <div className="col-span-3">
                      <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#111111] border-b-2 border-[#111111] pb-2.5 mb-4 flex items-center gap-2">
                        <Package size={14} className="text-[#f6c947]" />
                        <span>Categories</span>
                      </h4>
                      <ul className="space-y-2.5 text-xs font-semibold text-gray-600">
                        {displayCategories.slice(0, 5).map((cat) => (
                          <li key={cat.id || cat.name}>
                            <Link
                              href={`/collections?category=${encodeURIComponent(cat.name)}`}
                              className="hover:text-[#f6c947] hover:translate-x-1 transition-all flex items-center justify-between"
                            >
                              <span className="line-clamp-1">{cat.name}</span>
                              {cat.children && cat.children.length > 0 && (
                                <span className="text-[9px] text-gray-400 font-bold">({cat.children.length})</span>
                              )}
                            </Link>
                          </li>
                        ))}
                        <li>
                          <Link href="/collections" className="text-[#f6c947] font-black uppercase text-[11px] hover:underline block pt-1">
                            All Categories →
                          </Link>
                        </li>
                      </ul>
                    </div>

                    {/* Col 2: Storefronts */}
                    <div className="col-span-3">
                      <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#111111] border-b-2 border-[#111111] pb-2.5 mb-4 flex items-center gap-2">
                        <Store size={14} className="text-[#f6c947]" />
                        <span>Verified Shops</span>
                      </h4>
                      <ul className="space-y-2.5 text-xs font-semibold text-gray-600">
                        <li><Link href="/shops" className="hover:text-[#f6c947] hover:translate-x-1 transition-all block">All Verified Stores</Link></li>
                        <li><Link href="/shops" className="hover:text-[#f6c947] hover:translate-x-1 transition-all block">Top Rated Vendors</Link></li>
                        <li><Link href="/shops" className="hover:text-[#f6c947] hover:translate-x-1 transition-all block">New Boutique Launch</Link></li>
                        <li><Link href="/shops" className="hover:text-[#f6c947] hover:translate-x-1 transition-all block">Spotlight Designers</Link></li>
                        <li><Link href="/onboarding/become-a-seller" className="text-blue-600 font-bold hover:underline block pt-1">Open Your Store →</Link></li>
                      </ul>
                    </div>

                    {/* Col 3: Shop Pages & Deals */}
                    <div className="col-span-3">
                      <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#111111] border-b-2 border-[#111111] pb-2.5 mb-4 flex items-center gap-2">
                        <BadgePercent size={14} className="text-[#f6c947]" />
                        <span>Featured Deals</span>
                      </h4>
                      <ul className="space-y-2.5 text-xs font-semibold text-gray-600">
                        <li><Link href="/collections" className="hover:text-[#f6c947] hover:translate-x-1 transition-all block">Flash Discounts 50% Off</Link></li>
                        <li><Link href="/collections" className="hover:text-[#f6c947] hover:translate-x-1 transition-all block">Under ₦20,000 Finds</Link></li>
                        <li><Link href="/collections" className="hover:text-[#f6c947] hover:translate-x-1 transition-all block">Best Seller Highlights</Link></li>
                        <li><Link href="/collections" className="hover:text-[#f6c947] hover:translate-x-1 transition-all block">Clearance Outlet</Link></li>
                        <li><Link href="/cart" className="hover:text-[#f6c947] hover:translate-x-1 transition-all block">My Shopping Cart</Link></li>
                      </ul>
                    </div>

                    {/* Col 4: Shop Promo Banner */}
                    <div className="col-span-3 relative group/promo overflow-hidden bg-[#111111] p-5 text-white flex flex-col justify-between rounded-none border border-gray-200 min-h-[220px]">
                      <Image
                        src="/slides/slider2.jpg"
                        alt="Shop Promo"
                        fill
                        className="object-cover opacity-40 group-hover/promo:scale-105 transition-transform duration-700"
                      />
                      <div className="relative z-10">
                        <span className="bg-red-600 text-white text-[9px] font-black uppercase px-2.5 py-1 inline-block mb-3 shadow-xs">
                          SPECIAL OFFER
                        </span>
                        <h5 className="text-base font-black uppercase tracking-tight leading-tight mb-1 text-white">
                          Verified Sellers Showcase
                        </h5>
                        <p className="text-xs text-gray-300 font-medium leading-relaxed">
                          Discover top curated digital storefronts nationwide.
                        </p>
                      </div>
                      <div className="relative z-10 pt-4">
                        <Link
                          href="/shops"
                          className="inline-flex items-center gap-2 bg-[#f6c947] text-[#111111] px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-colors"
                        >
                          View Shops <ArrowRight size={13} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* DYNAMIC COLLECTIONS LINK WITH MULTI-TIER DROPDOWN */}
              <div className="relative group/nav px-3 py-3.5 flex items-center">
                <Link
                  href="/collections"
                  className={`text-xs font-black uppercase tracking-[0.2em] transition-colors flex items-center gap-1 ${pathname === '/collections' ? 'text-[#f6c947]' : 'text-white hover:text-[#f6c947]'
                    }`}
                >
                  <span>Collections</span>
                  <ChevronDown size={12} className="group-hover/nav:rotate-180 transition-transform duration-200" />
                </Link>

                {/* Collections Dropdown Menu */}
                <div className="absolute top-full left-0 w-72 bg-white text-[#111111] shadow-2xl border border-gray-200 py-3 opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all duration-200 z-50 rounded-none">
                  <div className="px-4 pb-2 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">All Collections</span>
                    <Link href="/collections" className="text-[10px] font-bold text-[#f6c947] uppercase hover:underline">
                      View All ({displayCategories.length})
                    </Link>
                  </div>
                  <div className="pt-2 max-h-80 overflow-y-auto divide-y divide-gray-50">
                    {displayCategories.map((cat) => {
                      const count = countTotalDescendants(cat);
                      return (
                        <Link
                          key={cat.id || cat.name}
                          href={`/collections?category=${encodeURIComponent(cat.name)}`}
                          className="block px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-800 hover:bg-[#111111] hover:text-[#f6c947] transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2 truncate">
                              {cat.icon ? <span>{cat.icon}</span> : <span className="w-1.5 h-1.5 bg-[#f6c947]" />}
                              <span className="truncate">{cat.name}</span>
                            </span>
                            {count > 0 && (
                              <span className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.2 font-bold">
                                {count}
                              </span>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* BLOG LINK */}
              <Link
                href="/blog"
                className={`px-3 py-3.5 text-xs font-black uppercase tracking-[0.2em] transition-colors ${pathname === '/blog' ? 'text-[#f6c947]' : 'text-white hover:text-[#f6c947]'
                  }`}
              >
                Blog
              </Link>

              {/* ABOUT US */}
              <Link
                href="/about"
                className={`px-3 py-3.5 text-xs font-black uppercase tracking-[0.2em] transition-colors ${pathname === '/about' ? 'text-[#f6c947]' : 'text-white hover:text-[#f6c947]'
                  }`}
              >
                About Us
              </Link>

              {/* CONTACT US */}
              <Link
                href="/contact"
                className={`px-3 py-3.5 text-xs font-black uppercase tracking-[0.2em] transition-colors ${pathname === '/contact' ? 'text-[#f6c947]' : 'text-white hover:text-[#f6c947]'
                  }`}
              >
                Contact
              </Link>
            </nav>

            {/* Direct Seller CTA */}
            <div className="flex items-center gap-2 pl-4 text-xs font-bold text-gray-300">
              <Link
                href="/onboarding/become-a-seller"
                className="bg-transparent hover:bg-[#f6c947] text-white hover:text-[#111111] border border-[#f6c947] px-3.5 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all rounded-none"
              >
                Sell on F&K
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 4. MOBILE OFF-CANVAS SLIDE-OUT DRAWER WITH MULTI-GENERATION 5-TIER RECURSIVE ACCORDIONS */}
      <div
        className={`fixed inset-0 z-[200] lg:hidden transition-all duration-300 ${isMobileDrawerOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'
          }`}
      >
        {/* Backdrop Fade */}
        <div
          className={`fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ease-in-out ${isMobileDrawerOpen ? 'opacity-100' : 'opacity-0'
            }`}
          onClick={() => setIsMobileDrawerOpen(false)}
        />

        {/* Drawer Panel Slide-In from Left */}
        <div
          className={`fixed top-0 left-0 w-[300px] sm:w-[350px] h-full bg-white text-[#111111] shadow-2xl flex flex-col z-20 transform transition-transform duration-300 ease-in-out ${isMobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
          {/* Drawer Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-[#f8f8f8]">
            <Image src="/logo.png" alt="Logo" width={150} height={50} className="object-contain w-auto h-10" />
            <button
              onClick={() => setIsMobileDrawerOpen(false)}
              className="w-8 h-8 flex items-center justify-center text-[#111111] hover:bg-gray-200 rounded-none transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="w-full">
              <div className="relative w-full flex items-center">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, brands..."
                  className="w-full h-10 pl-3 pr-11 bg-gray-50 border border-gray-300 text-xs font-medium rounded-none outline-none focus:border-[#111111] transition-all"
                />
                <button
                  type="submit"
                  aria-label="Submit search"
                  className="absolute right-0 inset-y-0 w-10 bg-[#111111] text-white hover:bg-[#f6c947] hover:text-[#111111] flex items-center justify-center rounded-none cursor-pointer transition-colors"
                >
                  <Search size={15} />
                </button>
              </div>
            </form>

            {/* Dynamic 5-Generation Category Tree Accordion */}
            <div className="border border-gray-200 rounded-none overflow-hidden">
              <button
                onClick={() => setMobileCatOpen(!mobileCatOpen)}
                className="w-full p-3 bg-[#f6c947] text-[#111111] font-black uppercase text-xs tracking-wider flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Menu size={16} />
                  <span>Shop Categories</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-black text-[#f6c947] px-1.5 py-0.2 font-black">
                    {displayCategories.length}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`transform transition-transform duration-200 ${mobileCatOpen ? 'rotate-180' : ''}`}
                  />
                </div>
              </button>

              {mobileCatOpen && (
                <div className="bg-white p-3 divide-y divide-gray-100 max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150">
                  <Link
                    href="/collections"
                    className="block py-2 text-xs font-black uppercase tracking-wider text-[#111111] hover:text-[#f6c947]"
                    onClick={() => setIsMobileDrawerOpen(false)}
                  >
                    All Collections ({displayCategories.length})
                  </Link>

                  <div className="pt-2 space-y-1">
                    {displayCategories.map((cat) => (
                      <RecursiveMobileCategory
                        key={cat.id || cat.name}
                        category={cat}
                        depth={1}
                        onClose={() => setIsMobileDrawerOpen(false)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Main Menu Links with Collapsible Accordions */}
            <nav className="flex flex-col space-y-1">
              {/* Home Accordion */}
              <div className="border-b border-gray-100">
                <div className="flex items-center justify-between p-2.5">
                  <Link
                    href="/"
                    className="text-xs font-black uppercase tracking-wider text-[#111111] hover:text-[#f6c947] flex items-center gap-1.5"
                    onClick={() => setIsMobileDrawerOpen(false)}
                  >
                    <span>Home</span>
                    <span className="bg-[#f6c947] text-[#111111] text-[8px] font-bold px-1.5 py-0.5 uppercase">Hot</span>
                  </Link>
                  <button
                    onClick={() => setMobileHomeOpen(!mobileHomeOpen)}
                    className="p-1 text-gray-500 cursor-pointer"
                  >
                    <ChevronDown size={14} className={`transform transition-transform duration-200 ${mobileHomeOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                {mobileHomeOpen && (
                  <div className="pl-4 pb-2 space-y-1.5 text-xs font-medium text-gray-600 bg-gray-50 p-2">
                    <Link href="/collections" className="block py-1 hover:text-[#f6c947]" onClick={() => setIsMobileDrawerOpen(false)}>New Season Lookbook</Link>
                    <Link href="/collections" className="block py-1 hover:text-[#f6c947]" onClick={() => setIsMobileDrawerOpen(false)}>Summer Trends 2026</Link>
                    <Link href="/collections" className="block py-1 hover:text-[#f6c947]" onClick={() => setIsMobileDrawerOpen(false)}>Luxury Fashion Hub</Link>
                    <Link href="/shops" className="block py-1 hover:text-[#f6c947]" onClick={() => setIsMobileDrawerOpen(false)}>Verified Storefronts</Link>
                  </div>
                )}
              </div>

              {/* Shop Accordion */}
              <div className="border-b border-gray-100">
                <div className="flex items-center justify-between p-2.5">
                  <Link
                    href="/shops"
                    className="text-xs font-black uppercase tracking-wider text-[#111111] hover:text-[#f6c947] flex items-center gap-1.5"
                    onClick={() => setIsMobileDrawerOpen(false)}
                  >
                    <span>Shop</span>
                    <span className="bg-red-600 text-white text-[8px] font-bold px-1.5 py-0.5 uppercase">Sale</span>
                  </Link>
                  <button
                    onClick={() => setMobileShopOpen(!mobileShopOpen)}
                    className="p-1 text-gray-500 cursor-pointer"
                  >
                    <ChevronDown size={14} className={`transform transition-transform duration-200 ${mobileShopOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                {mobileShopOpen && (
                  <div className="pl-4 pb-2 space-y-1.5 text-xs font-medium text-gray-600 bg-gray-50 p-2">
                    <Link href="/shops" className="block py-1 hover:text-[#f6c947]" onClick={() => setIsMobileDrawerOpen(false)}>All Verified Stores</Link>
                    <Link href="/collections" className="block py-1 hover:text-[#f6c947]" onClick={() => setIsMobileDrawerOpen(false)}>Featured 50% Off Deals</Link>
                    <button
                      type="button"
                      className="block w-full text-left py-1 hover:text-[#f6c947] cursor-pointer"
                      onClick={() => {
                        setIsMobileDrawerOpen(false);
                        setIsCartDrawerOpen(true);
                      }}
                    >
                      Shopping Cart
                    </button>
                  </div>
                )}
              </div>

              {/* Collections Accordion */}
              <div className="border-b border-gray-100">
                <div className="flex items-center justify-between p-2.5">
                  <Link
                    href="/collections"
                    className="text-xs font-black uppercase tracking-wider text-[#111111] hover:text-[#f6c947]"
                    onClick={() => setIsMobileDrawerOpen(false)}
                  >
                    Collections
                  </Link>
                  <button
                    onClick={() => setMobileCollectionsOpen(!mobileCollectionsOpen)}
                    className="p-1 text-gray-500 cursor-pointer"
                  >
                    <ChevronDown size={14} className={`transform transition-transform duration-200 ${mobileCollectionsOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                {mobileCollectionsOpen && (
                  <div className="pl-4 pb-2 space-y-1.5 text-xs font-medium text-gray-600 bg-gray-50 p-2">
                    <Link href="/collections" className="block py-1 font-bold hover:text-[#f6c947]" onClick={() => setIsMobileDrawerOpen(false)}>
                      All Collections ({displayCategories.length})
                    </Link>
                    {displayCategories.map((cat) => (
                      <Link
                        key={cat.id || cat.name}
                        href={`/collections?category=${encodeURIComponent(cat.name)}`}
                        className="block py-1 hover:text-[#f6c947]"
                        onClick={() => setIsMobileDrawerOpen(false)}
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link
                href="/blog"
                className={`p-2.5 text-xs font-black uppercase tracking-wider hover:text-[#f6c947] border-b border-gray-100 ${pathname === '/blog' ? 'text-[#f6c947]' : 'text-[#111111]'
                  }`}
                onClick={() => setIsMobileDrawerOpen(false)}
              >
                Blog
              </Link>

              <Link
                href="/about"
                className={`p-2.5 text-xs font-black uppercase tracking-wider hover:text-[#f6c947] border-b border-gray-100 ${pathname === '/about' ? 'text-[#f6c947]' : 'text-[#111111]'
                  }`}
                onClick={() => setIsMobileDrawerOpen(false)}
              >
                About Us
              </Link>

              <Link
                href="/contact"
                className={`p-2.5 text-xs font-black uppercase tracking-wider hover:text-[#f6c947] border-b border-gray-100 ${pathname === '/contact' ? 'text-[#f6c947]' : 'text-[#111111]'
                  }`}
                onClick={() => setIsMobileDrawerOpen(false)}
              >
                Contact Us
              </Link>

              <Link
                href="/onboarding/become-a-seller"
                className="p-2.5 text-xs font-black uppercase tracking-wider text-[#f6c947] bg-[#111111] my-2 text-center block"
                onClick={() => setIsMobileDrawerOpen(false)}
              >
                Sell On F&K
              </Link>
            </nav>

            {/* User Account / Logout on Mobile */}
            <div className="pt-4 border-t border-gray-200">
              {mounted && user ? (
                <div className="space-y-2">
                  <Link
                    href={userDashboardUrl}
                    className="w-full block p-2.5 text-xs font-bold uppercase tracking-wider text-[#111111] bg-gray-100 text-center"
                    onClick={() => setIsMobileDrawerOpen(false)}
                  >
                    Dashboard ({user.fullName?.split(' ')[0]})
                  </Link>
                  <button
                    onClick={() => {
                      setIsMobileDrawerOpen(false);
                      logout(false);
                    }}
                    className="w-full p-2.5 text-xs font-bold uppercase tracking-wider text-white bg-red-600 text-center flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    className="p-2.5 text-xs font-bold uppercase tracking-wider text-[#111111] border border-gray-300 text-center hover:bg-gray-100"
                    onClick={() => setIsMobileDrawerOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    className="p-2.5 text-xs font-bold uppercase tracking-wider text-[#111111] bg-[#f6c947] text-center font-black"
                    onClick={() => setIsMobileDrawerOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 5. SLIDE-IN RIGHT CART DRAWER */}
      <CartDrawer open={isCartDrawerOpen} onClose={() => setIsCartDrawerOpen(false)} />
    </header>
  );
}
