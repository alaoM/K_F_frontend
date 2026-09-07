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
    onClose?.()
  }

  return (
    <div className="bg-white h-full rounded-none border border-gray-200 overflow-hidden flex flex-col shadow-xs">

      {/* Profile */}
      <div className="p-4 sm:p-6 text-center border-b border-gray-200 bg-gray-50/50">
        <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto relative rounded-none overflow-hidden border-2 border-gray-300 bg-white">
          <Image
            fill
            src={user?.userAvatar || '/placeholder.png'}
            className="object-cover"
            alt="Avatar"
          />
        </div>

        <h3 className="mt-3 font-black text-sm sm:text-base uppercase text-[#111111]">
          {user?.fullName}
        </h3>
        <p className="text-xs text-gray-500 truncate">
          {user?.email}
        </p>
      </div>

      {/* Menu */}
      <div className="flex-1">
        {menu.map((item) => (
          <button
            key={item.key}
            onClick={() => handleNav(item.key)}
            className={`w-full flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-gray-100 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer
              ${
                active === item.key
                  ? 'bg-[#111111] text-[#f6c947]'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
          >
            <span>{item.label}</span>

            {typeof item.count === 'number' && (
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-none ${active === item.key ? 'bg-[#f6c947] text-[#111111]' : 'bg-gray-200 text-gray-700'}`}>
                {item.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Become a Seller CTA */}
      {user?.role === 'buyer' && (
        <div className="p-4 bg-yellow-50/60 border-t border-yellow-100">
          <Link 
            href="/signup?intent=seller" 
            className="flex items-center gap-2 justify-center w-full py-3 bg-[#111111] text-[#f6c947] text-[10px] font-black uppercase tracking-widest rounded-none hover:bg-[#f6c947] hover:text-[#111111] transition-all"
          >
            <Store size={14} />
            Setup My Shop
          </Link>
        </div>
      )}

      {/* Logout */}
      <button
        onClick={() => logout()}
        className="w-full flex gap-2 items-center text-left px-4 sm:px-6 py-3.5 bg-red-600 text-white hover:bg-red-700 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
      >
        <LogOut size={14}/> 
        Sign out
      </button>
    </div>
  )
}