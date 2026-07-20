'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Sparkles, Store } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white py-12 font-sans">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <span className="text-[#f6c947] text-xs font-bold uppercase tracking-[0.4em] mb-2 block">Our Story</span>
          <h1 className="text-3xl md:text-5xl font-black text-[#222222] uppercase tracking-tight">About F&K Fashion Hub</h1>
        </div>

        <div className="border border-gray-200 p-8 md:p-12 space-y-6 rounded-none bg-gray-50">
          <p className="text-sm text-gray-700 leading-relaxed font-medium">
            F&K Fashion Hub is a digital marketplace bridging fashion enthusiasts with curated, independent, and verified storefronts. We empower digital creators and fashion sellers to reach global shoppers with authentic products.
          </p>
          <p className="text-sm text-gray-700 leading-relaxed font-medium">
            Built with speed, elegance, and distinct sharp-edge design aesthetics, our platform offers a seamless shopping experience for clothing, shoes, bags, and lifestyle accessories.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-200">
            <div className="p-4 bg-white border border-gray-200 rounded-none">
              <Store className="text-[#f6c947] mb-2" size={24} />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#222222]">Verified Sellers</h3>
              <p className="text-[11px] text-gray-500 mt-1">Curated boutiques & high quality fashion sellers.</p>
            </div>
            <div className="p-4 bg-white border border-gray-200 rounded-none">
              <ShieldCheck className="text-[#f6c947] mb-2" size={24} />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#222222]">Buyer Protection</h3>
              <p className="text-[11px] text-gray-500 mt-1">100% secure payments & dispute resolution.</p>
            </div>
            <div className="p-4 bg-white border border-gray-200 rounded-none">
              <Sparkles className="text-[#f6c947] mb-2" size={24} />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#222222]">Unique Aesthetics</h3>
              <p className="text-[11px] text-gray-500 mt-1">Bold sharp rectangular brand identity.</p>
            </div>
          </div>

          <div className="pt-6 text-center">
            <Link
              href="/collections"
              className="inline-flex items-center gap-2 bg-[#222222] hover:bg-[#f6c947] hover:text-[#222222] text-white px-8 py-3.5 text-xs font-black uppercase tracking-[0.2em] transition-colors rounded-none"
            >
              Explore Collections <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
