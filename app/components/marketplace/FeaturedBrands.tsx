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
          <h2 className="text-3xl font-black text-[#111111] tracking-tight">The <span className="text-[#f6c947]">Digital Mall</span></h2>
          <p className="text-gray-500 font-medium">Explore premium storefronts from our top creators</p>
        </div>
        <Link href="/shops" className="flex items-center gap-2 px-6 py-3 bg-[#111111] text-white text-xs font-black uppercase tracking-widest rounded-none hover:bg-[#f6c947] hover:text-[#111111] transition-all">
          Visit all brands
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {BRANDS.map((brand, i) => (
          <div key={i} className="group relative h-[450px] rounded-none overflow-hidden border border-gray-200 shadow-md hover:shadow-xl transition-all duration-700">
            <Image src={brand.banner} alt={brand.name} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            
            <div className="absolute inset-x-8 bottom-8 space-y-4">
              <div className="w-16 h-16 relative rounded-none bg-white p-2 shadow-md border border-white/20">
                <Image src={brand.logo} alt="logo" fill className="object-contain p-2" />
              </div>
              <div className="flex items-center gap-2">
                 <h3 className="text-2xl font-black text-white">{brand.name}</h3>
                 <ShieldCheck size={18} className="text-[#f6c947]" />
              </div>
              <div className="flex gap-2">
                {brand.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-black rounded-none uppercase tracking-widest border border-white/10">
                    {tag}
                  </span>
                ))}
              </div>
              <button className="w-full h-14 bg-white text-[#111111] font-black rounded-none hover:bg-[#f6c947] transition-all transform group-hover:translate-y-0 translate-y-4 opacity-0 group-hover:opacity-100 duration-500 uppercase tracking-wider text-xs">
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
