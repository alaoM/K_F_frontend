// app/(site)/(marketplace)/store/[storeId]/StorefrontClient.tsx
'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { Store, Star, MapPin, Search } from 'lucide-react'
import { useCartStore, Product } from '@/store/useCartStore'
import { formatCurrency } from '@/helpers/functions'
import QuickViewModal from '@/app/components/marketplace/QuickViewModal'
import CartDrawer from '@/app/components/marketplace/CartDrawer'

interface StoreDetails {
  id: string;
  businessName: string;
  bio: string;
  logo: string;
  banner: string;
  businessCity: string;
  businessState: string;
  rating: number;
  joinedAt: string;
}

export default function StorefrontClient() {
  const params = useParams()
  const storeId = params.storeId as string

  const addItem = useCartStore((s) => s.addItem)

  const [store, setStore] = useState<StoreDetails | null>(null)
  const [products, setProducts] = useState<Product[]>([])

  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [quickView, setQuickView] = useState<Product | null>(null)
  const [cartOpen, setCartOpen] = useState(false)

  const fetchStoreData = useCallback(async () => {
    setLoading(true)
    try {
      const [storeRes, productsRes] = await Promise.all([
        fetch(`/api/sellers/${storeId}`),
        fetch(`/api/marketplace?sellerId=${storeId}&limit=20`)
      ])

      const storeData = await storeRes.json()
      const productsData = await productsRes.json()

      if (storeData.success) setStore(storeData.data)
      setProducts(Array.isArray(productsData) ? productsData : productsData.products || [])

    } catch (err) {
      console.error('Failed to load store', err)
    } finally {
      setLoading(false)
    }
  }, [storeId])

  useEffect(() => {
    fetchStoreData()
  }, [fetchStoreData])


  if (loading) return <div className="min-h-screen flex justify-center items-center">Loading Store...</div>
  if (!store) return <div className="min-h-screen flex justify-center items-center">Store not found</div>

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      {/* 1. STORE HERO BANNER */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        {/* Banner Image */}
        <div className="w-full h-48 md:h-64 relative bg-gray-200">
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
            <div className="w-32 h-32 relative rounded-full border-4 border-white bg-white shadow-lg overflow-hidden shrink-0">
              <Image
                src={store.logo || '/default-logo.png'}
                alt={store.businessName}
                fill
                className="object-cover"
              />
            </div>

            {/* Details */}
            <div className="flex-1 text-center md:text-left mt-4 md:mt-0">
              <h1 className="text-3xl font-extrabold text-[#243e6b]">{store.businessName}</h1>
              <p className="text-gray-500 mt-1 max-w-2xl">{store.bio}</p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3 text-sm text-gray-600 font-medium">
                <span className="flex items-center gap-1"><MapPin size={16} /> {store.businessCity}, {store.businessState}</span>
                <span className="flex items-center gap-1 text-yellow-500"><Star size={16} fill="currentColor" /> {store.rating || 0} Rating</span>
                <span className="flex items-center gap-1"><Store size={16} /> {products.length} Products</span>
              </div>
            </div>

            {/* Contact / Action Button */}
            <button className="bg-[#243e6b] text-white px-6 py-2.5 rounded-lg font-bold hover:bg-[#1d3155] transition-all">
              Contact Seller
            </button>
          </div>
        </div>
      </div>

      {/* 2. STORE PRODUCTS BODY */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Toolbar: Search within store */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-xl font-bold text-gray-800">All Items</h2>

          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search in this store..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#243e6b] outline-none"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>

        {/* Product Grid */}
        {products.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            This seller hasn&apos;t uploaded any products yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products
              .filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
              .map((p) => (
                <div key={p.id} className="bg-white border border-gray-200 rounded-lg text-center shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow">

                  <div className="relative h-56 w-full bg-gray-100 cursor-pointer" onClick={() => setQuickView(p)}>
                    <Image src={p.primaryImage} alt={p.title} fill className="object-cover" />
                  </div>

                  <div className='p-4 flex flex-col flex-grow justify-between'>
                    <div className="mb-3 text-left">
                      <h3 className="font-semibold text-gray-800 line-clamp-2">{p.title}</h3>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <p className="text-[#243e6b] font-bold text-lg">
                        {formatCurrency(p.price)}
                      </p>
                      <button
                        onClick={() => { addItem(p, 1); setCartOpen(true); }}
                        className="bg-[#f6c947] text-[#243e6b] px-3 py-1.5 text-sm font-bold rounded hover:bg-[#f6c947]/90 transition-all"
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
