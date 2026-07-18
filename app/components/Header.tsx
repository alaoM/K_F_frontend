'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, User, ShoppingBag, Heart, Menu, X, ChevronDown } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuth } from '@/context/AuthContext';
import NotificationBell from './AdminComponents/NotificationBell';

const TopNotificationBar = ({ user }: { user: any }) => (
  <>

  <div className="bg-[#f6c947] py-2.5 text-white text-[11px] font-bold uppercase tracking-widest text-center">
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
  </>
);

const Header = () => {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const [mounted, setMounted] = useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const NAV_LINKS = [
    { title: 'Home', href: '/', label: 'Hot' },
    { title: 'Shops', href: '/shops', label: 'New' },
    { title: 'Collections', href: '/collections' },
    { title: 'Product', href: '/collections', label: 'Sale' },
    { title: 'Blogs', href: '/blog' },
    { title: 'Pages', href: '#' },
  ];
   

  return (
    <>
      <TopNotificationBar user={mounted ? user : null} />
      <header className="sticky top-0 z-[100] bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* LOGO */}
            <Link href="/" className="shrink-0">
              <Image src="/logo.png" alt="fkstores Logo" width={160} height={55} className="object-contain" />
            </Link>

            {/* DESKTOP MENU */}
            <nav className="hidden xl:flex items-center gap-2 h-full">
              {NAV_LINKS.map((link) => (
                <div key={link.title} className="relative group px-4 py-8 h-full flex items-center">
                  <Link
                    href={link.href}
                    className="text-[13px] font-bold uppercase tracking-widest text-[#222222] hover:text-[#f6c947] transition-colors flex items-center gap-1"
                  >
                    {link.title}
                    {link.label && (
                      <span className={`absolute -top-1 -right-0 text-[8px] px-1.5 py-0.5 rounded-sm text-white uppercase font-black ${link.label === 'Hot' ? 'bg-[#f6c947]' : link.label === 'New' ? 'bg-blue-500' : 'bg-[#222222]'}`}>
                        {link.label}
                      </span>
                    )}
                    {(link.title === 'Collections' || link.title === 'Product' || link.title === 'Pages') && (
                      <ChevronDown size={12} className="group-hover:rotate-180 transition-transform" />
                    )}
                  </Link>
                </div>
              ))}
            </nav>

            {/* ICONS */}
            <div className="flex items-center gap-6">
              <button className="text-[#222222] hover:text-[#f6c947] transition-colors hidden sm:block">
                <Search size={20} />
              </button>
              
              {mounted && (
                <>
                  <Link href="/dashboard" className="text-[#222222] hover:text-[#f6c947] transition-colors hidden sm:block">
                    <User size={20} />
                  </Link>
                  <div className="hidden sm:block">
                    <NotificationBell />
                  </div>
                </>
              )}

              <button className="text-[#222222] hover:text-[#f6c947] transition-colors relative">
                <ShoppingBag size={20} />
                {mounted && cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#f6c947] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>
              <button
                className="xl:hidden text-[#222222]"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE MENU */}
        {isMobileMenuOpen && (
          <div className="xl:hidden bg-white border-t border-gray-100 py-4 absolute top-20 left-0 w-full shadow-lg">
            <nav className="flex flex-col container mx-auto px-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.title}
                  href={link.href}
                  className="py-3 text-sm font-bold uppercase tracking-widest text-[#222222] border-b border-gray-50 last:border-none"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.title}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;