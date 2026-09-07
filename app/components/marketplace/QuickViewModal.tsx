'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Minus, Plus, X } from 'lucide-react'
import { Product, useCartStore } from '@/store/useCartStore'
import { formatCurrency } from '@/helpers/functions'

export default function QuickViewModal({ product, onClose, onAddToCart }: { product: Product, onClose: () => void, onAddToCart: () => void }) {
    const {items, addItem, removeItem, updateQuantity} = useCartStore()
 
    const images = [product.primaryImage, ...product.otherImages]
    const [activeIndex, setActiveIndex] = useState(0)
    const [qty, setQty] = useState(1)
    
    const [touchStart, setTouchStart] = useState(0)
    const [touchEnd, setTouchEnd] = useState(0)

    const cartItem = items.find((item) => item.id === product.id)

  useEffect(() => {
    if (cartItem) {
      setQty(cartItem.quantity)
    }
  }, [cartItem])

  // Auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) =>
        prev === images.length - 1 ? 0 : prev + 1
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [images.length])

  const increaseQty = () => {
    const newQty = qty + 1
    setQty(newQty)

    if (cartItem) {
      updateQuantity(product.id, newQty)
    }
  }

  const decreaseQty = () => {
    const newQty = qty - 1
    if (newQty <= 0) return

    setQty(newQty)

    if (cartItem) {
      updateQuantity(product.id, newQty)
    }
  }

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.targetTouches[0].clientX)
    }

    const handleTouchEnd = (e: React.TouchEvent) => {
        setTouchEnd(e.changedTouches[0].clientX)

        if (touchStart - touchEnd > 50) {
            setActiveIndex((prev) =>
                prev === images.length - 1 ? 0 : prev + 1
            )
        }

        if (touchStart - touchEnd < -50) {
            setActiveIndex((prev) =>
                prev === 0 ? images.length - 1 : prev - 1
            )
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-225 max-w-4xl p-6 rounded-none border border-gray-200 shadow-2xl flex flex-col md:flex-row gap-8 relative">

                <button onClick={onClose} className="absolute right-4 top-4 text-gray-500 hover:text-black p-1">
                    <X size={20} />
                </button>

                {/* LEFT */}
                <div className="w-full md:w-1/2 flex flex-col gap-4">
                    <div
                        className="relative w-full h-80 bg-gray-100 rounded-none overflow-hidden border border-gray-200"
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                    >
                        <Image
                            src={images[activeIndex]}
                            alt={product.title}
                            fill
                            className="object-cover"
                        />
                    </div>

                    <div className="flex gap-3 overflow-x-auto pb-1">
                        {images.map((img, i) => (
                            <div
                                key={i}
                                onClick={() => setActiveIndex(i)}
                                className={`relative min-w-20 h-20 rounded-none border cursor-pointer overflow-hidden ${activeIndex === i ? 'border-[#111111]' : 'border-gray-200'
                                    }`}
                            >
                                <Image src={img} alt="thumb" fill className="object-cover rounded-none" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT */}
                <div className="w-full md:w-1/2 space-y-4">
                    <h2 className="text-xl font-black uppercase text-[#111111]">{product.title}</h2>
                    <p className="text-[#111111] font-black text-2xl">{formatCurrency(product.price)}</p>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Description</h3>
                    <p className="text-xs text-gray-600 leading-relaxed max-h-28 overflow-y-auto pr-2">
                        {product.description || "No description provided."}
                    </p>

                    <div className='border-t border-gray-100'></div>

                    <div className='flex items-center justify-between text-xs'>
                        <p className="font-bold text-gray-700 uppercase">Options:</p>
                        <select className='border border-gray-300 rounded-none py-1.5 px-3 text-xs outline-none'>
                            <option>Default</option>
                            {product.attributes && Object.entries(product.attributes).map(([key, value]) => (
                                <option key={key}>{key}: {value}</option>
                            ))}
                        </select>
                    </div>
                    <div className='flex items-center justify-between text-xs'>
                        <p className="font-bold text-gray-700 uppercase">Status:</p>
                        <div className="text-xs font-bold text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded-none">
                            {product.status.replace(/_/g, ' ')}
                        </div>
                    </div>
                    <div className='flex items-center justify-between text-xs'>
                        <p className="font-bold text-gray-700 uppercase">Quantity:</p>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center border border-gray-300 rounded-none overflow-hidden">
                                <button onClick={decreaseQty} className="px-2.5 py-1 hover:bg-gray-100 text-gray-600">
                                    <Minus size={12} />
                                </button>
                                <span className="px-3 font-bold text-xs">{qty}</span>
                                <button onClick={increaseQty} className="px-2.5 py-1 hover:bg-gray-100 text-gray-600">
                                    <Plus size={12} />
                                </button>
                            </div>

                            <button onClick={() => removeItem(product.id)} className="text-xs text-red-500 hover:underline">Remove</button>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            addItem(product, qty)
                            onAddToCart()
                        }}
                        className="bg-[#111111] hover:bg-[#f6c947] hover:text-[#111111] w-full text-white px-6 py-3 rounded-none font-black text-xs uppercase tracking-widest transition-colors mt-2"
                    >
                       {cartItem ? 'Update Cart' : 'Add to Cart'}
                    </button>
                </div>
            </div>
        </div>
    )
}