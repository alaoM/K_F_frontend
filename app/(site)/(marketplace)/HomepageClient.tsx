'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { LayoutGrid, LayoutList, Truck, RefreshCw, Headphones, ShieldCheck } from 'lucide-react'
import { useCartStore } from '@/store/useCartStore'
import QuickViewModal from '@/app/components/marketplace/QuickViewModal'
import CartDrawer from '@/app/components/marketplace/CartDrawer'
import { ProductSkeleton } from '@/app/components/Loaders'
import HeroSection from '@/app/components/marketplace/HeroSection'
import CategoryBanners from '@/app/components/marketplace/CategoryChips'
import ProductCard from '@/app/components/marketplace/ProductCard'
import OfferMarquee from '@/app/components/marketplace/OfferMarquee'
import Image from 'next/image'
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
            params.append('limit', '8')
            if (activeTab !== 'All') {
                params.append('category', activeTab.toLowerCase())
            }

            const res = await fetch(`/api/marketplace?${params.toString()}`)
            const data = await res.json()
            setProducts(Array.isArray(data) ? data : data.products || [])
        } catch (err) {
            setProducts([])
        } finally {
            setLoading(false)
        }
    }, [activeTab])

    useEffect(() => {
        fetchCategories()
    }, [fetchCategories])

    useEffect(() => {
        fetchProducts()
    }, [fetchProducts])

    return (
        <div className="bg-white min-h-screen">
            {/* 1. HERO SLIDER */}
            <HeroSection />

            {/* 2. OFFER MARQUEE */}
            <OfferMarquee />

            {/* 3. CATEGORY BANNERS */}
            <CategoryBanners />

            {/* 4. PRODUCT TAB AREA */}
            <section className="py-24 bg-[#fcfcfc]">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <span className="text-[#f6c947] text-xs font-bold uppercase tracking-[0.4em] mb-4 block">Clothes</span>
                        <h2 className="text-4xl font-black text-[#222222] uppercase tracking-tight">Fashion product</h2>
                    </div>

                    <div className="flex justify-center gap-4 md:gap-12 mb-16 overflow-x-auto pb-4">
                        {['All', ...categories.map(c => c.name)].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`whitespace-nowrap text-xs font-black uppercase tracking-[0.3em] transition-all relative pb-2 ${activeTab === tab ? 'text-[#f6c947]' : 'text-gray-400 hover:text-[#222222]'
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
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <ProductSkeleton key={i} view="grid" />)}
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
            </section>

            {/* 5. SERVICE AREA */}
            <section className="py-24 border-t border-gray-100">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                        <ServiceBlock icon={<Truck className="text-[#f6c947]" />} title="Free Shipping" desc="On all orders over $100" />
                        <ServiceBlock icon={<RefreshCw className="text-[#f6c947]" />} title="30 Days Return" desc="Money back guarantee" />
                        <ServiceBlock icon={<Headphones className="text-[#f6c947]" />} title="Online Support" desc="24/7 dedicated support" />
                        <ServiceBlock icon={<ShieldCheck className="text-[#f6c947]" />} title="Secure Payment" desc="100% secure payment" />
                    </div>
                </div>
            </section>

            {/* 6. BLOG AREA */}
            <BlogSection posts={mockBlogPosts} />

            {/* 7. INSTAGRAM FEED */}
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
        <div className="flex items-center gap-6 group cursor-default">
            <div className="w-16 h-16 rounded-full bg-[#f5f5f5] flex items-center justify-center transition-all group-hover:bg-[#222222] group-hover:text-white">
                {React.cloneElement(icon, { size: 28 } as any)}
            </div>
            <div>
                <h4 className="text-sm font-black uppercase tracking-widest text-[#222222]">{title}</h4>
                <p className="text-xs text-gray-400 mt-1 font-bold uppercase tracking-wider">{desc}</p>
            </div>
        </div>
    )
}
