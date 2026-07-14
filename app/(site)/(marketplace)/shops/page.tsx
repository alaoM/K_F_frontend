'use client';

export const dynamic = 'force-dynamic'

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Store, Star, MapPin, ArrowRight, ShieldCheck, Search } from 'lucide-react';
import { useApi } from '@/hooks/useApi';

interface Shop {
  id: string;
  businessName: string;
  bio: string;
  logo: string;
  banner: string;
  businessCity: string;
  businessState: string;
  rating: number;
  isVerified: boolean;
  storeSlug: string;
}

const ShopsPage = () => {
  const fetcher = useApi();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const res = await fetcher('/api/sellers');
        // The API returns { data: Shop[], meta: ... }
        setShops(res.data || []);
      } catch (err) {
        console.error('Failed to load shops', err);
      } finally {
        setLoading(false);
      }
    };
    fetchShops();
  }, [fetcher]);

  const filteredShops = shops.filter(shop => 
    shop.businessName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* HERO SECTION */}
      <div className="bg-[#243e6b] py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
          Explore Our <span className="text-[#f6c947]">Global Brands</span>
        </h1>
        <p className="text-blue-100 text-lg max-w-2xl mx-auto opacity-80">
          Discover unique digital storefronts and premium collections from verified sellers across the F&K network.
        </p>

        {/* SEARCH BAR */}
        <div className="mt-10 max-w-xl mx-auto relative">
          <input 
            type="text" 
            placeholder="Search brands by name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-14 pl-12 pr-6 rounded-2xl bg-white shadow-2xl outline-none text-gray-800"
          />
          <Search className="absolute left-4 top-4.5 text-gray-400" size={20} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-80 bg-gray-100 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : filteredShops.length === 0 ? (
          <div className="text-center py-20">
            <Store size={60} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-800">No brands found</h3>
            <p className="text-gray-500">Try adjusting your search or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredShops.map((shop) => (
              <Link 
                key={shop.id} 
                href={`/store/${shop.id}`}
                className="group bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col"
              >
                {/* BANNER */}
                <div className="relative h-40 w-full overflow-hidden">
                  <Image 
                    src={shop.banner || '/breadcrumb/breadcrumb.jpg'} 
                    alt="banner" 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  
                  {shop.isVerified && (
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2 rounded-full shadow-lg">
                      <ShieldCheck size={18} className="text-blue-600" />
                    </div>
                  )}
                </div>

                {/* INFO */}
                <div className="p-8 pt-0 -mt-10 relative flex-1 flex flex-col">
                  <div className="w-20 h-20 relative rounded-3xl border-4 border-white bg-white shadow-xl overflow-hidden mb-4 self-center md:self-start">
                    <Image 
                      src={shop.logo || '/default-logo.png'} 
                      alt={shop.businessName} 
                      fill 
                      className="object-cover" 
                    />
                  </div>

                  <div className="text-center md:text-left mb-6">
                    <h3 className="text-xl font-black text-[#243e6b] group-hover:text-blue-600 transition-colors">
                      {shop.businessName}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mt-2 leading-relaxed">
                      {shop.bio || 'Exquisite collections crafted for excellence. Join our journey as we redefine style and quality.'}
                    </p>
                  </div>

                  <div className="mt-auto space-y-4 pt-4 border-t border-gray-50">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
                      <div className="flex items-center gap-1">
                        <MapPin size={14} />
                        {shop.businessCity || 'Global'}
                      </div>
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star size={14} fill="currentColor" />
                        {shop.rating || '5.0'}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black text-blue-600 px-3 py-1 bg-blue-50 rounded-full uppercase tracking-widest">
                         Active Brand
                       </span>
                       <div className="p-3 rounded-full bg-gray-50 group-hover:bg-[#243e6b] group-hover:text-white transition-all transform group-hover:translate-x-1">
                        <ArrowRight size={18} />
                       </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* BECOME A SELLER CTA */}
      <div className="bg-white border-t border-gray-100 py-20 px-4 text-center mt-20">
        <div className="max-w-4xl mx-auto p-12 rounded-[3rem] bg-gradient-to-br from-[#243e6b] to-[#1a2b4a] shadow-2xl shadow-blue-900/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="relative z-10">
            <h2 className="text-3xl font-black text-white mb-4">Want to launch your own brand?</h2>
            <p className="text-blue-100 mb-8 opacity-80">
              Join thousands of successful sellers and reach millions of customers worldwide. 
              Setup your shop in minutes.
            </p>
            <Link 
              href="/signup?intent=seller"
              className="inline-flex items-center gap-3 px-10 py-4 bg-[#f6c947] text-[#243e6b] font-black rounded-2xl hover:scale-105 transition-all shadow-xl shadow-yellow-500/20"
            >
              Get Started Now
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopsPage;
