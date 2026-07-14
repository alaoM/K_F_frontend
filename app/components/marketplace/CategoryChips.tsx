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
        if (json.success) {
          // Take top 3 for the banners
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
    '/img/cat/home10-cat1.jpg',
    '/img/cat/home10-cat2.jpg',
    '/img/cat/home10-cat3.jpg'
  ];

  if (loading) return (
    <div className="container mx-auto px-4 py-24">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="aspect-[4/5] bg-gray-100 animate-pulse rounded-xl" />
        ))}
      </div>
    </div>
  );

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-16">
          <span className="text-[#f6c947] text-xs font-bold uppercase tracking-[0.4em] mb-4 block">Collection</span>
          <h2 className="text-4xl font-black text-[#222222] uppercase tracking-tight">Our categories</h2>
        </div>

        {/* Banner Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((cat, i) => {
            const titleParts = cat.name.split(' ');
            return (
              <div key={cat.id} className="group relative overflow-hidden bg-[#f5f5f5] aspect-[4/5]">
                <Image
                  src={cat.image || fallbackImages[i % 3]}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-500" />

                <Link href={`/collections?category=${cat.slug}`} className="absolute inset-0 z-10">
                  <div className="absolute top-10 left-10">
                    <h3 className="text-3xl font-black text-[#222222] uppercase leading-[0.9] tracking-tighter">
                      {titleParts.map((line: string, idx: number) => (
                        <span key={idx} className="block">{line}</span>
                      ))}
                    </h3>
                  </div>

                  <div className="absolute bottom-10 left-10">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#222222] bg-white px-4 py-2 rounded-full">
                      Explore {cat.name}
                    </span>
                  </div>

                  <div className="absolute bottom-8 right-8 w-12 h-12 bg-[#222222] rounded-full flex items-center justify-center text-white transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <ArrowRight size={24} />
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryBanners;
