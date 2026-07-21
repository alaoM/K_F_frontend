"use client"
import { Box, ChevronDown, Filter } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useCallback, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import ProductCard from './ProductCard'
import { ProductSkeleton } from '../Loaders'
import QuickViewModal from './QuickViewModal'
import CartDrawer from './CartDrawer'

// Dynamic fallback category banner images
const CATEGORY_BANNERS: Record<string, string> = {
    clothes: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop',
    shoes: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1200&auto=format&fit=crop',
    bags: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1200&auto=format&fit=crop',
    accessories: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=1200&auto=format&fit=crop',
    electronics: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop',
    jewelry: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1200&auto=format&fit=crop',
    beauty: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1200&auto=format&fit=crop',
}

const DEFAULT_BANNER = '/breadcrumb/breadcrumb.jpg'

const Collections = () => {
    const searchParams = useSearchParams()
    const router = useRouter()
    const categoryQuery = searchParams.get('category')
    const searchParamQuery = searchParams.get('search') || ''
    
    const [products, setProducts] = useState<any[]>([])
    const [categories, setCategories] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filterToggle, setFilterToggle] = useState(false)
    const [sortBy, setSortBy] = useState('Best Selling')
    const [quickView, setQuickView] = useState<any>(null)
    const [cartOpen, setCartOpen] = useState(false)

    // Fetch categories list from API
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('/api/categories')
                const json = await res.json()
                if (json.success && Array.isArray(json.data)) {
                    setCategories(json.data)
                }
            } catch (err) {
                console.error('Failed to fetch categories', err)
            }
        }
        fetchCategories()
    }, [])

    // Fetch products based on category and search params from navbar
    const fetchProducts = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (categoryQuery) params.append('category', categoryQuery)
            if (searchParamQuery.trim()) params.append('search', searchParamQuery.trim())
            
            const res = await fetch(`/api/marketplace?${params.toString()}`)
            const data = await res.json()
            setProducts(Array.isArray(data) ? data : data.products || [])
        } catch (err) {
            console.error(err)
            setProducts([])
        } finally {
            setLoading(false)
        }
    }, [categoryQuery, searchParamQuery])

    useEffect(() => {
        fetchProducts()
    }, [fetchProducts])

    // Determine dynamic banner image based on selected category
    const getDynamicBannerImage = (): string => {
        if (!categoryQuery) return DEFAULT_BANNER
        const catKey = categoryQuery.toLowerCase()
        const matchedCategory = categories.find(
            c => c.name?.toLowerCase() === catKey || c.slug?.toLowerCase() === catKey
        )
        if (matchedCategory?.image) return matchedCategory.image
        if (CATEGORY_BANNERS[catKey]) return CATEGORY_BANNERS[catKey]
        if (products[0]?.primaryImage) return products[0].primaryImage
        return DEFAULT_BANNER
    }

    const currentBannerImage = getDynamicBannerImage()

    return (
        <div className='px-4 sm:px-6 lg:px-8 py-6 font-sans bg-white'>
            <div className='space-y-6 pb-20'>
                {/* DYNAMIC BREADCRUMB / HERO BANNER */}
                <div className='w-full h-52 md:h-64 relative rounded-none border border-gray-200 overflow-hidden group bg-black'>
                    <Image 
                        key={categoryQuery || 'all'}
                        src={currentBannerImage} 
                        alt={categoryQuery || "Fashion Collection"} 
                        fill 
                        className='object-cover opacity-60 transition-all duration-700 group-hover:scale-105 group-hover:opacity-75' 
                        priority
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col items-center justify-center text-center p-6 z-10'>
                        <span className="text-[#f6c947] text-[10px] font-black uppercase tracking-[0.4em] mb-2 block">
                            {categoryQuery ? 'Category Showcase' : searchParamQuery ? 'Search Query' : 'Curated Catalog'}
                        </span>
                        <h1 className='text-3xl md:text-5xl text-white font-black uppercase tracking-tight mb-3 drop-shadow-md'>
                            {categoryQuery ? `${categoryQuery} Collection` : searchParamQuery ? `Results for "${searchParamQuery}"` : 'All Categories'}
                        </h1>
                        <div className='flex items-center gap-3 text-white text-[10px] font-black uppercase tracking-[0.3em] bg-black/60 border border-white/20 px-4 py-1.5 rounded-none backdrop-blur-md'>
                            <Link href="/" className="hover:text-[#f6c947] transition-colors">Home</Link>
                            <span className="opacity-40">/</span>
                            <span className='text-[#f6c947]'>{categoryQuery || 'Categories'}</span>
                        </div>
                    </div>
                </div>

                {/* CATEGORIES PILLS BAR (Quick Category Switcher) */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200 scrollbar-none">
                    <button
                        onClick={() => router.push('/collections')}
                        className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-none whitespace-nowrap transition-colors border ${
                            !categoryQuery
                                ? 'bg-[#222222] text-[#f6c947] border-[#222222]'
                                : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-[#222222]'
                        }`}
                    >
                        All Categories
                    </button>
                    {categories.map((cat) => {
                        const isSelected = categoryQuery?.toLowerCase() === cat.name?.toLowerCase()
                        return (
                            <button
                                key={cat.id || cat.name}
                                onClick={() => router.push(`/collections?category=${encodeURIComponent(cat.name)}`)}
                                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-none whitespace-nowrap transition-colors border ${
                                    isSelected
                                        ? 'bg-[#222222] text-[#f6c947] border-[#222222]'
                                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-[#222222]'
                                }`}
                            >
                                {cat.name}
                            </button>
                        )
                    })}
                </div>

                {/* TOOLBAR (Results count & Sort Options) */}
                <div className='flex flex-row items-center justify-between gap-4 border-b border-gray-200 pb-4'>
                    <p className='text-xs font-bold text-gray-500 uppercase tracking-widest'>
                        Showing <span className='text-[#222222] font-black'>{products.length}</span> items
                        {searchParamQuery && <span className="ml-1 text-[#222222]">for &quot;{searchParamQuery}&quot;</span>}
                    </p>

                    <div className='relative'>
                        <button 
                            onClick={() => setFilterToggle(!filterToggle)}
                            className='flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-none text-xs font-bold uppercase tracking-wider hover:border-[#222222] transition-all bg-white'
                        >
                            <Filter size={13} />
                            <span>Sort by: <span className='text-[#222222]'>{sortBy}</span></span>
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
                                        className={`w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors hover:bg-[#222222] hover:text-white ${sortBy === option ? 'text-[#f6c947] bg-[#222222]' : 'text-gray-600'}`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* PRODUCT GRID (Compact 5-column layout, sharp edges) */}
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => <ProductSkeleton key={i} view="grid" />)}
                    </div>
                ) : products.length === 0 ? (
                    <div className="py-20 text-center flex flex-col items-center border border-gray-200 p-8 bg-gray-50 rounded-none">
                        <Box size={40} className="text-gray-400 mb-3" />
                        <h3 className="text-lg font-black text-[#222222] mb-1 uppercase">No products found</h3>
                        <p className="text-gray-500 text-xs font-medium max-w-sm mb-4">
                            We couldn&apos;t find any products in {categoryQuery ? `the "${categoryQuery}" category` : 'this collection'}.
                        </p>
                        <button
                            onClick={() => router.push('/collections')}
                            className="bg-[#222222] text-white hover:bg-[#f6c947] hover:text-[#222222] px-6 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors rounded-none"
                        >
                            View All Categories
                        </button>
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