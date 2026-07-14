'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Minus, Plus, X } from 'lucide-react'
import { Product, useCartStore } from '@/store/useCartStore'
import { formatCurrency } from '@/helpers/functions'


export default function QuickViewModal({ product, onClose, onAddToCart }: { product: Product, onClose: () => void, onAddToCart: () => void }) {
    const {items, addItem,removeItem,updateQuantity} = useCartStore()
 
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 ">
            <div className="bg-white w-225 m-5 p-6 rounded-xl flex gap-8 relative">

                <button onClick={onClose} className="absolute right-4 top-4">
                    <X />
                </button>

                {/* LEFT */}
                <div className="w-1/2  flex flex-col gap-4">
                    <div
                        className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden"
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

                    <div className="flex gap-3 overflow-x-auto">
                        {images.map((img, i) => (
                            <div
                                key={i}
                                onClick={() => setActiveIndex(i)}
                                className={`relative min-w-24 h-24 rounded cursor-pointer  ${activeIndex === i ? 'border border-[#243e6b]' : ''
                                    }`}
                            >
                                <Image src={img} alt="thumb" fill className="object-cover rounded" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT */}
                <div className="w-1/2 space-y-4">
                    <h2 className="text-xl font-bold">{product.title}</h2>
                    <p className="text-blue-600 font-bold text-lg">{formatCurrency(product.price)}</p>
                    <h3>Description</h3>
                   <p className="text-sm text-gray-600 leading-relaxed max-h-32 overflow-y-auto pr-2">
                            {product.description || "No description provided."}
                        </p>


                    <div className=' border-[0.5]'></div>

                    <div className='flex item-center justify-between'>
                        <p>Options:</p>
                         <select className='border w-1/2 rounded-sm py-2 px-3 text-sm'>
                            <option>Default</option>
                            {product.attributes && Object.entries(product.attributes).map(([key, value]) => (
                                <option key={key}>{key}: {value}</option>
                            ))}
                        </select>
                    </div>
                    <div className='flex item-center justify-between'>
                        <p>Status:</p>
                        <div className="text-sm font-bold text-blue-600 uppercase">
                            {product.status.replace(/_/g, ' ')}
                        </div>
                    </div>
                     <div className='flex item-center justify-between'>
                        <p>Quantity:</p>
                         <div className="flex flex-col items-center gap-2">
                                <div className="flex items-center border rounded overflow-hidden">
                                    <button onClick={decreaseQty}
                                        className="px-2 py-1 hover:bg-gray-100">
                                        <Minus size={14} />
                                    </button>
                                    <span className="px-4">{qty}</span>
                                    <button onClick={increaseQty
                                    } className="px-2 py-1 hover:bg-gray-100">
                                        <Plus size={14} />
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
                        className="bg-[#243e6b] hover:bg-[#f6c947] w-full text-white px-6 py-2 rounded"
                    >
                       {cartItem ? 'Update Cart' : 'Add to Cart'}
                    </button>
                </div>
            </div>
        </div>
    )
}