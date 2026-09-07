'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Star, Store, Search, Filter, ArrowRight } from 'lucide-react'
import { Product, useCartStore } from '@/store/useCartStore'
import { formatCurrency } from '@/helpers/functions'
import QuickViewModal from '@/app/components/marketplace/QuickViewModal'
import CartDrawer from '@/app/components/marketplace/CartDrawer'

interface SellerStore {
  id: string
  businessName: string
  businessEmail: string
  businessAddress: string
  businessCity: string
  businessState: string
  bio?: string
  banner?: string
  logo?: string
  rating?: number
}

export default function StorefrontClient({
  store,
  products = []
}: {
  store: SellerStore
  products: Product[]
}) {
  const [search, setSearch] = useState('')
  const [quickView, setQuickView] = useState<Product | null>(null)
  const [cartOpen, setCartOpen] = useState(false)
  const { addItem } = useCartStore()

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">

      {/* 1. STORE HERO BANNER */}
      <div className="bg-white border-b border-gray-200 shadow-xs">
        {/* Banner Image */}
        <div className="w-full h-48 md:h-64 relative bg-gray-100">
          <Image
            src={store.banner || '/breadcrumb/breadcrumb.jpg'}
            alt="Store Banner"
            fill
            className="object-cover"
          />
        </div>

        {/* Store Info (Overlapping layout) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex flex-col md:flex-row items-center md:items-end gap-6 -mt-12 md:-mt-16 pb-8">

            {/* Logo */}
            <div className="w-28 h-28 md:w-32 md:h-32 relative rounded-none border-4 border-white bg-white shadow-md overflow-hidden shrink-0">
              <Image
                src={store.logo || '/default-logo.png'}
                alt={store.businessName}
                fill
                className="object-cover"
              />
            </div>

            {/* Details */}
            <div className="flex-1 text-center md:text-left mt-4 md:mt-0">
              <h1 className="text-2xl md:text-3xl font-black uppercase text-[#111111]">{store.businessName}</h1>
              <p className="text-gray-500 mt-1 max-w-2xl text-xs">{store.bio}</p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3 text-xs text-gray-600 font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1"><MapPin size={14} className="text-[#f6c947]" /> {store.businessCity}, {store.businessState}</span>
                <span className="flex items-center gap-1 text-[#f6c947]"><Star size={14} fill="currentColor" /> {store.rating || 0} Rating</span>
                <span className="flex items-center gap-1"><Store size={14} /> {products.length} Products</span>
              </div>
            </div>

            {/* Contact / Action Button */}
            <button className="bg-[#111111] text-[#f6c947] hover:bg-[#f6c947] hover:text-[#111111] px-6 py-2.5 rounded-none font-black text-xs uppercase tracking-widest transition-all cursor-pointer">
              Contact Seller
            </button>
          </div>
        </div>
      </div>

      {/* 2. STORE PRODUCTS BODY */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Toolbar: Search within store */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-lg font-black uppercase text-[#111111] tracking-wider">All Store Items</h2>

          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search in this store..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-none text-xs focus:border-[#111111] outline-none"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>
        </div>

        {/* Product Grid */}
        {products.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-xs font-bold uppercase tracking-wider bg-white border border-gray-200 p-8 rounded-none">
            This seller hasn&apos;t uploaded any products yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products
              .filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
              .map((p) => (
                <div key={p.id} className="bg-white border border-gray-200 rounded-none text-center shadow-xs overflow-hidden flex flex-col group hover:border-[#111111] transition-all">

                  <div className="relative h-56 w-full bg-gray-100 cursor-pointer overflow-hidden" onClick={() => setQuickView(p)}>
                    <Image src={p.primaryImage} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>

                  <div className='p-4 flex flex-col flex-grow justify-between text-left'>
                    <div className="mb-3">
                      <h3 className="font-bold text-xs uppercase text-gray-900 line-clamp-2">{p.title}</h3>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                      <p className="text-[#111111] font-black text-sm">
                        {formatCurrency(p.price)}
                      </p>
                      <button
                        onClick={() => { addItem(p, 1); setCartOpen(true); }}
                        className="bg-[#111111] text-[#f6c947] hover:bg-[#f6c947] hover:text-[#111111] px-3 py-1.5 text-xs font-black uppercase rounded-none transition-all cursor-pointer"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {quickView && (
        <QuickViewModal product={quickView} onClose={() => setQuickView(null)} onAddToCart={() => setCartOpen(true)} />
      )}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

    </div>
  )
}
