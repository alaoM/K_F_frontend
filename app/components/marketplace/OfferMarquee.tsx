'use client';

import React from 'react';

const OfferMarquee = () => {
  const messages = [
    "Never out of style",
    "Let's love fashion",
    "Your favorite products made affordable for you",
    "Fashion that reflects who you are",
    "Celebrate a big savings on this sale",
    "Get the best Deal for almost everything"
  ];

  return (
    <section className="bg-white border-y border-gray-100 overflow-hidden py-4">
      <div className="flex whitespace-nowrap animate-marquee">
        {/* Repeat messages to fill the width and ensure seamless loop */}
        {[...messages, ...messages, ...messages].map((msg, i) => (
          <span 
            key={i} 
            className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#222222] px-10 border-r border-gray-100 last:border-r-0"
          >
            {msg}
          </span>
        ))}
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 40s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default OfferMarquee;
