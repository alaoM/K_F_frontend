import React from 'react';
import { Search, User, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import NotificationBell from './NotificationBell';

const AdminHeader: React.FC = () => {
  const { user } = useAuth()
  return (
    <header className="h-16 bg-white border-b border-[#e2e2e2] flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex-1 items-center max-w-md">
        <div className="flex border border-[#e2e2e2] rounded-md overflow-hidden w-full">
          <input
            placeholder="Search anything..."
            className="flex-1 px-4 py-1.5 outline-none text-sm"
          />
          <button className="bg-[#243e6b] px-4 text-white flex items-center">
            <Search size={16} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <NotificationBell />

        <div className="flex items-center gap-3 border-l border-[#e2e2e2] pl-6 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-[#243e6b]">{user?.fullName}</p>
            <p className="text-xs text-gray-500">{user?.role} </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-100 border border-[#e2e2e2] flex items-center justify-center overflow-hidden">
            {
              user?.userAvatar ? (
                <Image src={user.userAvatar} alt="avatar" width={40} height={40} className="object-cover" />
              ) : (

                <User size={20} className="text-gray-400" />
              )
            }

          </div>
          <ChevronDown size={16} className="text-gray-400 group-hover:text-[#243e6b] transition-colors" />
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
