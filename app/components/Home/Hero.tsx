"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import Image from "next/image";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

// 1. Define Props Interface for TS
interface HeroSlideProps {
  title1: string;
  title2: string;
  subtitle: string;
  image: string;
}

export default function HeroSlider() {
  const slides: HeroSlideProps[] = [
    {
      title1: "KID'S",
      title2: "FASHION",
      subtitle: "Up to 30% off",
      image: "/slides/slider1.jpg",
    },
    {
      title1: "MEN'S",
      title2: "STYLE",
      subtitle: "Up to 40% off",
      image: "/slides/slider2.jpg",
    },
    {
      title1: "WOMEN'S",
      title2: "WEAR",
      subtitle: "New Arrivals",
      image: "/slides/slider3.jpg",
    },
  ];

  return (
    <section className="relative w-full h-[520px] lg:h-[650px] overflow-hidden group">
      <Swiper
        modules={[Navigation, Autoplay]}
        slidesPerView={1}
        navigation={{
          nextEl: ".hero-next",
          prevEl: ".hero-prev",
        }}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        loop
        className="w-full h-full"
      >
        {slides.map((slide, index) => (
          // 2. SwiperSlide MUST be a direct child of Swiper
          <SwiperSlide key={index}>
            <HeroSlide {...slide} />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* 3. Move Navigation buttons here (outside Swiper but inside section) */}
      {/* This ensures only ONE set of buttons exists for the slider */}
      <div className="absolute -left-6 lg:left-[calc(50%-700px)] bottom-20 z-10">
        <div className="flex items-center gap-4">
          <button className="hero-prev text-3xl text-white hover:text-[#f5c042] transition">
            ←
          </button>
          <span className="text-2xl text-white/50">|</span>
          <button className="hero-next text-3xl text-white hover:text-[#f5c042] transition">
            →
          </button>
        </div>
      </div>
    </section>
  );
}

// 4. HeroSlide logic now focused only on content
function HeroSlide({ title1, title2, subtitle, image }: HeroSlideProps) {
  return (
    <div className="relative w-full h-full">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          fill
          src={image}
          alt={`${title1} ${title2}`}
          className="object-cover"
          priority
        />
      </div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto h-full flex items-center px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 w-full gap-12">
          <div className="flex flex-col justify-center text-white relative">
            {/* Vertical badge */}
            <div
              className="absolute -left-12 lg:-left-24 top-1/2 -translate-y-1/2 text-sm bg-[#f5c042] text-black px-4 py-1 whitespace-nowrap"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
              {subtitle}
            </div>

            <h1 className="text-[60px] lg:text-[96px] font-serif leading-tight">
              <span className="block">{title1}</span>
              <span className="block">{title2}</span>
            </h1>

            <button className="mt-10 border border-[#f5c042] text-[#f5c042] px-10 py-3 w-fit hover:bg-[#f5c042] hover:text-black transition font-semibold">
              SHOP NOW
            </button>
          </div>
          <div />
        </div>
      </div>
    </div>
  );
}