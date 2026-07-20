"use client"
import { Box, ChevronDown, List, Table, Search, X } from 'lucide-react'
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
    const urlSearchQuery = searchParams.get('search') || ''
    
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filterToggle, setFilterToggle] = useState(false)
    const [sortBy, setSortBy] = useState('Best Selling')
    const [quickView, setQuickView] = useState<any>(null)
    const [cartOpen, setCartOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState(urlSearchQuery)
    const [activeSearch, setActiveSearch] = useState(urlSearchQuery)

    useEffect(() => {
        setSearchTerm(urlSearchQuery)
        setActiveSearch(urlSearchQuery)
    }, [urlSearchQuery])

    const fetchProducts = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (categoryQuery) params.append('category', categoryQuery)
            if (activeSearch.trim()) params.append('search', activeSearch.trim())
            
            const res = await fetch(`/api/marketplace?${params.toString()}`)
            const data = await res.json()
            setProducts(Array.isArray(data) ? data : data.products || [])
        } catch (err) {
            console.error(err)
            setProducts([])
        } finally {
            setLoading(false)
        }
    }, [categoryQuery, activeSearch])

    useEffect(() => {
        fetchProducts()
    }, [fetchProducts])

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setActiveSearch(searchTerm)
    }

    const handleClearSearch = () => {
        setSearchTerm('')
        setActiveSearch('')
    }

    return (
        <div className='px-4 sm:px-6 lg:px-8 py-6 sm:py-8 font-sans'>
            <div className='space-y-6 pb-20'>
                {/* BREADCRUMB / HERO - Sharp Rectangular Edges */}
                <div className='w-full h-48 md:h-56 relative rounded-none border border-gray-200 overflow-hidden group'>
                    <Image 
                        src={products[0]?.primaryImage || "/breadcrumb/breadcrumb.jpg"} 
                        alt="collection" 
                        fill 
                        className='object-cover transition-transform duration-1000 group-hover:scale-105' 
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col items-center justify-center text-center p-6'>
                        <h1 className='text-2xl md:text-4xl text-[#f6c947] font-black uppercase tracking-tighter mb-2 drop-shadow-md'>
                            {categoryQuery ? `${categoryQuery} Collection` : activeSearch ? `Search: "${activeSearch}"` : 'All Categories'}
                        </h1>
                        <div className='flex items-center gap-3 text-white text-[10px] font-black uppercase tracking-[0.3em] bg-black/50 px-4 py-2 rounded-none'>
                            <Link href="/" className="hover:text-[#f6c947] transition-colors">Home</Link>
                            <span className="opacity-40">/</span>
                            <span className='text-[#f6c947]'>Categories</span>
                        </div>
                    </div>
                </div>

                {/* FILTER & SEARCH BAR - Sharp Rectangular Edges */}
                <div className='flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-200 pb-6'>
                    {/* SEARCH INPUT BOX */}
                    <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md w-full">
                        <Search className="absolute left-3.5 top-3 text-gray-400" size={16} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search products by title or description..."
                            className="w-full pl-10 pr-24 py-2 bg-gray-50 border border-gray-300 rounded-none text-xs font-medium focus:bg-white focus:border-[#222222] outline-none transition-all"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                className="absolute right-20 top-2.5 text-gray-400 hover:text-gray-600"
                            >
                                <X size={14} />
                            </button>
                        )}
                        <button
                            type="submit"
                            className="absolute right-1 top-1 bg-[#222222] hover:bg-[#f6c947] hover:text-[#222222] text-white px-4 py-1.5 rounded-none text-[10px] font-bold uppercase tracking-wider transition-colors"
                        >
                            Search
                        </button>
                    </form>

                    <div className='flex items-center gap-6 w-full md:w-auto justify-between md:justify-end'>
                        <p className='text-xs font-bold text-gray-400 uppercase tracking-widest'>
                            Showing <span className='text-[#222222]'>{products.length}</span> items
                        </p>

                        <div className='relative'>
                            <button 
                                onClick={() => setFilterToggle(!filterToggle)}
                                className='flex items-center gap-3 px-4 py-2 border border-gray-300 rounded-none text-xs font-bold uppercase tracking-wider hover:border-[#222222] transition-all bg-white'
                            >
                                Sort by: <span className='text-gray-500'>{sortBy}</span>
                                <ChevronDown size={14} className={`transition-transform ${filterToggle ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {filterToggle && (
                                <div className='absolute top-full right-0 mt-1 w-52 shadow-xl bg-white rounded-none z-[60] border border-gray-200 py-1'>
                                    {['Featured', 'Best Selling', 'Price: Low to High', 'Price: High to Low', 'Alphabetically A-Z', 'Alphabetically Z-A'].map((option) => (
                                        <button 
                                            key={option}
                                            onClick={() => {
                                                setSortBy(option);
                                                setFilterToggle(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors hover:bg-[#222222] hover:text-white ${sortBy === option ? 'text-[#f6c947]' : 'text-gray-600'}`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* PRODUCT GRID (Compact 5-column layout, sharp edges) */}
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => <ProductSkeleton key={i} view="grid" />)}
                    </div>
                ) : products.length === 0 ? (
                    <div className="py-20 text-center flex flex-col items-center">
                        <Box size={40} className="text-gray-300 mb-3" />
                        <h3 className="text-lg font-black text-[#222222] mb-1 uppercase">No products found</h3>
                        <p className="text-gray-400 text-xs font-medium">We couldn&apos;t find any products matching your criteria.</p>
                        {activeSearch && (
                            <button
                                onClick={handleClearSearch}
                                className="mt-3 text-xs font-bold text-[#f6c947] uppercase tracking-wider hover:underline"
                            >
                                Clear search query
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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