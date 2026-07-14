'use client'

import Image from 'next/image'
import { Minus, Plus } from 'lucide-react'
import { useCartStore } from '@/store/useCartStore'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/helpers/functions'

export default function CartPage() {
    const router = useRouter()
    const { items, updateQuantity, removeItem, getTotalPrice, clearCart } = useCartStore()


    return (
        <div className="min-h-screen bg-gray-100 py-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT: CART ITEMS */}
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow space-y-6">

                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold">My cart:</h2>
                        <span className="text-sm text-gray-500">{items.length} Items</span>
                    </div>
                    {
                        items.length === 0 && (
                            <p>No item found in cart</p>
                        )
                    }

                    {items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center border-b pb-6">

                            {/* Left */}
                            <div className="flex gap-4">
                                <div className="w-20 h-20 relative border rounded">
                                    <Image src={item.primaryImage} alt={item.title} fill className="object-cover" />
                                </div>

                                <div>
                                    <p className="font-medium">{item.title}</p>
                                    <p className="text-sm text-gray-500">Color: {item.color}</p>
                                    <p className="text-sm mt-1">{formatCurrency(item.price)}</p>
                                </div>
                            </div>

                            {/* Middle Controls */}
                            <div className="flex flex-col items-center gap-2">
                                <div className="flex items-center border rounded overflow-hidden">
                                    <button onClick={() =>
                                        updateQuantity(item.id, item.quantity - 1)
                                    }
                                        className="px-2 py-1 hover:bg-gray-100">
                                        <Minus size={14} />
                                    </button>
                                    <span className="px-4">{item.quantity}</span>
                                    <button onClick={() =>
                                        updateQuantity(item.id, item.quantity + 1)
                                    } className="px-2 py-1 hover:bg-gray-100">
                                        <Plus size={14} />
                                    </button>
                                </div>

                                <button onClick={() => removeItem(item.id)} className="text-xs text-red-500 hover:underline">Remove</button>
                            </div>

                            {/* Right Price */}
                            <div className="font-medium">{formatCurrency(item.price * item.quantity)}</div>
                        </div>
                    ))}

                    {/* Actions */}
                    <div className="flex justify-between pt-4">
                        <button onClick={() => router.push('/')} className="bg-yellow-400 px-6 py-2 rounded font-medium hover:opacity-90">
                            CONTINUE SHOPPING
                        </button>
                        {
                            items.length > 0 && (
                                <button onClick={() => clearCart()} className="bg-yellow-400 px-6 py-2 rounded font-medium hover:opacity-90">
                                    CLEAR CART
                                </button>)
                        } 

                    </div>

                    {/* Notes */}
                    <div className="pt-6 space-y-2">
                        <h3 className="font-medium">Special instructions for seller</h3>
                        <textarea className="w-full border rounded p-3 h-32" />
                    </div>
                </div>

                {/* RIGHT: SUMMARY */}
                <div className="space-y-6">

                    {/* Shipping */}
                    {/* <div className="bg-white p-6 rounded-lg shadow space-y-4">
                        <h3 className="font-semibold">Shipping info</h3>

                        <select className="input">
                            <option>India</option>
                        </select>

                        <select className="input">
                            <option>Gujarat</option>
                        </select>

                        <input placeholder="Zip/Postal Code" className="input" />

                        <button className="w-full bg-yellow-400 py-2 rounded font-semibold">
                            CALCULATE
                        </button>
                    </div> */}
                    {
                        items.length > 0 && (
                            <div className="bg-white p-6 rounded-lg shadow space-y-4">
                                <div className="flex justify-between font-medium">
                                    <span>Total</span>
                                    <span>{formatCurrency(getTotalPrice())}</span>
                                </div>
                                {/* <input placeholder="Discount code" className="input" /> */}
                                <button onClick={() => router.push('/checkout')} className="w-full bg-yellow-400 py-3 rounded font-semibold">
                                    CHECKOUT
                                </button>
                            </div>
                        )
                    }
                </div>
            </div>

            <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 10px;
          font-size: 14px;
          outline: none;
        }

        .input:focus {
          border-color: #2f4b75;
          box-shadow: 0 0 0 1px #2f4b75;
        }
      `}</style>
        </div>
    )
}
