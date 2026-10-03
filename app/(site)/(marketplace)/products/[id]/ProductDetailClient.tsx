'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronLeft,
  ShoppingCart,
  ShieldCheck,
  Truck,
  ArrowLeftRight,
  Star,
  Eye,
  Plus,
  Minus,
  Share2,
  Heart
} from 'lucide-react';
import { toast } from 'react-toastify';
import { Product, useCartStore } from '@/store/useCartStore';
import { formatCurrency } from '@/helpers/functions';
import { useApi } from '@/hooks/useApi';

import ReviewsSection from '@/app/components/marketplace/ReviewsSection';

const ProductDetailClient = () => {
  const params = useParams();
  const router = useRouter();
  const fetcher = useApi();
  const { items, addItem } = useCartStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [qty, setQty] = useState(1);

  // Variant Selection State
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');

  const fetchProduct = useCallback(async () => {
    try {
      const res = await fetcher(`/api/products/${params.id}`);
      const prod: Product = res.data;
      setProduct(prod);

      // Auto-select initial variant if available
      if (prod.hasVariants && Array.isArray(prod.variants) && prod.variants.length > 0) {
        // Find first in-stock variant or first variant
        const firstInStock = prod.variants.find((v) => v.stock > 0) || prod.variants[0];
        if (firstInStock.color) setSelectedColor(firstInStock.color);
        if (firstInStock.size) setSelectedSize(firstInStock.size);
      }
    } catch (err: any) {
      toast.error('Failed to load product');
      router.push('/collections');
    } finally {
      setLoading(false);
    }
  }, [params.id, fetcher, router]);

  useEffect(() => {
    if (params.id) fetchProduct();
  }, [params.id, fetchProduct]);

  // Derived Variant & Stock Calculations
  const variants = product?.variants || [];
  const hasVariants = Boolean(product?.hasVariants && variants.length > 0);

  // Extract unique available colors & sizes
  const availableColors = React.useMemo(() => {
    if (!hasVariants) return [];
    const colorMap = new Map<string, string>();
    variants.forEach((v) => {
      if (v.color) {
        colorMap.set(v.color, v.colorHex || '#111111');
      }
    });
    return Array.from(colorMap.entries()).map(([name, hex]) => ({ name, hex }));
  }, [hasVariants, variants]);

  const availableSizes = React.useMemo(() => {
    if (!hasVariants) return [];
    const set = new Set<string>();
    variants.forEach((v) => {
      if (v.size) set.add(v.size);
    });
    return Array.from(set);
  }, [hasVariants, variants]);

  // Active Variant based on current selection
  const activeVariant = React.useMemo(() => {
    if (!hasVariants) return null;
    return variants.find(
      (v) =>
        (availableColors.length > 0 ? v.color === selectedColor : true) &&
        (availableSizes.length > 0 ? v.size === selectedSize : true)
    ) || null;
  }, [hasVariants, variants, availableColors, availableSizes, selectedColor, selectedSize]);

  // Check if combination is produced and in stock
  const isCombinationProduced = hasVariants ? Boolean(activeVariant) : true;
  const effectiveStock = hasVariants
    ? (activeVariant ? activeVariant.stock : 0)
    : product?.stock || 0;

  const isSoldOut = !isCombinationProduced || effectiveStock <= 0;

  // Effective Display Price & Stock
  const displayPrice = activeVariant?.price !== undefined && activeVariant?.price !== null
    ? Number(activeVariant.price)
    : product?.price || 0;

  // Check Cart State for this specific variant or base product
  const cartItemKey = activeVariant?.id
    ? `${product?.id}-${activeVariant.id}`
    : selectedColor || selectedSize
    ? `${product?.id}-${selectedColor || 'default'}-${selectedSize || 'default'}`
    : product?.id;

  const cartItem = items.find((item) => item.id === cartItemKey);

  useEffect(() => {
    if (cartItem) setQty(cartItem.quantity);
    else setQty(1);
  }, [cartItem, selectedColor, selectedSize]);

  const handleColorSelect = (colorName: string) => {
    setSelectedColor(colorName);
    // Auto-switch to an available size if current size isn't produced for this color
    const validForColor = variants.filter((v) => v.color === colorName);
    const currentSizeValid = validForColor.some((v) => v.size === selectedSize);
    if (!currentSizeValid && validForColor.length > 0) {
      const firstInStock = validForColor.find((v) => v.stock > 0) || validForColor[0];
      if (firstInStock?.size) {
        setSelectedSize(firstInStock.size);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-12 px-4 md:px-8 lg:px-16 animate-pulse">
        {/* SKELETON BACK BUTTON */}
        <div className="w-28 h-4 bg-gray-200 rounded-none mb-8" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* SKELETON LEFT: IMAGES */}
          <div className="space-y-4">
            <div className="aspect-[4/5] bg-gray-200 rounded-none border border-gray-100" />
            <div className="flex gap-3 overflow-hidden">
              <div className="w-[90px] h-24 bg-gray-200 rounded-none shrink-0" />
              <div className="w-[90px] h-24 bg-gray-200 rounded-none shrink-0" />
              <div className="w-[90px] h-24 bg-gray-200 rounded-none shrink-0" />
              <div className="w-[90px] h-24 bg-gray-200 rounded-none shrink-0" />
            </div>
          </div>

          {/* SKELETON RIGHT: DETAILS */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-24 h-5 bg-gray-200 rounded-none" />
                <div className="w-32 h-4 bg-gray-200 rounded-none" />
              </div>
              <div className="w-3/4 h-8 bg-gray-200 rounded-none mb-3" />
              <div className="flex items-center gap-4">
                <div className="w-32 h-8 bg-gray-200 rounded-none" />
                <div className="w-24 h-6 bg-gray-100 rounded-none" />
              </div>
            </div>

            {/* SKELETON VARIATIONS */}
            <div className="space-y-4 border-t border-b border-gray-100 py-5">
              <div className="space-y-2">
                <div className="w-20 h-3 bg-gray-200 rounded-none" />
                <div className="flex gap-2">
                  <div className="w-20 h-8 bg-gray-200 rounded-none" />
                  <div className="w-20 h-8 bg-gray-200 rounded-none" />
                  <div className="w-20 h-8 bg-gray-200 rounded-none" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="w-16 h-3 bg-gray-200 rounded-none" />
                <div className="flex gap-2">
                  <div className="w-12 h-10 bg-gray-200 rounded-none" />
                  <div className="w-12 h-10 bg-gray-200 rounded-none" />
                  <div className="w-12 h-10 bg-gray-200 rounded-none" />
                </div>
              </div>
            </div>

            {/* SKELETON DESCRIPTION */}
            <div className="space-y-2 border-t border-gray-100 pt-4">
              <div className="w-24 h-3 bg-gray-200 rounded-none mb-2" />
              <div className="w-full h-3.5 bg-gray-200 rounded-none" />
              <div className="w-11/12 h-3.5 bg-gray-200 rounded-none" />
              <div className="w-4/5 h-3.5 bg-gray-200 rounded-none" />
            </div>

            {/* SKELETON ACTION BUTTON */}
            <div className="space-y-4 pt-2 border-t border-gray-100">
              <div className="w-32 h-10 bg-gray-200 rounded-none" />
              <div className="w-full h-14 bg-gray-200 rounded-none" />
            </div>

            {/* SKELETON TRUST BADGES */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-100">
              <div className="h-16 bg-gray-100 rounded-none" />
              <div className="h-16 bg-gray-100 rounded-none" />
              <div className="h-16 bg-gray-100 rounded-none" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const images = [product.primaryImage, ...(product.otherImages || [])].filter(Boolean);

  const handleAddToCart = () => {
    if (hasVariants) {
      if (availableColors.length > 0 && !selectedColor) {
        toast.warn('Please select a color option');
        return;
      }
      if (availableSizes.length > 0 && !selectedSize) {
        toast.warn('Please select a size option');
        return;
      }
      if (!isCombinationProduced) {
        toast.error('This combination is not available');
        return;
      }
      if (effectiveStock <= 0) {
        toast.error('This variation is currently sold out');
        return;
      }
    }

    addItem(product, qty, {
      variant: activeVariant,
      selectedColor,
      selectedSize,
    });
    toast.success('Added to cart');
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4 md:px-8 lg:px-16">
      {/* BACK BUTTON */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-[#111111] font-bold text-xs uppercase tracking-wider mb-8 hover:text-[#f6c947] transition-all cursor-pointer"
      >
        <ChevronLeft size={16} />
        Back to Store
      </button>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

        {/* LEFT: IMAGES */}
        <div className="space-y-4">
          <div className="relative aspect-[4/5] rounded-none overflow-hidden bg-white shadow-xs group border border-gray-200">
            <Image
              src={images[activeIndex] || '/placeholder.png'}
              alt={product.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              priority
            />
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <button className="p-2.5 bg-white/90 backdrop-blur-md rounded-none shadow-sm hover:bg-[#111111] hover:text-[#f6c947] transition-all cursor-pointer border border-gray-100">
                <Heart size={18} />
              </button>
              <button className="p-2.5 bg-white/90 backdrop-blur-md rounded-none shadow-sm hover:bg-[#111111] hover:text-[#f6c947] transition-all cursor-pointer border border-gray-100">
                <Share2 size={18} />
              </button>
            </div>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`relative min-w-[90px] h-24 rounded-none overflow-hidden border transition-all ${
                  activeIndex === i ? 'border-[#111111]' : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                <Image src={img} alt="preview" fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: DETAILS */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              {product.seller?.id ? (
                <Link href={`/store/${product.seller.id}`}>
                  <span className="px-3 py-1 bg-[#111111] text-[#f6c947] text-[10px] font-black uppercase tracking-widest rounded-none hover:bg-[#f6c947] hover:text-[#111111] transition-all cursor-pointer">
                    {product.seller.businessName}
                  </span>
                </Link>
              ) : (
                <span className="px-3 py-1 bg-[#111111] text-[#f6c947] text-[10px] font-black uppercase tracking-widest rounded-none">
                  Verified Vendor
                </span>
              )}
              <div className="flex items-center gap-1 text-[#f6c947]">
                <Star
                  size={14}
                  fill={product.reviewCount && product.reviewCount > 0 ? "currentColor" : "none"}
                  stroke="currentColor"
                  className={product.reviewCount && product.reviewCount > 0 ? "text-[#f6c947]" : "text-gray-400"}
                />
                <span className="text-xs font-bold text-[#111111]">
                  {product.reviewCount && product.reviewCount > 0 && product.averageRating
                    ? Number(product.averageRating).toFixed(1)
                    : '0.0'}
                </span>
                <span className="text-xs text-gray-400 font-medium">({product.reviewCount || 0} Reviews)</span>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-[#111111] leading-tight mb-3 uppercase tracking-tight">
              {product.title}
            </h1>
            <div className="flex items-center gap-4">
              <p className="text-2xl md:text-3xl font-black text-[#111111]">
                {formatCurrency(displayPrice)}
              </p>
              <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-none text-xs font-bold">
                <Eye size={14} />
                <span>{product.views || 0} Views</span>
              </div>
            </div>
          </div>

          {/* ---------------- PRODUCT VARIATIONS SELECTOR ---------------- */}
          {hasVariants && (
            <div className="space-y-5 border-t border-b border-gray-100 py-5">
              {/* COLOR SWATCHES */}
              {availableColors.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-black text-[#111111] uppercase tracking-wider">
                      Color: <span className="font-semibold text-gray-600 ml-1">{selectedColor || 'Select a Color'}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap">
                    {availableColors.map((col) => {
                      const isSelected = selectedColor === col.name;
                      return (
                        <button
                          key={col.name}
                          type="button"
                          onClick={() => handleColorSelect(col.name)}
                          className={`flex items-center gap-2 px-3 py-1.5 border rounded-none text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#111111] bg-[#111111] text-white shadow-xs'
                              : 'border-gray-300 bg-white text-[#111111] hover:border-gray-500'
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0 inline-block shadow-xs"
                            style={{ backgroundColor: col.hex }}
                          />
                          <span>{col.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SIZE BUTTONS WITH STOCK STATUS */}
              {availableSizes.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-black text-[#111111] uppercase tracking-wider">
                      Size: <span className="font-semibold text-gray-600 ml-1">{selectedSize || 'Select a Size'}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {availableSizes.map((sz) => {
                      const isSelected = selectedSize === sz;

                      // Check if this size is produced in the currently selected color
                      const matchingVar = variants.find(
                        (v) =>
                          (availableColors.length > 0 ? v.color === selectedColor : true) &&
                          v.size === sz
                      );
                      const isProduced = Boolean(matchingVar);
                      const sizeStock = matchingVar ? matchingVar.stock : 0;
                      const sizeSoldOut = isProduced && sizeStock <= 0;

                      return (
                        <button
                          key={sz}
                          type="button"
                          disabled={!isProduced}
                          onClick={() => {
                            if (!isProduced) {
                              toast.info(`Size ${sz} is not available in ${selectedColor || 'this color'}`);
                              return;
                            }
                            setSelectedSize(sz);
                          }}
                          title={
                            !isProduced
                              ? `Not available in ${selectedColor || 'selected color'}`
                              : sizeSoldOut
                              ? `${sz} is Sold Out`
                              : `${sizeStock} units in stock`
                          }
                          className={`min-w-[48px] h-10 px-3 border rounded-none text-xs font-black uppercase tracking-wider transition-all relative flex items-center justify-center cursor-pointer ${
                            isSelected
                              ? 'border-[#111111] bg-[#111111] text-white'
                              : !isProduced
                              ? 'border-dashed border-gray-200 bg-gray-50/70 text-gray-300 cursor-not-allowed opacity-50'
                              : sizeSoldOut
                              ? 'border-gray-200 bg-gray-50 text-gray-400 opacity-70'
                              : 'border-gray-300 bg-white text-[#111111] hover:border-[#111111]'
                          }`}
                        >
                          <span>{sz}</span>

                          {/* SOLD OUT STRIKE LINE */}
                          {sizeSoldOut && (
                            <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <span className="w-full h-[1px] bg-rose-400 rotate-[-20deg]" />
                            </span>
                          )}

                          {/* LOW STOCK BADGE */}
                          {isProduced && !sizeSoldOut && sizeStock > 0 && sizeStock <= 3 && !isSelected && (
                            <span className="absolute -top-2 -right-1 bg-amber-500 text-white text-[8px] font-black px-1 rounded-none shadow-xs">
                              {sizeStock} left
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

          <div className="space-y-2 border-t border-gray-100 pt-4">
            <h3 className="font-black text-[#111111] uppercase text-xs tracking-widest">Description</h3>
            <p className="text-gray-600 leading-relaxed text-sm font-medium">
              {product.description || 'Premium quality apparel designed for comfort and style. Every piece is crafted with attention to detail and high-quality materials to ensure longevity and a perfect fit.'}
            </p>
          </div>

          {/* ATTRIBUTES */}
          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
              {Object.entries(product.attributes).map(([key, value]) => (
                <div key={key} className="p-3 bg-gray-50 border border-gray-200 rounded-none">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">{key}</p>
                  <p className="text-[#111111] font-bold text-xs">{value}</p>
                </div>
              ))}
            </div>
          )}

          {/* QUANTITY & ACTION */}
          <div className="space-y-4 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-6">
              <div className="space-y-1">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Quantity</p>
                <div className="flex items-center bg-white border border-gray-300 rounded-none p-0.5">
                  <button
                    disabled={isSoldOut}
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="p-2 hover:bg-gray-100 disabled:opacity-30 rounded-none transition-colors text-gray-600 cursor-pointer"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-10 text-center font-black text-xs text-[#111111]">{qty}</span>
                  <button
                    disabled={isSoldOut || qty >= effectiveStock}
                    onClick={() => setQty(Math.min(effectiveStock, qty + 1))}
                    className="p-2 hover:bg-gray-100 disabled:opacity-30 rounded-none transition-colors text-[#111111] cursor-pointer"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div className="flex-1 space-y-1">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Availability</p>
                <p className={`font-bold text-xs ${!isSoldOut ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {!isCombinationProduced
                    ? 'Combination Unavailable'
                    : effectiveStock > 0
                    ? `${effectiveStock} units available`
                    : 'Sold out / Out of Stock'}
                </p>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isSoldOut}
              className={`w-full h-14 rounded-none flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest transition-all shadow-md active:scale-98 cursor-pointer ${
                isSoldOut
                  ? 'bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed'
                  : 'bg-[#111111] hover:bg-[#f6c947] hover:text-[#111111] text-white'
              }`}
            >
              <ShoppingCart size={18} />
              {isSoldOut
                ? (!isCombinationProduced ? 'UNAVAILABLE COMBINATION' : 'SOLD OUT')
                : cartItem
                ? 'UPDATE CART'
                : 'ADD TO CART'}
            </button>
          </div>

          {/* TRUST BADGES */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-3 group p-3 bg-gray-50 border border-gray-100 rounded-none">
              <div className="p-2.5 bg-white text-[#111111] rounded-none border border-gray-200">
                <Truck size={20} />
              </div>
              <div>
                <p className="text-xs font-black text-[#111111]">FREE SHIPPING</p>
                <p className="text-[10px] text-gray-400 font-bold">On orders &gt; ₦50k</p>
              </div>
            </div>
            <div className="flex items-center gap-3 group p-3 bg-gray-50 border border-gray-100 rounded-none">
              <div className="p-2.5 bg-white text-[#111111] rounded-none border border-gray-200">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-xs font-black text-[#111111]">SECURE ESCROW</p>
                <p className="text-[10px] text-gray-400 font-bold">100% money back</p>
              </div>
            </div>
            <div className="flex items-center gap-3 group p-3 bg-gray-50 border border-gray-100 rounded-none">
              <div className="p-2.5 bg-white text-[#111111] rounded-none border border-gray-200">
                <ArrowLeftRight size={20} />
              </div>
              <div>
                <p className="text-xs font-black text-[#111111]">EASY RETURNS</p>
                <p className="text-[10px] text-gray-400 font-bold">30-day exchange</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* REVIEWS SECTION */}
      <div className="max-w-7xl mx-auto mt-20 pt-16 border-t border-gray-200">
        <ReviewsSection
          productId={product.id}
          averageRating={product.averageRating ?? 0}
          reviewCount={product.reviewCount ?? 0}
          onReviewAdded={fetchProduct}
        />
      </div>
    </div>
  );
};

export default ProductDetailClient;
