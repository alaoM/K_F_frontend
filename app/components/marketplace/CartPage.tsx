'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft, ShieldCheck, Truck } from 'lucide-react'
import { useCartStore } from '@/store/useCartStore'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/helpers/functions'

export default function CartPage() {
    const router = useRouter()
    const { items, updateQuantity, removeItem, getTotalPrice, clearCart } = useCartStore()

    const subtotal = getTotalPrice()
    const freeShippingThreshold = 100
    const progressToFreeShipping = Math.min(100, (subtotal / freeShippingThreshold) * 100)

    return (
        <div className="min-h-screen bg-gray-50 py-8 font-sans">
            <div className="container mx-auto px-4 max-w-6xl">
                
                {/* BREADCRUMB / TITLE */}
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4 gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-[#222222] uppercase tracking-tight flex items-center gap-3">
                            <ShoppingCart size={28} className="text-[#f6c947]" />
                            Shopping Cart
                        </h1>
                        <p className="text-xs text-gray-500 font-medium mt-1">
                            Review your selected fashion items and proceed to checkout
                        </p>
                    </div>

                    <Link
                        href="/collections"
                        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#222222] hover:text-[#f6c947] transition-colors"
                    >
                        <ArrowLeft size={16} /> Continue Shopping
                    </Link>
                </div>

                {/* FREE SHIPPING PROGRESS */}
                <div className="bg-white p-4 border border-gray-200 rounded-none mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#222222] flex items-center gap-2">
                            <Truck size={16} className="text-[#f6c947]" />
                            {subtotal >= freeShippingThreshold ? (
                                <span className="text-green-600 font-bold">You qualify for FREE SHIPPING!</span>
                            ) : (
                                <span>Add {formatCurrency(freeShippingThreshold - subtotal)} more for FREE SHIPPING</span>
                            )}
                        </span>
                        <span className="text-xs font-bold text-gray-400">{Math.round(progressToFreeShipping)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-none overflow-hidden">
                        <div
                            className="bg-[#f6c947] h-full transition-all duration-500 rounded-none"
                            style={{ width: `${progressToFreeShipping}%` }}
                        />
                    </div>
                </div>

                {items.length === 0 ? (
                    /* EMPTY CART STATE */
                    <div className="bg-white border border-gray-200 p-12 text-center rounded-none my-8">
                        <div className="w-16 h-16 bg-gray-100 flex items-center justify-center mx-auto mb-4 rounded-none text-gray-400">
                            <ShoppingCart size={32} />
                        </div>
                        <h2 className="text-xl font-black text-[#222222] uppercase tracking-tight mb-2">Your Cart is Empty</h2>
                        <p className="text-xs text-gray-500 max-w-md mx-auto mb-6">
                            Looks like you haven&apos;t added any items to your shopping cart yet. Explore our latest categories and discover top styles.
                        </p>
                        <Link
                            href="/collections"
                            className="inline-block bg-[#222222] text-white hover:bg-[#f6c947] hover:text-[#222222] px-8 py-3 text-xs font-bold uppercase tracking-widest transition-colors rounded-none"
                        >
                            Explore Collections
                        </Link>
                    </div>
                ) : (
                    /* CART CONTENT GRID */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                        {/* LEFT: CART ITEMS LIST (8 cols) */}
                        <div className="lg:col-span-8 space-y-4">
                            <div className="bg-white border border-gray-200 rounded-none overflow-hidden">
                                
                                {/* Table Header */}
                                <div className="hidden sm:grid grid-cols-12 gap-4 bg-gray-50 p-4 border-b border-gray-200 text-[11px] font-black uppercase tracking-wider text-gray-500">
                                    <div className="col-span-6">Product</div>
                                    <div className="col-span-2 text-center">Price</div>
                                    <div className="col-span-2 text-center">Quantity</div>
                                    <div className="col-span-2 text-right">Subtotal</div>
                                </div>

                                {/* Items Rows */}
                                <div className="divide-y divide-gray-100">
                                    {items.map((item) => (
                                        <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:grid sm:grid-cols-12 gap-4 items-center">
                                            
                                            {/* Product Info (Col 6) */}
                                            <div className="sm:col-span-6 flex items-center gap-4 w-full">
                                                <div className="relative w-20 h-24 shrink-0 bg-gray-100 border border-gray-200 rounded-none overflow-hidden">
                                                    <Image
                                                        src={item.primaryImage || '/placeholder.png'}
                                                        alt={item.title}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    {item.seller?.businessName && (
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">
                                                            {item.seller.businessName}
                                                        </span>
                                                    )}
                                                    <h3 className="text-xs font-bold text-[#222222] uppercase tracking-wide truncate">
                                                        {item.title}
                                                    </h3>
                                                    {item.color && (
                                                        <p className="text-[11px] text-gray-500 mt-1">Color: {item.color}</p>
                                                    )}
                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        className="text-[10px] font-bold text-red-500 hover:text-red-700 uppercase tracking-wider flex items-center gap-1 mt-2 transition-colors"
                                                    >
                                                        <Trash2 size={12} /> Remove
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Price (Col 2) */}
                                            <div className="sm:col-span-2 text-center w-full flex justify-between sm:block border-t sm:border-t-0 pt-2 sm:pt-0">
                                                <span className="sm:hidden text-xs text-gray-400 font-bold uppercase">Price:</span>
                                                <span className="text-xs font-bold text-[#222222]">{formatCurrency(item.price)}</span>
                                            </div>

                                            {/* Quantity (Col 2) */}
                                            <div className="sm:col-span-2 text-center w-full flex justify-between sm:justify-center items-center">
                                                <span className="sm:hidden text-xs text-gray-400 font-bold uppercase">Qty:</span>
                                                <div className="inline-flex items-center border border-gray-300 rounded-none">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                                        className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600 rounded-none"
                                                    >
                                                        <Minus size={12} />
                                                    </button>
                                                    <span className="w-8 text-center text-xs font-bold text-[#222222]">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600 rounded-none"
                                                    >
                                                        <Plus size={12} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Subtotal (Col 2) */}
                                            <div className="sm:col-span-2 text-right w-full flex justify-between sm:block border-t sm:border-t-0 pt-2 sm:pt-0">
                                                <span className="sm:hidden text-xs text-gray-400 font-bold uppercase">Total:</span>
                                                <span className="text-xs font-black text-[#222222]">{formatCurrency(item.price * item.quantity)}</span>
                                            </div>

                                        </div>
                                    ))}
                                </div>

                                {/* Bottom Cart Actions */}
                                <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-wrap justify-between items-center gap-4">
                                    <button
                                        onClick={() => clearCart()}
                                        className="text-xs font-bold uppercase tracking-wider text-gray-600 hover:text-red-600 transition-colors"
                                    >
                                        Clear Entire Cart
                                    </button>
                                    <Link
                                        href="/collections"
                                        className="text-xs font-bold uppercase tracking-wider text-[#222222] hover:text-[#f6c947] transition-colors"
                                    >
                                        + Add More Products
                                    </Link>
                                </div>
                            </div>

                            {/* Special Instructions */}
                            <div className="bg-white border border-gray-200 p-5 rounded-none">
                                <h3 className="text-xs font-black uppercase tracking-wider text-[#222222] mb-2">
                                    Order Notes / Instructions for Seller
                                </h3>
                                <textarea
                                    placeholder="Add any special delivery instructions, size notes, or seller message here..."
                                    className="w-full border border-gray-300 rounded-none p-3 text-xs outline-none focus:border-[#222222] transition-colors h-24 resize-none"
                                />
                            </div>
                        </div>

                        {/* RIGHT: SUMMARY SIDEBAR (4 cols) */}
                        <div className="lg:col-span-4 space-y-4">
                            <div className="bg-white border border-gray-200 p-6 rounded-none space-y-4">
                                <h2 className="text-sm font-black uppercase tracking-widest text-[#222222] border-b border-gray-200 pb-3">
                                    Order Summary
                                </h2>

                                <div className="space-y-3 text-xs">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Items Subtotal ({items.reduce((acc, i) => acc + i.quantity, 0)})</span>
                                        <span className="font-bold text-[#222222]">{formatCurrency(subtotal)}</span>
                                    </div>

                                    <div className="flex justify-between text-gray-600">
                                        <span>Estimated Shipping</span>
                                        <span className="font-bold text-[#222222]">
                                            {subtotal >= freeShippingThreshold ? 'FREE' : '$15.00'}
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-gray-600">
                                        <span>Taxes</span>
                                        <span className="font-bold text-gray-400">Calculated at checkout</span>
                                    </div>

                                    <div className="border-t border-gray-200 pt-3 flex justify-between text-sm font-black text-[#222222] uppercase tracking-wider">
                                        <span>Total Amount</span>
                                        <span className="text-[#f6c947] bg-[#222222] px-2 py-0.5">
                                            {formatCurrency(subtotal >= freeShippingThreshold ? subtotal : subtotal + 15)}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => router.push('/checkout')}
                                    className="w-full bg-[#222222] hover:bg-[#f6c947] hover:text-[#222222] text-white py-4 text-xs font-black uppercase tracking-[0.2em] transition-all rounded-none shadow-md mt-4"
                                >
                                    Proceed to Checkout
                                </button>

                                <div className="pt-2 flex items-center justify-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    <ShieldCheck size={14} className="text-green-600" />
                                    100% Guaranteed Safe Checkout
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    )
}
