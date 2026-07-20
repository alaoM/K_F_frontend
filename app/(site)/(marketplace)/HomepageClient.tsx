'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { LayoutGrid, LayoutList, Truck, RefreshCw, Headphones, ShieldCheck, Search, X } from 'lucide-react'
import { useCartStore } from '@/store/useCartStore'
import QuickViewModal from '@/app/components/marketplace/QuickViewModal'
import CartDrawer from '@/app/components/marketplace/CartDrawer'
import { ProductSkeleton } from '@/app/components/Loaders'
import HeroSection from '@/app/components/marketplace/HeroSection'
import CategoryBanners from '@/app/components/marketplace/CategoryChips'
import ProductCard from '@/app/components/marketplace/ProductCard'
import OfferMarquee from '@/app/components/marketplace/OfferMarquee'
import BlogSection from '@/app/components/marketplace/BlogSection'
import FollowUs from '@/app/components/marketplace/FollowUs'

interface ApiProduct {
    id: string
    title: string
    description: string
    price: number
    primaryImage: string
    otherImages?: string[]
    seller?: {
        businessName: string
    }
    views?: number
}

const mockBlogPosts = [
    {
        title: "The Future of Sustainable Fashion",
        slug: "the-future-of-sustainable-fashion",
        excerpt: "Sustainable fashion is no longer just a trend; it's a necessity. As we move further into 2026...",
        date: "May 16, 2026",
        image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000&auto=format&fit=crop"
    },
    {
        title: "Top 10 Fashion Trends for Summer",
        slug: "top-10-fashion-trends",
        excerpt: "Discover the must-have styles and colors that will dominate the fashion scene this summer...",
        date: "May 14, 2026",
        image: "https://images.unsplash.com/photo-1523381235208-2592a89034d8?w=1000&auto=format&fit=crop"
    },
    {
        title: "The Rise of Virtual Fitting Rooms",
        slug: "the-rise-of-virtual-fitting-rooms",
        excerpt: "Technology is bridging the gap between physical and digital shopping experiences through VR...",
        date: "May 10, 2026",
        image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1000&auto=format&fit=crop"
    }
]

export default function HomepageClient() {
    const [cartOpen, setCartOpen] = useState(false)
    const [quickView, setQuickView] = useState<any>(null)
    const [activeTab, setActiveTab] = useState('All')
    const [searchQuery, setSearchQuery] = useState('')
    const [appliedSearch, setAppliedSearch] = useState('')

    const [products, setProducts] = useState<ApiProduct[]>([])
    const [categories, setCategories] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchCategories = useCallback(async () => {
        try {
            const res = await fetch('/api/categories')
            const json = await res.json()
            if (json.success) {
                setCategories(json.data)
            }
        } catch (err) {
            console.error(err)
        }
    }, [])

    const fetchProducts = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            params.append('limit', '10')
            if (activeTab !== 'All') {
                params.append('category', activeTab)
            }
            if (appliedSearch.trim()) {
                params.append('search', appliedSearch.trim())
            }

            const res = await fetch(`/api/marketplace?${params.toString()}`)
            const data = await res.json()
            setProducts(Array.isArray(data) ? data : data.products || [])
        } catch (err) {
            setProducts([])
        } finally {
            setLoading(false)
        }
    }, [activeTab, appliedSearch])

    useEffect(() => {
        fetchCategories()
    }, [fetchCategories])

    useEffect(() => {
        fetchProducts()
    }, [fetchProducts])

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setAppliedSearch(searchQuery)
    }

    const handleClearSearch = () => {
        setSearchQuery('')
        setAppliedSearch('')
    }

    return (
        <div className="bg-white min-h-screen">
            {/* 1. HERO SLIDER (Half VH = 50vh, Sharp Edges) */}
            <HeroSection />

            {/* SEARCH INPUT BAR - Sharp Rectangular Edges */}
            <div className="bg-white py-5 border-b border-gray-200">
                <div className="container mx-auto px-4 max-w-3xl">
                    <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                        <Search className="absolute left-4 text-gray-400" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search products by name, description or keyword..."
                            className="w-full pl-11 pr-32 py-3 bg-gray-50 border border-gray-300 rounded-none focus:border-[#222222] focus:bg-white outline-none text-xs font-medium transition-all"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                className="absolute right-28 text-gray-400 hover:text-gray-600 p-1"
                            >
                                <X size={14} />
                            </button>
                        )}
                        <button
                            type="submit"
                            className="absolute right-1 bg-[#222222] hover:bg-[#f6c947] hover:text-[#222222] text-white px-5 py-2 text-xs font-bold uppercase tracking-wider transition-colors rounded-none"
                        >
                            Search
                        </button>
                    </form>
                </div>
            </div>

            {/* 2. OFFER MARQUEE */}
            <OfferMarquee />

            {/* 3. CATEGORY BANNERS (Reduced & Compact Height) */}
            <CategoryBanners />

            {/* 4. PRODUCT TAB AREA */}
            <section className="py-12 bg-[#fafafa] border-t border-gray-100">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-8">
                        <span className="text-[#f6c947] text-[10px] font-bold uppercase tracking-[0.4em] mb-2 block">
                            {appliedSearch ? `Search Results for "${appliedSearch}"` : 'Curated Selection'}
                        </span>
                        <h2 className="text-2xl md:text-3xl font-black text-[#222222] uppercase tracking-tight">
                            Fashion Products
                        </h2>
                    </div>

                    <div className="flex justify-center gap-3 md:gap-8 mb-8 overflow-x-auto pb-2">
                        {['All', ...categories.map(c => c.name)].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`whitespace-nowrap text-xs font-black uppercase tracking-[0.25em] transition-all relative pb-2 px-1 rounded-none ${activeTab === tab ? 'text-[#f6c947]' : 'text-gray-400 hover:text-[#222222]'
                                    }`}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#f6c947]" />
                                )}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => <ProductSkeleton key={i} view="grid" />)}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="py-16 text-center">
                            <p className="text-gray-400 text-xs font-medium">No products found. Try adjusting your search query.</p>
                            {appliedSearch && (
                                <button
                                    onClick={handleClearSearch}
                                    className="mt-3 text-xs font-bold text-[#f6c947] hover:underline uppercase tracking-wider"
                                >
                                    Clear search filter
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
            </section>

            {/* 5. SERVICE AREA */}
            <section className="py-12 border-t border-gray-200 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <ServiceBlock icon={<Truck className="text-[#f6c947]" />} title="Free Shipping" desc="On all orders over $100" />
                        <ServiceBlock icon={<RefreshCw className="text-[#f6c947]" />} title="30 Days Return" desc="Money back guarantee" />
                        <ServiceBlock icon={<Headphones className="text-[#f6c947]" />} title="Online Support" desc="24/7 dedicated support" />
                        <ServiceBlock icon={<ShieldCheck className="text-[#f6c947]" />} title="Secure Payment" desc="100% secure payment" />
                    </div>
                </div>
            </section>

            {/* 6. BLOG AREA (Reduced Size) */}
            <BlogSection posts={mockBlogPosts} />

            {/* 7. INSTAGRAM / FOLLOW US (Left as it is) */}
            <FollowUs />

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

function ServiceBlock({ icon, title, desc }: { icon: React.ReactElement; title: string; desc: string }) {
    return (
        <div className="flex items-center gap-4 group cursor-default p-4 border border-gray-100 rounded-none hover:border-[#222222] transition-colors">
            <div className="w-12 h-12 rounded-none bg-[#f5f5f5] flex items-center justify-center transition-all group-hover:bg-[#222222] group-hover:text-white shrink-0">
                {React.cloneElement(icon, { size: 22 } as any)}
            </div>
            <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-[#222222]">{title}</h4>
                <p className="text-[10px] text-gray-400 mt-0.5 font-bold uppercase tracking-wider">{desc}</p>
            </div>
        </div>
    )
}
