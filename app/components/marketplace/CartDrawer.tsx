'use client'

import { formatCurrency } from '@/helpers/functions'
import { useCartStore } from '@/store/useCartStore'
import { X, Plus, Minus, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function CartDrawer({ open, onClose }: { open: boolean, onClose: () => void }) {
    const router = useRouter()
    const { items, updateQuantity, removeItem, getTotalPrice } = useCartStore()

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-40"
        />
      )}

      {/* Drawer - Sharp Rectangular Edges */}
      <div
        className={`fixed top-0 right-0 h-full w-[360px] max-w-full bg-white z-50 shadow-2xl transform transition-transform duration-300 flex flex-col rounded-none ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* HEADER */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center shrink-0 bg-gray-50">
          <h3 className="font-black text-xs uppercase tracking-widest text-[#222222]">Shopping Cart ({items.length})</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 text-[#222222] transition-colors rounded-none">
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
           <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-3 text-center">
                <div className="w-16 h-16 bg-gray-100 flex items-center justify-center rounded-none text-xl">🛒</div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#222222]">Your cart is empty</p>
                <button onClick={onClose} className="text-[11px] font-bold uppercase tracking-widest text-[#f6c947] bg-[#222222] px-4 py-2 hover:bg-[#f6c947] hover:text-[#222222] transition-colors rounded-none">
                  Continue Shopping
                </button>
              </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="border-b border-gray-200 pb-4">
                {/* Item Info */}
                <div className="flex gap-3">
                  <div className="relative w-20 h-24 border border-gray-200 shrink-0 rounded-none overflow-hidden bg-gray-50">
                    <Image
                      src={item.primaryImage || '/placeholder.png'}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-[#222222] uppercase tracking-wide truncate">{item.title}</h4>
                    <p className="text-xs font-black text-[#222222] mt-1">
                      {formatCurrency(item.price)}
                    </p>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex justify-between items-center mt-3">
                  {/* Quantity */}
                  <div className="flex items-center border border-gray-300 rounded-none overflow-hidden w-28">
                    <button
                      className="w-8 h-7 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 rounded-none text-gray-600"
                      disabled={item.quantity === 1}
                      onClick={() =>
                        item.quantity > 1 &&
                        updateQuantity(item.id, item.quantity - 1)
                      }
                    >
                      <Minus size={12} />
                    </button>

                    <span className="flex-1 text-center text-xs font-bold text-[#222222]">
                      {item.quantity}
                    </span>

                    <button
                      className="w-8 h-7 flex items-center justify-center hover:bg-gray-100 rounded-none text-gray-600"
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1)
                      }
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  {/* Price + Remove */}
                  <div className="flex items-center gap-3">
                    <p className="text-xs font-black text-[#222222]">
                      {formatCurrency(item.price * item.quantity)}
                    </p>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Remove Item"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* FOOTER  */}
        {items.length > 0 && (
          <div className="p-4 space-y-3 shrink-0 bg-white border-t border-gray-200">
            <div className="flex justify-between text-xs font-black uppercase tracking-wider text-[#222222]">
              <span>Subtotal</span>
              <span className="text-[#222222]">{formatCurrency(getTotalPrice())}</span>
            </div>

            <p className="text-[10px] text-gray-400 font-medium">
              Taxes and shipping calculated at checkout.
            </p>
   
            <button
              onClick={() => {
                onClose()
                router.push('/cart')
              }}
              className="w-full bg-[#222222] text-white py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors rounded-none"
            >
              View Cart
            </button>

            <button
              onClick={() => {
                onClose()
                router.push('/checkout')
              }}
              className="w-full bg-[#f6c947] text-[#222222] py-3 text-xs font-black uppercase tracking-[0.2em] hover:bg-yellow-400 transition-colors rounded-none"
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </>
  )
}