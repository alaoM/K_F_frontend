'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const SLIDES = [
  {
    image: '/slides/slider1.jpg',
    subtitle: 'SUMMER COLLECTION 2026',
    title: 'NEW LOOKBOOK',
    desc: 'Up to 50% Off Selected Items',
    cta: 'SHOP NOW'
  },
  {
    image: '/slides/slider2.jpg',
    subtitle: 'TRENDING NOW',
    title: 'STREET WEAR',
    desc: 'The latest urban fashion trends',
    cta: 'DISCOVER'
  }
];

const HeroSection = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-[50vh] min-h-[320px] max-h-[480px] overflow-hidden bg-[#f5f5f5]">
      {SLIDES.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === current ? 'opacity-100' : 'opacity-0'
            }`}
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            className="object-cover"
            priority={index === 0}
          />
          <div className="absolute inset-0 flex items-center px-6 md:px-16 lg:px-32 bg-black/10">
            <div className={`max-w-xl space-y-3 md:space-y-4 transform transition-all duration-700 delay-300 ${index === current ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
              }`}>
              <span className="text-[#f6c947] font-bold text-xs md:text-sm tracking-[0.3em] uppercase block">
                {slide.subtitle}
              </span>
              <h1 className="text-3xl md:text-5xl font-bold text-[#222222] leading-none tracking-tighter uppercase drop-shadow-sm">
                {slide.title}
              </h1>
              <p className="text-gray-600 text-xs md:text-base font-medium tracking-wide">
                {slide.desc}
              </p>
              <div className="pt-2">
                <Link
                  href="/collections"
                  className="mitho-btn inline-block text-xs py-3 px-8"
                >
                  {slide.cta}
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* DOTS */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-3">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all ${i === current ? 'w-8 bg-[#222222]' : 'w-2 bg-[#cccccc]'
              }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSection;
