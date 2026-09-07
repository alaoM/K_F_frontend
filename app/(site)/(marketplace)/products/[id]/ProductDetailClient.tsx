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

  const cartItem = items.find((item) => item.id === product?.id);

  const fetchProduct = useCallback(async () => {
    try {
      const res = await fetcher(`/api/products/${params.id}`);
      setProduct(res.data);
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

  useEffect(() => {
    if (cartItem) setQty(cartItem.quantity);
  }, [cartItem]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-[#111111] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) return null;

  const images = [product.primaryImage, ...(product.otherImages || [])];

  const handleAddToCart = () => {
    addItem(product, qty);
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
              src={images[activeIndex]}
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
                <Star size={14} fill="currentColor" />
                <span className="text-xs font-bold text-[#111111]">{product.averageRating || 0}</span>
                <span className="text-xs text-gray-400 font-medium">({product.reviewCount || 0} Reviews)</span>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-[#111111] leading-tight mb-3 uppercase tracking-tight">
              {product.title}
            </h1>
            <div className="flex items-center gap-4">
              <p className="text-2xl md:text-3xl font-black text-[#111111]">
                {formatCurrency(product.price)}
              </p>
              <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-none text-xs font-bold">
                <Eye size={14} />
                <span>{product.views || 0} Views</span>
              </div>
            </div>
          </div>

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
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="p-2 hover:bg-gray-100 rounded-none transition-colors text-gray-600 cursor-pointer"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-10 text-center font-black text-xs text-[#111111]">{qty}</span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="p-2 hover:bg-gray-100 rounded-none transition-colors text-[#111111] cursor-pointer"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div className="flex-1 space-y-1">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Stock</p>
                <p className={`font-bold text-xs ${product.stock > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {product.stock > 0 ? `${product.stock} units available` : 'Out of stock'}
                </p>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="w-full h-14 bg-[#111111] hover:bg-[#f6c947] hover:text-[#111111] text-white rounded-none flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest transition-all shadow-md active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              <ShoppingCart size={18} />
              {cartItem ? 'UPDATE CART' : 'ADD TO CART'}
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
