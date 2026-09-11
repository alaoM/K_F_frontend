'use client';

import React from 'react';
import { formatCurrency } from '@/helpers/functions';
import { useCartStore } from '@/store/useCartStore';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const router = useRouter();
  const { items, updateQuantity, removeItem, getTotalPrice } = useCartStore();

  const totalItemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = getTotalPrice();
  const freeShippingThreshold = 50000;
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <>
      {/* Backdrop Fade Overlay */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-[250] transition-opacity duration-300 animate-in fade-in"
        />
      )}

      {/* Slide-in Drawer Panel from Right */}
      <div
        className={`fixed top-0 right-0 h-full w-[380px] sm:w-[420px] max-w-full bg-white z-[260] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col rounded-none select-none ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 bg-[#111111] text-white flex justify-between items-center shrink-0 border-b-2 border-white/10">
          <div className="flex items-center gap-2.5">
            <ShoppingBag size={18} className="text-[#f6c947]" />
            <h3 className="font-black text-xs uppercase tracking-widest text-white">
              Shopping Cart ({totalItemCount})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors rounded-none cursor-pointer"
            aria-label="Close cart drawer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        {items.length > 0 && (
          <div className="p-3.5 bg-gray-50 border-b border-gray-200">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider mb-1.5 text-[#111111]">
              <span>
                {subtotal >= freeShippingThreshold ? (
                  <span className="text-emerald-700 font-bold">🎉 You qualify for Free Delivery!</span>
                ) : (
                  <span>Add <strong>{formatCurrency(freeShippingThreshold - subtotal)}</strong> for Free Delivery</span>
                )}
              </span>
              <span>{freeShippingProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 rounded-none overflow-hidden">
              <div
                className="h-full bg-[#f6c947] transition-all duration-300"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Drawer Body / Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4 text-center py-12">
              <div className="w-16 h-16 bg-gray-100 border border-gray-200 flex items-center justify-center rounded-none text-2xl">
                🛍️
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black uppercase tracking-wider text-[#111111]">Your cart is currently empty</p>
                <p className="text-[11px] text-gray-400">Discover premium fashion items and verified merchant collections</p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  router.push('/collections');
                }}
                className="text-xs font-black uppercase tracking-wider text-[#111111] bg-[#f6c947] border border-[#f6c947] px-6 py-2.5 hover:bg-[#111111] hover:text-[#f6c947] hover:border-[#111111] transition-all rounded-none cursor-pointer mt-2"
              >
                Explore Marketplace
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {items.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 space-y-3">
                  <div className="flex gap-3.5">
                    {/* Item Thumbnail */}
                    <div className="relative w-20 h-24 border border-gray-200 shrink-0 rounded-none overflow-hidden bg-gray-100">
                      <Image
                        src={item.primaryImage || '/placeholder.png'}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Item Information */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="font-black text-xs text-[#111111] uppercase tracking-tight line-clamp-2">
                        {item.title}
                      </h4>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Unit Price: {formatCurrency(item.price)}
                      </p>
                      <p className="text-xs font-black text-[#111111] pt-1">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>

                  {/* Quantity Increment Controls & Remove Action */}
                  <div className="flex justify-between items-center pt-1">
                    <div className="flex items-center border border-gray-300 rounded-none overflow-hidden bg-white">
                      <button
                        className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 rounded-none text-gray-700 transition-colors cursor-pointer"
                        disabled={item.quantity <= 1}
                        onClick={() => item.quantity > 1 && updateQuantity(item.id, item.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={11} />
                      </button>

                      <span className="w-8 text-center text-xs font-black text-[#111111]">
                        {item.quantity}
                      </span>

                      <button
                        className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded-none text-gray-700 transition-colors cursor-pointer"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus size={11} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1 text-gray-400 hover:text-rose-600 transition-colors flex items-center gap-1 text-[10px] font-black uppercase tracking-wider cursor-pointer"
                      title="Remove item from bag"
                    >
                      <Trash2 size={13} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer / Checkout CTA */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 space-y-3.5 shrink-0 bg-white border-t-2 border-gray-200 shadow-lg">
            <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider text-[#111111]">
              <span>Cart Subtotal</span>
              <span className="text-base font-black text-[#111111]">{formatCurrency(subtotal)}</span>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              <ShieldCheck size={13} className="text-emerald-600" />
              <span>Escrow protected checkout • Instant delivery</span>
            </div>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  onClose();
                  router.push('/checkout');
                }}
                className="w-full bg-[#f6c947] text-[#111111] border-2 border-[#f6c947] hover:bg-[#111111] hover:text-[#f6c947] hover:border-[#111111] py-3 text-xs font-black uppercase tracking-widest transition-all rounded-none flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={14} />
              </button>

              <button
                onClick={() => {
                  onClose();
                  router.push('/cart');
                }}
                className="w-full bg-white text-[#111111] border-2 border-[#111111] hover:bg-[#111111] hover:text-white py-2.5 text-xs font-black uppercase tracking-widest transition-all rounded-none text-center cursor-pointer"
              >
                View Full Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}