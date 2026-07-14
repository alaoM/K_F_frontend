'use client'

export const dynamic = 'force-dynamic'

import Disputes from '@/app/components/marketplace/accountPage/Disputes'
import Orders from '@/app/components/marketplace/accountPage/Orders'
import Profile from '@/app/components/marketplace/accountPage/Profile'
import Security from '@/app/components/marketplace/accountPage/Security'
import Sidebar from '@/app/components/marketplace/accountPage/Sidebar'
import { useAuth } from '@/context/AuthContext'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'

function AccountContent() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const tab = searchParams.get('tab') || 'profile'

  const [totalOrders, setTotalOrders] = useState(0)
  const [showSidebar, setShowSidebar] = useState(false)

  const renderContent = () => {
    switch (tab) {
      case 'orders':
        return <Orders setTotalOrders={setTotalOrders} />
      case 'profile':
        return <Profile user={user} />
      case 'tickets':
        return <Disputes />
      case 'security':
        return <Security />
      default:
        return <Profile user={user} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-3 sm:p-4">
      <div className="max-w-7xl mx-auto">

        {/* 🔥 Mobile Header */}
        <div className="lg:hidden flex justify-between items-center mb-4">
          <h1 className="text-lg font-bold">My Account</h1>
          <button
            onClick={() => setShowSidebar(true)}
            className="px-4 py-2 bg-[#243e6b] text-white rounded-lg"
          >
            Menu
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">

          {/* Sidebar (Desktop) */}
          <div className="hidden lg:block lg:col-span-3">
            <Sidebar totalOrders={totalOrders} />
          </div>

          {/* Content */}
          <div className="col-span-1 lg:col-span-9 bg-white p-4 sm:p-6 rounded-xl shadow-sm">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* 🔥 Mobile Sidebar Drawer */}
      {showSidebar && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div
            className="flex-1 bg-black/50"
            onClick={() => setShowSidebar(false)}
          />

          {/* Drawer */}
          <div className="w-72 bg-white h-full shadow-lg">
            <Sidebar
              totalOrders={totalOrders}
              onClose={() => setShowSidebar(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin" /></div>}>
      <AccountContent />
    </Suspense>
  )
}