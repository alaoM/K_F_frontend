'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Eye, Heart, Star } from 'lucide-react';
import { formatCurrency } from '@/helpers/functions';
import { useCartStore } from '@/store/useCartStore';
import { toast } from 'react-toastify';

interface ProductCardProps {
  product: any;
  view: 'grid' | 'list';
  onQuickView: (p: any) => void;
  onCartOpen: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, view, onQuickView, onCartOpen }) => {
  const [isHovered, setIsHovered] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product, 1);
    onCartOpen();
    toast.success('Added to Bag');
  };

  return (
    <div
      className="group bg-white"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1. PRODUCT IMAGE AREA */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#f9f9f9]">
        <Link href={`/products/${product.id}`}>
          <Image
            src={isHovered && product.otherImages?.length ? product.otherImages[0] : product.primaryImage}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-105"
          />
        </Link>

        {/* LABELS */}
        <div className="absolute top-4 left-4">
          <span className="bg-[#222222] text-white text-[9px] font-black px-2.5 py-1.5 uppercase tracking-widest">New</span>
        </div>

        {/* OVERLAY ACTIONS (Mitho Index-10 Style) */}
        <div className="absolute inset-x-0 bottom-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-white/90 flex justify-center gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); toast.info('Added to Wishlist'); }}
            className="w-10 h-10 border border-gray-100 flex items-center justify-center text-[#222222] hover:bg-[#f6c947] hover:text-white transition-all"
          >
            <Heart size={16} />
          </button>
          <button
            onClick={() => onQuickView(product)}
            className="w-10 h-10 border border-gray-100 flex items-center justify-center text-[#222222] hover:bg-[#f6c947] hover:text-white transition-all"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={handleAddToCart}
            className="w-10 h-10 border border-gray-100 flex items-center justify-center text-[#222222] hover:bg-[#f6c947] hover:text-white transition-all"
          >
            <ShoppingBag size={16} />
          </button>
        </div>
      </div>

      {/* 2. PRODUCT CONTENT AREA */}
      <div className="pt-6 pb-2">
        <div className="flex flex-col gap-1">
          <Link href={`/products/${product.id}`}>
            <h6 className="text-[13px] font-black text-[#222222] uppercase tracking-wider group-hover:text-[#f6c947] transition-colors line-clamp-1">
              {product.title}
            </h6>
          </Link>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-[#f6c947]">{formatCurrency(product.price)}</span>
              {product.oldPrice && (
                <span className="text-[11px] text-gray-300 line-through font-bold">{formatCurrency(product.oldPrice)}</span>
              )}
            </div>

            {/* STARS */}
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(i => (
                <Star 
                  key={i} 
                  size={10} 
                  fill={i <= Math.round(product.averageRating || 0) ? "#fca311" : "none"} 
                  stroke="#fca311" 
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
