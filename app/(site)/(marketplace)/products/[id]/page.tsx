'use client';

export const dynamic = 'force-dynamic'

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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

const ProductDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const fetcher = useApi();
  const { items, addItem, updateQuantity } = useCartStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [qty, setQty] = useState(1);

  const cartItem = items.find((item) => item.id === product?.id);

  const fetchProduct = async () => {
    try {
      const res = await fetcher(`/api/products/${params.id}`);
      setProduct(res.data);
    } catch (err: any) {
      toast.error('Failed to load product');
      router.push('/collections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) fetchProduct();
  }, [params.id, fetcher, router]);

  useEffect(() => {
    if (cartItem) setQty(cartItem.quantity);
  }, [cartItem]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-[#243e6b] border-t-transparent rounded-full animate-spin" />
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
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 md:px-8 lg:px-16">
      {/* BACK BUTTON */}
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-[#243e6b] font-bold mb-8 hover:opacity-70 transition-all"
      >
        <ChevronLeft size={20} />
        Back to Store
      </button>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        
        {/* LEFT: IMAGES */}
        <div className="space-y-6">
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-white shadow-xl group border border-white">
            <Image 
              src={images[activeIndex]} 
              alt={product.title} 
              fill 
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              priority
            />
            <div className="absolute top-6 right-6 flex flex-col gap-3">
              <button className="p-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg hover:bg-white transition-all">
                <Heart size={20} className="text-gray-400" />
              </button>
              <button className="p-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg hover:bg-white transition-all">
                <Share2 size={20} className="text-gray-400" />
              </button>
            </div>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`relative min-w-[100px] h-24 rounded-2xl overflow-hidden border-2 transition-all shadow-sm ${
                  activeIndex === i ? 'border-[#243e6b] scale-105' : 'border-transparent hover:border-gray-300'
                }`}
              >
                <Image src={img} alt="preview" fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: DETAILS */}
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-blue-50 text-[#243e6b] text-[10px] font-black uppercase tracking-widest rounded-full">
                {product.seller?.businessName || 'Verified Vendor'}
              </span>
              <div className="flex items-center gap-1 text-amber-500">
                <Star size={14} fill="currentColor" />
                <span className="text-sm font-bold">{product.averageRating || 0}</span>
                <span className="text-xs text-gray-400 font-medium">({product.reviewCount || 0} Reviews)</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-[#243e6b] leading-tight mb-4 tracking-tight">
              {product.title}
            </h1>
            <div className="flex items-center gap-6">
              <p className="text-3xl font-black text-[#243e6b]">
                {formatCurrency(product.price)}
              </p>
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
                <Eye size={16} />
                <span className="text-sm font-bold">{product.views || 0} Views</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-black text-[#243e6b] uppercase text-xs tracking-widest">Description</h3>
            <p className="text-gray-600 leading-relaxed text-lg font-medium opacity-80">
              {product.description || 'Premium quality apparel designed for comfort and style. Every piece is crafted with attention to detail and high-quality materials to ensure longevity and a perfect fit.'}
            </p>
          </div>

          {/* ATTRIBUTES */}
          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(product.attributes).map(([key, value]) => (
                <div key={key} className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">{key}</p>
                  <p className="text-[#243e6b] font-bold">{value}</p>
                </div>
              ))}
            </div>
          )}

          {/* QUANTITY & ACTION */}
          <div className="space-y-6 pt-4">
            <div className="flex items-center gap-8">
              <div className="space-y-2">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Quantity</p>
                <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                  <button 
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-400"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="w-12 text-center font-black text-[#243e6b]">{qty}</span>
                  <button 
                    onClick={() => setQty(qty + 1)}
                    className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-[#243e6b]"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 space-y-2">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Stock</p>
                <p className={`font-bold ${product.stock > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {product.stock > 0 ? `${product.stock} units available` : 'Out of stock'}
                </p>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="w-full h-16 bg-[#243e6b] hover:bg-[#243e6b]/90 text-white rounded-2xl flex items-center justify-center gap-3 font-black text-lg transition-all shadow-xl shadow-blue-900/20 active:scale-95 disabled:opacity-50"
            >
              <ShoppingCart size={22} />
              {cartItem ? 'UPDATE CART' : 'ADD TO BAG'}
            </button>
          </div>

          {/* TRUST BADGES */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-gray-100">
            <div className="flex items-center gap-4 group">
              <div className="p-3 bg-blue-50 text-[#243e6b] rounded-2xl group-hover:bg-[#243e6b] group-hover:text-white transition-all">
                <Truck size={24} />
              </div>
              <div>
                <p className="text-xs font-black text-[#243e6b]">FREE SHIPPING</p>
                <p className="text-[10px] text-gray-400 font-bold">On orders over ₦50k</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl group-hover:bg-rose-600 group-hover:text-white transition-all">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-xs font-black text-[#243e6b]">SECURE ESCROW</p>
                <p className="text-[10px] text-gray-400 font-bold">100% money back</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl group-hover:bg-amber-600 group-hover:text-white transition-all">
                <ArrowLeftRight size={24} />
              </div>
              <div>
                <p className="text-xs font-black text-[#243e6b]">EASY RETURNS</p>
                <p className="text-[10px] text-gray-400 font-bold">30-day exchange</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* REVIEWS SECTION */}
      <div className="max-w-7xl mx-auto mt-24 pt-24 border-t border-gray-100">
        <ReviewsSection 
          productId={product.id} 
          averageRating={product.averageRating} 
          reviewCount={product.reviewCount}
          onReviewAdded={fetchProduct}
        />
      </div>
    </div>
  );
};

export default ProductDetailPage;
