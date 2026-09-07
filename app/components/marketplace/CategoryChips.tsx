'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface CategoryBannersProps {
  categories?: any[];
}

const fallbackImages = [
  '/slides/slider1.jpg',
  '/slides/slider2.jpg',
  '/slides/slider3.jpg',
  '/breadcrumb/breadcrumb.jpg',
];

const CategoryBanners = ({ categories = [] }: CategoryBannersProps) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Prefer root/parent categories if nested hierarchy exists
  const topCategories = React.useMemo(() => {
    if (!categories || categories.length === 0) return [];
    const rootCats = categories.filter((c) => !c.parentId && !c.parent);
    return rootCats.length > 0 ? rootCats : categories;
  }, [categories]);

  if (!categories || categories.length === 0) {
    return null;
  }

  if (topCategories.length === 0) {
    return null;
  }

  if (!mounted) {
    return (
      <section className="py-12 bg-white select-none">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 border-b border-gray-100 pb-4">
            <div>
              <span className="text-[#f6c947] text-[10px] font-bold uppercase tracking-[0.4em] mb-1 block">
                Explore Collections
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-[#222222] uppercase tracking-tight">
                Shop By Category
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-4">
            {topCategories.slice(0, 4).map((cat, i) => (
              <div key={cat.id || i} className="aspect-square bg-gray-100 rounded-none border border-gray-200 relative overflow-hidden" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-white select-none">
      <div className="container mx-auto px-4">
        {/* Header with Title and Slider Navigation Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 border-b border-gray-100 pb-4">
          <div>
            <span className="text-[#f6c947] text-[10px] font-bold uppercase tracking-[0.4em] mb-1 block">
              Explore Collections
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-[#222222] uppercase tracking-tight">
              Shop By Category
            </h2>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-2">
            <button
              id="cat-swiper-prev"
              className="w-10 h-10 border border-gray-300 hover:border-[#111111] bg-white hover:bg-[#111111] text-[#111111] hover:text-white transition-colors flex items-center justify-center rounded-none shadow-sm cursor-pointer active:scale-95"
              aria-label="Previous Category"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              id="cat-swiper-next"
              className="w-10 h-10 border border-gray-300 hover:border-[#111111] bg-white hover:bg-[#111111] text-[#111111] hover:text-white transition-colors flex items-center justify-center rounded-none shadow-sm cursor-pointer active:scale-95"
              aria-label="Next Category"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Carousel / Slider */}
        <div className="category-swiper-wrapper">
          <Swiper
            modules={[Navigation, Autoplay, Pagination]}
            navigation={{
              prevEl: '#cat-swiper-prev',
              nextEl: '#cat-swiper-next',
            }}
            autoplay={{
              delay: 3500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            loop={topCategories.length > 4}
            breakpoints={{
              320: {
                slidesPerView: 1.4,
                spaceBetween: 14,
              },
              480: {
                slidesPerView: 2.2,
                spaceBetween: 16,
              },
              768: {
                slidesPerView: 3.2,
                spaceBetween: 20,
              },
              1024: {
                slidesPerView: 4,
                spaceBetween: 24,
              },
            }}
            className="w-full pb-4"
          >
            {topCategories.map((cat, i) => (
              <SwiperSlide key={cat.id || i}>
                <div className="group relative aspect-square overflow-hidden bg-[#111111] rounded-none border border-gray-200 transition-all duration-300 hover:shadow-xl hover:border-[#111111]">
                  {/* Category Image */}
                  <Image
                    src={cat.image || fallbackImages[i % fallbackImages.length]}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 640px) 70vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover brightness-[0.75] transition-transform duration-700 group-hover:scale-105 group-hover:brightness-[0.85]"
                  />

                  {/* High-Contrast Gradient Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20 pointer-events-none" />

                  {/* Interactive Card Content */}
                  <Link
                    href={`/collections?category=${encodeURIComponent(cat.name)}`}
                    className="absolute inset-0 z-10 p-5 md:p-6 flex flex-col justify-between"
                  >
                    {/* Top Badge */}
                    <div className="flex items-center justify-between">
                      <span className="inline-block bg-[#f6c947] text-[#111111] text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 shadow-sm">
                        Category
                      </span>
                    </div>

                    {/* Bottom Details with High Visibility */}
                    <div className="space-y-3">
                      <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight drop-shadow-md group-hover:text-[#f6c947] transition-colors line-clamp-2">
                        {cat.name}
                      </h3>

                      <div className="flex items-center justify-between pt-3 border-t border-white/25">
                        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-gray-200 group-hover:text-white transition-colors">
                          Explore Now
                        </span>
                        <div className="w-8 h-8 bg-[#f6c947] text-[#111111] rounded-none flex items-center justify-center transform group-hover:translate-x-1.5 transition-transform shrink-0 shadow-sm">
                          <ArrowRight size={15} />
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default CategoryBanners;
