'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { LogOut, Store } from 'lucide-react'

export default function Sidebar({
  totalOrders,
  onClose,
}: {
  totalOrders: number
  onClose?: () => void
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const active = searchParams.get('tab') || 'profile'
  const { user, logout } = useAuth()

  const menu = [
    { key: 'profile', label: 'Profile' },
    { key: 'orders', label: 'Orders', count: totalOrders },
    { key: 'tickets', label: 'My tickets', count: 4 },
    { key: 'security', label: 'Security' },
  ]

  const handleNav = (key: string) => {
    router.push(`/account?tab=${key}`)
    onClose?.() // ✅ close mobile drawer
  }

  return (
    <div className="bg-white h-full rounded-xl border border-[#e2e2e2] overflow-hidden flex flex-col">

      {/* Profile */}
      <div className="p-4 sm:p-6 text-center border-b border-[#e2e2e2]">
        <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto relative rounded-full overflow-hidden border-dotted  border-2 border-[#243e6b]">
          <Image
            fill
            src={user?.userAvatar || '/placeholder.png'}
            className="object-cover"
            alt="Avatar"
          />
        </div>

        <h3 className="mt-3 font-semibold text-base sm:text-lg">
          {user?.fullName}
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 truncate">
          {user?.email}
        </p>
      </div>

      {/* Menu */}
      <div className="flex-1">
        {menu.map((item) => (
          <button
            key={item.key}
            onClick={() => handleNav(item.key)}
            className={`w-full flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-[#e2e2e2] text-sm sm:text-base
              ${
                active === item.key
                  ? 'bg-[#243e6b] text-white'
                  : 'hover:bg-gray-100'
              }`}
          >
            <span>{item.label}</span>

            {typeof item.count === 'number' && (
              <span className="bg-[#f6c947] text-white text-xs px-2 py-1 rounded-full">
                {item.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Become a Seller CTA */}
      {user?.role === 'buyer' && (
        <div className="p-4 bg-blue-50 border-t border-blue-100">
          <Link 
            href="/signup?intent=seller" 
            className="flex items-center gap-2 justify-center w-full py-3 bg-[#243e6b] text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-blue-900/20 hover:scale-105 transition-all"
          >
            <Store size={14} />
            Setup My Shop
          </Link>
        </div>
      )}

      {/* Logout */}
      <button
        onClick={() => logout()}
        className="w-full flex gap-2 items-center text-left px-4 sm:px-6 py-4 bg-rose-500 text-white hover:bg-rose-600 text-sm sm:text-base font-bold transition-colors"
      >
        <LogOut size={16}/> 
        Sign out
      </button>
    </div>
  )
}