'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';

const BRANDS = [
  { name: 'Urban Vogue', logo: '/logo.png', banner: '/slides/slider1.jpg', tags: ['Modern', 'Chic'] },
  { name: 'Elite Accents', logo: '/logo.png', banner: '/slides/slider2.jpg', tags: ['Luxury', 'Elite'] },
  { name: 'Classic Couture', logo: '/logo.png', banner: '/slides/slider3.jpg', tags: ['Timeless', 'Art'] },
];

const FeaturedBrands = () => {
  return (
    <div className="py-20">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h2 className="text-3xl font-black text-[#243e6b] tracking-tight">The <span className="text-blue-600">Digital Mall</span></h2>
          <p className="text-gray-400 font-medium">Explore premium storefronts from our top creators</p>
        </div>
        <Link href="/shops" className="flex items-center gap-2 px-6 py-3 bg-[#243e6b] text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-all shadow-xl shadow-blue-900/20">
          Visit all brands
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {BRANDS.map((brand, i) => (
          <div key={i} className="group relative h-[450px] rounded-[3rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-700">
            <Image src={brand.banner} alt={brand.name} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#243e6b]/90 via-black/20 to-transparent" />
            
            <div className="absolute inset-x-8 bottom-8 space-y-4">
              <div className="w-16 h-16 relative rounded-2xl bg-white p-2 shadow-xl border border-white/20">
                <Image src={brand.logo} alt="logo" fill className="object-contain p-2" />
              </div>
              <div className="flex items-center gap-2">
                 <h3 className="text-2xl font-black text-white">{brand.name}</h3>
                 <ShieldCheck size={18} className="text-[#f6c947]" />
              </div>
              <div className="flex gap-2">
                {brand.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-black rounded-full uppercase tracking-widest border border-white/10">
                    {tag}
                  </span>
                ))}
              </div>
              <button className="w-full h-14 bg-white text-[#243e6b] font-black rounded-2xl hover:bg-[#f6c947] transition-all transform group-hover:translate-y-0 translate-y-4 opacity-0 group-hover:opacity-100 duration-500">
                 Visit Storefront
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedBrands;
