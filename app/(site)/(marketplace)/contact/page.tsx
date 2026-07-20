'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Send, HelpCircle } from 'lucide-react';
import { toast } from 'react-toastify';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      toast.success('Thank you! Your message has been sent to F&K Support.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSubmitting(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 font-sans">
      <div className="container mx-auto px-4 max-w-5xl">
        
        {/* HEADER */}
        <div className="text-center mb-10">
          <span className="text-[#f6c947] text-xs font-bold uppercase tracking-[0.4em] mb-2 block">Customer Support</span>
          <h1 className="text-3xl md:text-4xl font-black text-[#222222] uppercase tracking-tight">Contact Us & Help Center</h1>
          <p className="text-xs text-gray-500 max-w-lg mx-auto mt-2 font-medium">
            Have questions about your order, seller onboarding, or platform support? Send us a message and our team will get back to you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* INFO SIDEBAR */}
          <div className="md:col-span-4 bg-[#222222] text-white p-8 rounded-none flex flex-col justify-between space-y-8">
            <div>
              <h2 className="text-lg font-black uppercase tracking-wider mb-6 text-[#f6c947]">F&K Hub</h2>
              
              <div className="space-y-6 text-xs">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-[#f6c947] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold uppercase tracking-wider">Address</h4>
                    <p className="text-gray-400 mt-0.5">Fashion District, Victoria Island, Lagos, Nigeria</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone size={18} className="text-[#f6c947] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold uppercase tracking-wider">Phone</h4>
                    <p className="text-gray-400 mt-0.5">+234 (0) 800 357 8673</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail size={18} className="text-[#f6c947] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold uppercase tracking-wider">Email</h4>
                    <p className="text-gray-400 mt-0.5">support@fkstores.com</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-800 text-[11px] text-gray-400 font-bold uppercase tracking-widest">
              Available 24/7 Monday - Saturday
            </div>
          </div>

          {/* CONTACT FORM */}
          <div className="md:col-span-8 bg-white border border-gray-200 p-8 rounded-none">
            <h2 className="text-lg font-black uppercase tracking-wider text-[#222222] mb-6">Send A Message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full border border-gray-300 rounded-none p-3 text-xs outline-none focus:border-[#222222] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter your email"
                    className="w-full border border-gray-300 rounded-none p-3 text-xs outline-none focus:border-[#222222] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Order Inquiry / Support Request"
                  className="w-full border border-gray-300 rounded-none p-3 text-xs outline-none focus:border-[#222222] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">Message *</label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe your request or question in detail..."
                  className="w-full border border-gray-300 rounded-none p-3 text-xs outline-none focus:border-[#222222] transition-colors h-32 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="bg-[#222222] hover:bg-[#f6c947] hover:text-[#222222] text-white px-8 py-3.5 text-xs font-black uppercase tracking-[0.2em] transition-colors rounded-none flex items-center gap-2"
              >
                <Send size={14} /> {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
