'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Minus, Plus, X } from 'lucide-react'
import { Product, useCartStore } from '@/store/useCartStore'
import { formatCurrency } from '@/helpers/functions'

export default function QuickViewModal({ product, onClose, onAddToCart }: { product: Product, onClose: () => void, onAddToCart: () => void }) {
    const {items, addItem, removeItem, updateQuantity} = useCartStore()
 
    const images = [product.primaryImage, ...(product.otherImages || [])].filter(Boolean);
    const [activeIndex, setActiveIndex] = useState(0);
    const [qty, setQty] = useState(1);

    // Variants State
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [selectedSize, setSelectedSize] = useState<string>('');

    useEffect(() => {
      if (product?.hasVariants && Array.isArray(product.variants) && product.variants.length > 0) {
        const firstInStock = product.variants.find((v) => v.stock > 0) || product.variants[0];
        if (firstInStock.color) setSelectedColor(firstInStock.color);
        if (firstInStock.size) setSelectedSize(firstInStock.size);
      }
    }, [product]);

    const activeVariant = product?.hasVariants && Array.isArray(product.variants)
      ? product.variants.find(
          (v) =>
            (selectedColor ? v.color === selectedColor : true) &&
            (selectedSize ? v.size === selectedSize : true)
        )
      : null;

    const effectiveStock = product?.hasVariants
      ? (activeVariant ? activeVariant.stock : 0)
      : product?.stock || 0;

    const cartKey = activeVariant?.id
      ? `${product.id}-${activeVariant.id}`
      : product.id;

    const cartItem = items.find((item) => item.id === cartKey);

  useEffect(() => {
    if (cartItem) {
      setQty(cartItem.quantity);
    } else {
      setQty(1);
    }
  }, [cartItem, selectedColor, selectedSize]);

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

                    {/* DYNAMIC VARIANT OPTIONS */}
                    {product.hasVariants && Array.isArray(product.variants) && product.variants.length > 0 && (
                        <div className="space-y-3 pt-2 border-t border-gray-100">
                            {/* Colors */}
                            {Array.from(new Set(product.variants.filter(v => v.color).map(v => v.color))).length > 0 && (
                                <div className="space-y-1.5">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">
                                        Color: {selectedColor || 'Choose'}
                                    </span>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {Array.from(
                                            new Map(product.variants.filter(v => v.color).map(v => [v.color, v.colorHex || '#111111'])).entries()
                                        ).map(([colName, colHex]) => (
                                            <button
                                                key={colName}
                                                type="button"
                                                onClick={() => setSelectedColor(colName as string)}
                                                className={`flex items-center gap-1.5 px-2 py-1 border text-[11px] font-bold rounded-none ${
                                                    selectedColor === colName
                                                        ? 'border-[#111111] bg-[#111111] text-white'
                                                        : 'border-gray-300 bg-white text-[#111111] hover:border-gray-500'
                                                }`}
                                            >
                                                <span
                                                    className="w-2.5 h-2.5 rounded-full border border-gray-300 shrink-0"
                                                    style={{ backgroundColor: colHex as string }}
                                                />
                                                <span>{colName}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Sizes */}
                            {Array.from(new Set(product.variants.filter(v => v.size).map(v => v.size))).length > 0 && (
                                <div className="space-y-1.5">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">
                                        Size: {selectedSize || 'Choose'}
                                    </span>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        {Array.from(new Set(product.variants.filter(v => v.size).map(v => v.size))).map((sz) => {
                                            const matchingVar = product.variants?.find(
                                                (v) => (selectedColor ? v.color === selectedColor : true) && v.size === sz
                                            );
                                            const isSold = (matchingVar ? matchingVar.stock : 0) <= 0;
                                            const isSel = selectedSize === sz;

                                            return (
                                                <button
                                                    key={sz}
                                                    type="button"
                                                    onClick={() => setSelectedSize(sz as string)}
                                                    className={`px-2.5 py-1 border text-[11px] font-mono font-bold rounded-none relative ${
                                                        isSel
                                                            ? 'border-[#111111] bg-[#111111] text-white'
                                                            : isSold
                                                            ? 'border-gray-200 bg-gray-50 text-gray-400 opacity-60'
                                                            : 'border-gray-300 bg-white text-[#111111] hover:border-[#111111]'
                                                    }`}
                                                >
                                                    <span>{sz}</span>
                                                    {isSold && (
                                                        <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                            <span className="w-full h-[1px] bg-rose-400 rotate-[-20deg]" />
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className='flex items-center justify-between text-xs pt-1 border-t border-gray-100'>
                        <p className="font-bold text-gray-700 uppercase">Availability:</p>
                        <div className={`text-xs font-bold uppercase px-2 py-0.5 rounded-none ${effectiveStock > 0 ? 'text-emerald-700 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
                            {effectiveStock > 0 ? `${effectiveStock} in stock` : 'Sold out'}
                        </div>
                    </div>
                    <div className='flex items-center justify-between text-xs'>
                        <p className="font-bold text-gray-700 uppercase">Quantity:</p>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center border border-gray-300 rounded-none overflow-hidden">
                                <button
                                    disabled={effectiveStock <= 0}
                                    onClick={decreaseQty}
                                    className="px-2.5 py-1 hover:bg-gray-100 text-gray-600 disabled:opacity-30"
                                >
                                    <Minus size={12} />
                                </button>
                                <span className="px-3 font-bold text-xs">{qty}</span>
                                <button
                                    disabled={effectiveStock <= 0 || qty >= effectiveStock}
                                    onClick={increaseQty}
                                    className="px-2.5 py-1 hover:bg-gray-100 text-gray-600 disabled:opacity-30"
                                >
                                    <Plus size={12} />
                                </button>
                            </div>

                            {cartItem && (
                                <button onClick={() => removeItem(product.id)} className="text-xs text-red-500 hover:underline">Remove</button>
                            )}
                        </div>
                    </div>

                    <button
                        disabled={effectiveStock <= 0}
                        onClick={() => {
                            if (effectiveStock <= 0) return;
                            addItem(product, qty, {
                                variant: activeVariant,
                                selectedColor,
                                selectedSize,
                            });
                            onAddToCart();
                        }}
                        className={`w-full px-6 py-3 rounded-none font-black text-xs uppercase tracking-widest transition-colors mt-2 ${
                            effectiveStock <= 0
                                ? 'bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed'
                                : 'bg-[#111111] hover:bg-[#f6c947] hover:text-[#111111] text-white'
                        }`}
                    >
                       {effectiveStock <= 0 ? 'Sold Out' : cartItem ? 'Update Cart' : 'Add to Cart'}
                    </button>
                </div>
            </div>
        </div>
    )
}