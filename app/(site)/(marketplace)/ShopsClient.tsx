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

const ShopsClient = () => {
  const fetcher = useApi();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const res = await fetcher('/api/sellers');
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
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* HERO SECTION */}
      <div className="bg-[#222222] py-16 px-4 text-center">
        <h1 className="text-3xl md:text-5xl font-black text-white mb-3 tracking-tight uppercase">
          Explore Our <span className="text-[#f6c947]">Global Brands</span>
        </h1>
        <p className="text-gray-300 text-xs md:text-sm max-w-xl mx-auto font-medium">
          Discover unique digital storefronts and premium collections from verified sellers across the F&K network.
        </p>

        {/* SEARCH BAR - Sharp Rectangular Edges */}
        <div className="mt-8 max-w-xl mx-auto relative">
          <input
            type="text"
            placeholder="Search brands by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 pl-11 pr-4 rounded-none bg-white border border-gray-300 outline-none text-xs font-medium text-gray-800"
          />
          <Search className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-72 bg-gray-200 rounded-none animate-pulse" />
            ))}
          </div>
        ) : filteredShops.length === 0 ? (
          <div className="text-center py-16">
            <Store size={50} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-black text-gray-800 uppercase">No brands found</h3>
            <p className="text-xs text-gray-500 mt-1">Try adjusting your search or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShops.map((shop) => (
              <Link
                key={shop.id}
                href={`/store/${shop.id}`}
                className="group bg-white rounded-none overflow-hidden border border-gray-200 hover:border-[#222222] transition-all duration-300 flex flex-col"
              >
                {/* BANNER */}
                <div className="relative h-36 w-full overflow-hidden bg-gray-100">
                  <Image
                    src={shop.banner || '/breadcrumb/breadcrumb.jpg'}
                    alt="banner"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20" />

                  {shop.isVerified && (
                    <div className="absolute top-3 right-3 bg-[#222222] text-[#f6c947] p-1.5 rounded-none">
                      <ShieldCheck size={16} />
                    </div>
                  )}
                </div>

                {/* INFO */}
                <div className="p-6 pt-0 -mt-8 relative flex-1 flex flex-col">
                  <div className="w-16 h-16 relative rounded-none border-2 border-white bg-white shadow-md overflow-hidden mb-3 self-start">
                    <Image
                      src={shop.logo || '/default-logo.png'}
                      alt={shop.businessName}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="text-left mb-4">
                    <h3 className="text-base font-black text-[#222222] uppercase tracking-wide group-hover:text-[#f6c947] transition-colors">
                      {shop.businessName}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                      {shop.bio || 'Exquisite fashion collections crafted for excellence.'}
                    </p>
                  </div>

                  <div className="mt-auto space-y-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-gray-400">
                      <div className="flex items-center gap-1">
                        <MapPin size={13} />
                        {shop.businessCity || 'Global'}
                      </div>
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star size={13} fill="currentColor" />
                        {shop.rating || '5.0'}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[9px] font-black text-[#222222] px-2.5 py-1 bg-gray-100 uppercase tracking-widest rounded-none">
                        Active Brand
                      </span>
                      <div className="p-2 rounded-none bg-gray-100 group-hover:bg-[#222222] group-hover:text-white transition-colors">
                        <ArrowRight size={16} />
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
      <div className="bg-white border-t border-gray-200 py-16 px-4 text-center mt-12">
        <div className="max-w-3xl mx-auto p-10 bg-[#222222] text-white rounded-none shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-black mb-3 uppercase tracking-tight">Want to launch your own brand?</h2>
            <p className="text-gray-300 text-xs md:text-sm mb-6 max-w-lg mx-auto">
              Join top sellers and reach fashion enthusiasts across the network.
            </p>
            <Link
              href="/signup?intent=seller"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#f6c947] text-[#222222] font-black text-xs uppercase tracking-widest hover:bg-yellow-400 transition-colors rounded-none"
            >
              Get Started Now
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopsClient;
