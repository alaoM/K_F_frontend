'use client';

import React from 'react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white py-12 font-sans">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <span className="text-[#f6c947] text-xs font-bold uppercase tracking-[0.4em] mb-2 block">Terms of Service</span>
          <h1 className="text-3xl font-black text-[#222222] uppercase tracking-tight">Terms & Conditions</h1>
        </div>

        <div className="border border-gray-200 p-8 space-y-6 rounded-none bg-gray-50 text-xs text-gray-700 leading-relaxed font-medium">
          <h2 className="text-sm font-bold uppercase text-[#222222]">1. Acceptance of Terms</h2>
          <p>By accessing F&K Fashion Hub, users and sellers agree to follow platform policies, marketplace guidelines, and honest transaction terms.</p>

          <h2 className="text-sm font-bold uppercase text-[#222222]">2. Seller Responsibilities</h2>
          <p>Sellers must provide accurate product specifications, fulfill orders within designated dispatch times, and adhere to buyer protection standards.</p>

          <h2 className="text-sm font-bold uppercase text-[#222222]">3. Refunds & Disputes</h2>
          <p>Disputes regarding unfulfilled or misdescribed items can be submitted directly through the platform user account panel.</p>
        </div>
      </div>
    </div>
  );
}
