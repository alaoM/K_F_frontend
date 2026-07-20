'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const CategoryBanners = () => {
  const [categories, setCategories] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setCategories(json.data.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to fetch categories', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const fallbackImages = [
    '/slides/slider1.jpg',
    '/slides/slider2.jpg',
    '/breadcrumb/breadcrumb.jpg'
  ];

  if (loading) return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-40 bg-gray-100 animate-pulse rounded-none" />
        ))}
      </div>
    </div>
  );

  return (
    <section className="py-10 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-8">
          <span className="text-[#f6c947] text-[10px] font-bold uppercase tracking-[0.4em] mb-2 block">Categories</span>
          <h2 className="text-2xl md:text-3xl font-black text-[#222222] uppercase tracking-tight">Shop By Category</h2>
        </div>

        {/* Banner Grid - Compact height with sharp rectangular edges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((cat, i) => (
            <div key={cat.id || i} className="group relative overflow-hidden bg-[#111111] h-44 md:h-48 rounded-none border border-gray-200">
              <Image
                src={cat.image || fallbackImages[i % 3]}
                alt={cat.name}
                fill
                className="object-cover opacity-75 transition-transform duration-700 group-hover:scale-105 group-hover:opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              <Link href={`/collections?category=${encodeURIComponent(cat.name)}`} className="absolute inset-0 z-10 p-6 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#f6c947] block mb-1">
                    Featured Category
                  </span>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight group-hover:text-[#f6c947] transition-colors">
                    {cat.name}
                  </h3>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/20">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                    Explore Now
                  </span>
                  <div className="w-8 h-8 bg-[#f6c947] text-[#222222] rounded-none flex items-center justify-center transform group-hover:translate-x-1 transition-transform">
                    <ArrowRight size={16} />
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryBanners;
