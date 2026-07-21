'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { HelpCircle, User, ShoppingCart, Menu, X, ChevronDown, LogOut, Search } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuth } from '@/context/AuthContext';
import NotificationBell from './AdminComponents/NotificationBell';

const TopNotificationBar = ({ user }: { user: any }) => (
  <div className="bg-[#f6c947] py-2 text-white text-[11px] font-bold uppercase tracking-widest text-center">
    <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-2">
      <div className="hidden md:block">FREE SHIPPING ON ORDERS OVER $100</div>
      <div className="flex-1 text-center">Select sale styles up to 50% off</div>
      <div className="flex gap-4">
        {!user ? (
          <>
            <Link href="/login" className="hover:opacity-80">Login</Link>
            <span className="opacity-40">|</span>
            <Link href="/signup" className="hover:opacity-80">Register</Link>
            <span className="opacity-40 hidden sm:inline">|</span>
            <Link href="/signup?role=seller" className="hover:text-[#222222] transition-colors hidden sm:inline">Become a Seller</Link>
          </>
        ) : (
          <>
            <span className="opacity-80">Welcome back, {user.fullName?.split(' ')[0]}!</span>
            {user.role !== 'seller' && user.role !== 'admin' && (
              <>
                <span className="opacity-40">|</span>
                <Link href="/onboarding/become-a-seller" className="hover:text-[#222222] transition-colors underline decoration-2 underline-offset-4">Sell on F&K</Link>
              </>
            )}
          </>
        )}
      </div>
    </div>
  </div>
);

const Header = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setCategories(json.data);
        }
      } catch (err) {
        console.error('Failed to load categories in Header', err);
      }
    };
    fetchCategories();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/collections?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const NAV_LINKS = [
    { title: 'Shops', href: '/shops', label: 'New' },
    { title: 'Categories', href: '/collections', hasDropdown: true },
    { title: 'Blogs', href: '/blog' },
  ];

  const userDashboardUrl = user
    ? user.role === 'seller'
      ? '/dashboard/seller'
      : user.role === 'admin'
        ? '/dashboard/admin'
        : '/account'
    : '/login';

  return (
    <>
      <TopNotificationBar user={mounted ? user : null} />
      <header className="sticky top-0 z-[100] bg-white border-b border-gray-200 shadow-sm font-sans">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20 gap-4">
            {/* LOGO (Home function) */}
            <Link href="/" className="shrink-0 flex items-center gap-2">
              <Image src="/logo.png" alt="F&K Logo" width={160} height={55} className="object-contain" priority />
            </Link>

            {/* SEARCH INPUT BAR ON NAVBAR (Desktop) */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center flex-1 max-w-sm lg:max-w-md relative">
              <Search className="absolute left-3.5 text-gray-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by title or category..."
                className="w-full pl-10 pr-24 py-2 bg-gray-50 border border-gray-300 rounded-none text-xs font-medium focus:bg-white focus:border-[#222222] outline-none transition-all"
              />
              <button
                type="submit"
                className="absolute right-1 bg-[#222222] hover:bg-[#f6c947] hover:text-[#222222] text-white px-4 py-1.5 rounded-none text-[10px] font-bold uppercase tracking-wider transition-colors"
              >
                Search
              </button>
            </form>

            {/* DESKTOP MENU */}
            <nav className="hidden xl:flex items-center gap-2 h-full">
              {NAV_LINKS.map((link) => (
                <div key={link.title} className="relative group px-3 py-8 h-full flex items-center">
                  <Link
                    href={link.href}
                    className="text-[13px] font-bold uppercase tracking-widest text-[#222222] hover:text-[#f6c947] transition-colors flex items-center gap-1"
                  >
                    {link.title}
                    {link.label && (
                      <span className="absolute top-3 -right-0 text-[8px] px-1.5 py-0.5 rounded-none text-white uppercase font-black bg-blue-500">
                        {link.label}
                      </span>
                    )}
                    {link.hasDropdown && (
                      <ChevronDown size={12} className="group-hover:rotate-180 transition-transform duration-200" />
                    )}
                  </Link>

                  {/* CATEGORIES DROPDOWN MENU - Sharp Rectangular Edges */}
                  {link.hasDropdown && (
                    <div className="absolute top-full left-0 w-60 bg-white shadow-xl rounded-none border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 transform translate-y-2 group-hover:translate-y-0">
                      <div className="px-4 py-1 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 mb-1">
                        Select Category
                      </div>
                      <Link
                        href="/collections"
                        className="block px-4 py-2 text-xs font-bold text-[#222222] hover:bg-[#222222] hover:text-[#f6c947] transition-colors uppercase tracking-wider"
                      >
                        All Categories
                      </Link>
                      {categories.length > 0 ? (
                        categories.map((cat) => (
                          <Link
                            key={cat.id || cat.name}
                            href={`/collections?category=${encodeURIComponent(cat.name)}`}
                            className="block px-4 py-2 text-xs font-medium text-gray-700 hover:bg-[#222222] hover:text-[#f6c947] transition-colors uppercase tracking-wider"
                          >
                            {cat.name}
                          </Link>
                        ))
                      ) : (
                        ['Clothes', 'Shoes', 'Bags', 'Accessories', 'Electronics'].map((fallback) => (
                          <Link
                            key={fallback}
                            href={`/collections?category=${encodeURIComponent(fallback)}`}
                            className="block px-4 py-2 text-xs font-medium text-gray-700 hover:bg-[#222222] hover:text-[#f6c947] transition-colors uppercase tracking-wider"
                          >
                            {fallback}
                          </Link>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* RIGHT ICONS */}
            <div className="flex items-center gap-4 sm:gap-5">
              {/* HELP ICON */}
              <Link
                href="/contact"
                title="Help & Support"
                className="text-[#222222] hover:text-[#f6c947] transition-colors hidden sm:block p-1"
              >
                <HelpCircle size={21} />
              </Link>

              {mounted && (
                <>
                  <Link
                    href={userDashboardUrl}
                    title="Account / Dashboard"
                    className="text-[#222222] hover:text-[#f6c947] transition-colors hidden sm:block p-1"
                  >
                    <User size={21} />
                  </Link>
                  {/* <div className="hidden sm:block">
                    <NotificationBell />
                  </div> */}
                </>
              )}

              {/* CART ICON 🛒 */}
              <Link href="/cart" className="text-[#222222] hover:text-[#f6c947] transition-colors relative p-1" title="Shopping Cart">
                <ShoppingCart size={21} />
                {mounted && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#f6c947] text-[#222222] text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-none shadow-sm">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* LOGOUT BUTTON */}
              {mounted && user && (
                <button
                  onClick={() => logout(false)}
                  title="Logout"
                  className="text-gray-700 hover:text-white hover:bg-red-600 border border-gray-200 transition-colors hidden sm:flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-gray-50 px-3 py-1.5 rounded-none"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              )}

              {/* MOBILE MENU TOGGLE */}
              <button
                className="xl:hidden text-[#222222] p-1"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE MENU */}
        {isMobileMenuOpen && (
          <div className="xl:hidden bg-white border-t border-gray-200 py-4 absolute top-20 left-0 w-full shadow-lg z-50 rounded-none">
            <nav className="flex flex-col container mx-auto px-4 space-y-3">

              {/* MOBILE SEARCH BAR */}
              <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
                <Search className="absolute left-3 text-gray-400" size={16} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-9 pr-20 py-2 bg-gray-50 border border-gray-300 rounded-none text-xs font-medium focus:bg-white focus:border-[#222222] outline-none"
                />
                <button
                  type="submit"
                  className="absolute right-1 bg-[#222222] text-white px-3 py-1 text-[10px] font-bold uppercase rounded-none"
                >
                  Search
                </button>
              </form>

              <Link
                href="/shops"
                className="py-2.5 text-sm font-bold uppercase tracking-widest text-[#222222] border-b border-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Shops
              </Link>

              <div className="py-2 border-b border-gray-100">
                <div className="text-sm font-bold uppercase tracking-widest text-[#222222] mb-2">
                  Categories
                </div>
                <div className="pl-4 flex flex-col space-y-2 py-1">
                  <Link
                    href="/collections"
                    className="text-xs font-semibold uppercase tracking-wider text-gray-600 hover:text-[#f6c947]"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    All Categories
                  </Link>
                  {categories.map((cat) => (
                    <Link
                      key={cat.id || cat.name}
                      href={`/collections?category=${encodeURIComponent(cat.name)}`}
                      className="text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-[#f6c947]"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              <Link
                href="/blog"
                className="py-2.5 text-sm font-bold uppercase tracking-widest text-[#222222] border-b border-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Blogs
              </Link>

              <Link
                href="/contact"
                className="py-2.5 text-sm font-bold uppercase tracking-widest text-[#222222] border-b border-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Help & Support
              </Link>

              {mounted && user && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout(false);
                  }}
                  className="py-2.5 text-sm font-bold uppercase tracking-widest text-red-500 text-left flex items-center gap-2"
                >
                  <LogOut size={16} /> Logout
                </button>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;