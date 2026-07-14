"use client"
import { Box, ChevronDown, List, Table } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import ProductCard from './ProductCard'
import { ProductSkeleton } from '../Loaders'
import QuickViewModal from './QuickViewModal'
import CartDrawer from './CartDrawer'

const Collections = () => {
    const searchParams = useSearchParams()
    const categoryQuery = searchParams.get('category')
    
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filterToggle, setFilterToggle] = useState(false)
    const [sortBy, setSortBy] = useState('Best Selling')
    const [quickView, setQuickView] = useState<any>(null)
    const [cartOpen, setCartOpen] = useState(false)

    const fetchProducts = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (categoryQuery) params.append('category', categoryQuery)
            
            const res = await fetch(`/api/marketplace?${params.toString()}`)
            const data = await res.json()
            setProducts(Array.isArray(data) ? data : data.products || [])
        } catch (err) {
            console.error(err)
            setProducts([])
        } finally {
            setLoading(false)
        }
    }, [categoryQuery])

    useEffect(() => {
        fetchProducts()
    }, [fetchProducts])

    return (
        <div className='px-4 sm:px-6 lg:px-8 py-6 sm:py-8'>
            <div className='space-y-12 pb-24'>
                {/* BREADCRUMB / HERO */}
                <div className='w-full h-80 relative rounded-[2.5rem] overflow-hidden group shadow-2xl'>
                    <Image 
                        src={products[0]?.primaryImage || "/breadcrumb/breadcrumb.jpg"} 
                        alt="collection" 
                        fill 
                        className='object-cover transition-transform duration-1000 group-hover:scale-105' 
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col items-center justify-center text-center p-6'>
                        <h1 className='text-4xl md:text-6xl text-[#f6c947] font-black uppercase tracking-tighter mb-4 drop-shadow-lg'>
                            {categoryQuery ? `${categoryQuery} Collection` : 'All Collections'}
                        </h1>
                        <div className='flex items-center gap-3 text-white text-[10px] font-black uppercase tracking-[0.3em] bg-black/20 backdrop-blur-md px-6 py-3 rounded-full'>
                            <Link href="/" className="hover:text-[#f6c947] transition-colors">Home</Link>
                            <span className="opacity-40">/</span>
                            <span className='text-[#f6c947]'>Shop</span>
                        </div>
                    </div>
                </div>

                {/* FILTER BAR */}
                <div className='flex flex-col md:flex-row items-center justify-between gap-6 border-b border-[#e2e2e2] pb-8'>
                    <div className='flex items-center gap-8'>
                        <div className='flex items-center gap-4 text-gray-400'>
                            <button className='p-2 hover:text-[#222222] transition-colors'>
                                <Table size={20} />
                            </button>
                            <button className='p-2 hover:text-[#222222] transition-colors'>
                                <List size={20} />
                            </button>
                        </div>
                        <p className='text-xs font-bold text-gray-400 uppercase tracking-widest'>
                            Showing <span className='text-[#222222]'>{products.length}</span> results
                        </p>
                    </div>

                    <div className='flex items-center gap-4'>
                        <div className='relative'>
                            <button 
                                onClick={() => setFilterToggle(!filterToggle)}
                                className='flex items-center gap-3 px-6 py-3 border border-[#e2e2e2] rounded-xl text-xs font-black uppercase tracking-widest hover:border-[#222222] transition-all bg-white'
                            >
                                Sort by: <span className='text-gray-400'>{sortBy}</span>
                                <ChevronDown size={14} className={`transition-transform ${filterToggle ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {filterToggle && (
                                <div className='absolute top-full right-0 mt-2 w-56 shadow-2xl bg-white rounded-2xl z-[60] border border-gray-100 overflow-hidden py-2'>
                                    {['Featured', 'Best Selling', 'Price: Low to High', 'Price: High to Low', 'Alphabetically A-Z', 'Alphabetically Z-A'].map((option) => (
                                        <button 
                                            key={option}
                                            onClick={() => {
                                                setSortBy(option);
                                                setFilterToggle(false);
                                            }}
                                            className={`w-full text-left px-6 py-3 text-xs font-bold uppercase tracking-widest transition-colors hover:bg-gray-50 ${sortBy === option ? 'text-[#f6c947]' : 'text-gray-500'}`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* PRODUCT GRID */}
                {loading ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <ProductSkeleton key={i} view="grid" />)}
                    </div>
                ) : products.length === 0 ? (
                    <div className="py-32 text-center flex flex-col items-center">
                        <Box size={60} className="text-gray-200 mb-6" />
                        <h3 className="text-2xl font-black text-[#243e6b] mb-2 uppercase">No products found</h3>
                        <p className="text-gray-400 text-sm">We couldn&apos;t find any products in this collection.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
                        {products.map((p) => (
                            <ProductCard
                                key={p.id}
                                product={p}
                                view="grid"
                                onQuickView={setQuickView}
                                onCartOpen={() => setCartOpen(true)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* MODALS */}
            {quickView && (
                <QuickViewModal
                    product={quickView}
                    onClose={() => setQuickView(null)}
                    onAddToCart={() => setCartOpen(true)}
                />
            )}
            <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
        </div>
    )
}

export default Collections