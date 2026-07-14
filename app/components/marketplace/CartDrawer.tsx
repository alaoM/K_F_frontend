'use client'

import { formatCurrency } from '@/helpers/functions'
import { useCartStore } from '@/store/useCartStore'
import { X, Plus, Minus, Trash } from 'lucide-react'
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
          className="fixed inset-0 bg-black/40 z-40"
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[350px] bg-white z-50 shadow-xl transform transition-transform duration-300 flex flex-col ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* HEADER (fixed) */}
        <div className="p-2 border-b border-[#e2e2e2] flex justify-between items-center shrink-0">
          <h3 className="font-bold text-sm">Cart ({items.length})</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X />
          </button>
        </div>

        {/* BODY (scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
           <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">🛍️</div>
                <p className="font-medium">Your cart is empty</p>
                <button onClick={onClose} className="text-[#243e6b] font-bold border-b border-[#243e6b]">Continue Shopping</button>
              </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="border-b border-[#e2e2e2] pb-4">
                {/* Item Info */}
                <div className="flex gap-4">
                  <div className="relative  w-32 h-32 border border-[#e2e2e2]">
                    <Image
                      src={item.primaryImage}
                      alt={item.title}
                      fill
                      className="object-cover "
                    />
                  </div>

                  <div className="flex-1">
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm text-gray-500">
                      {formatCurrency(item.price)}
                    </p>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex justify-between items-center mt-3">
                  {/* Quantity */}
                  <div className="flex items-center border border-[#e2e2e2] rounded overflow-hidden w-32">
                    <button
                      className="px-2 py-2 hover:bg-gray-100 disabled:opacity-40 w-1/4"
                      disabled={item.quantity === 1}
                      onClick={() =>
                        item.quantity > 1 &&
                        updateQuantity(item.id, item.quantity - 1)
                      }
                    >
                      <Minus size={14} />
                    </button>

                    <span className="px-3 text-sm w-2/4 text-center border-l border-r border-[#e2e2e2]">
                      {item.quantity}
                    </span>

                    <button
                      className="px-2 py-1 hover:bg-gray-100 w-1/4"
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1)
                      }
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Price + Remove */}
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-medium">
                      {formatCurrency(item.price * item.quantity)}
                    </p>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* FOOTER  */}
         {items.length > 0 && (
        <div className="p-5 space-y-4 shrink-0 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between font-medium">
            <span>Subtotal</span>
            <span>{formatCurrency(getTotalPrice())}</span>
          </div>

          <p className="text-xs text-gray-500">
            Shipping and taxes calculated at checkout
          </p>
 
          <button onClick={() => router.push('/cart')} className="w-full bg-[#2f4b75] text-white py-3 rounded-md hover:opacity-90 transition">
            VIEW CART
          </button>

          <button onClick={() => router.push('/checkout')} className="w-full bg-[#f6c947] py-3 rounded-md font-semibold hover:opacity-90 transition">
            CHECKOUT
          </button>
        
        </div>
         )}
      </div>
    </>
  )
}