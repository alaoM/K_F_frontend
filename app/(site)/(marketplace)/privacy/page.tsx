'use client';

import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white py-12 font-sans">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <span className="text-[#f6c947] text-xs font-bold uppercase tracking-[0.4em] mb-2 block">Legal Policy</span>
          <h1 className="text-3xl font-black text-[#222222] uppercase tracking-tight">Privacy Policy</h1>
        </div>

        <div className="border border-gray-200 p-8 space-y-6 rounded-none bg-gray-50 text-xs text-gray-700 leading-relaxed font-medium">
          <h2 className="text-sm font-bold uppercase text-[#222222]">1. Information We Collect</h2>
          <p>F&K Fashion Hub collects basic account information such as name, email address, phone number, and delivery details necessary to process purchases and manage seller stores.</p>

          <h2 className="text-sm font-bold uppercase text-[#222222]">2. How We Use Data</h2>
          <p>Your information is used strictly to fulfill orders, facilitate customer support, prevent fraud, and provide marketplace analytics to sellers.</p>

          <h2 className="text-sm font-bold uppercase text-[#222222]">3. Data Protection</h2>
          <p>We implement strict authentication protocols and security measures to protect buyer and seller credentials.</p>
        </div>
      </div>
    </div>
  );
}
