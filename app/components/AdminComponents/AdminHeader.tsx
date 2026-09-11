import React from 'react';
import { Search, User, ChevronDown, Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import NotificationBell from './NotificationBell';

interface AdminHeaderProps {
  onToggleMobileSidebar?: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onToggleMobileSidebar }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b-2 border-gray-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-20 shadow-xs gap-3">
      {/* Mobile Sidebar Toggler + Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 bg-[#111111] text-[#f6c947] border border-[#111111] hover:bg-[#f6c947] hover:text-[#111111] rounded-none transition-colors cursor-pointer shrink-0"
            aria-label="Toggle Navigation Drawer"
          >
            <Menu size={18} />
          </button>
        )}

        <div className="flex border-2 border-gray-200 focus-within:border-[#111111] rounded-none overflow-hidden w-full transition-colors">
          <input
            placeholder="Search dashboard, orders, products..."
            className="flex-1 min-w-0 px-3.5 py-1.5 outline-none text-xs font-medium placeholder:text-gray-400 bg-white"
          />
          <button className="bg-[#f6c947] hover:bg-[#111111] text-[#111111] hover:text-[#f6c947] px-3.5 sm:px-4 font-bold flex items-center justify-center transition-colors rounded-none shrink-0 cursor-pointer">
            <Search size={15} />
          </button>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 sm:gap-6 shrink-0">
        <NotificationBell />

        {/* User Profile Chip */}
        <div className="flex items-center gap-3 border-l-2 border-gray-200 pl-3 sm:pl-6 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black uppercase tracking-wider text-[#111111] group-hover:text-[#243e6b] transition-colors">
              {user?.fullName || 'User'}
            </p>
            <div className="flex justify-end mt-0.5">
              <span className="bg-[#111111] text-white text-[9px] font-black uppercase tracking-widest px-1.5 py-0.2 rounded-none">
                {user?.role || 'Portal'}
              </span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-none bg-gray-100 border-2 border-[#111111] flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
            {user?.userAvatar ? (
              <Image src={user.userAvatar} alt="avatar" width={36} height={36} className="object-cover" />
            ) : (
              <User size={18} className="text-gray-500" />
            )}
          </div>
          <ChevronDown size={14} className="text-gray-400 group-hover:text-[#111111] transition-colors hidden sm:block" />
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
