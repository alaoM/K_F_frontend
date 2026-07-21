'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Eye, Heart, Star } from 'lucide-react';
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
    toast.success('Added to Cart 🛒');
  };

  return (
    <div
      className="group bg-white rounded-none border border-gray-200 hover:border-[#222222] transition-all duration-300 flex flex-col overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1. PRODUCT IMAGE AREA */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-50">
        <Link href={`/products/${product.id}`} className="block w-full h-full">
          <Image
            src={isHovered && product.otherImages?.length ? product.otherImages[0] : (product.primaryImage || '/placeholder.png')}
            alt={product.title || 'Product'}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </Link>

        {/* BADGE */}
        <div className="absolute top-0 left-2 z-10">
          <span className="bg-[#222222] text-white text-[9px] font-black px-2.5  uppercase tracking-widest rounded-none">
            New
          </span>
        </div>

        {/* OVERLAY QUICK ACTIONS */}
        <div className="absolute inset-x-0 bottom-0 p-2.5 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-white/95 backdrop-blur-md flex justify-center gap-2 border-t border-gray-200 z-20">
          <button
            onClick={(e) => { e.stopPropagation(); toast.info('Added to Wishlist'); }}
            title="Wishlist"
            className="w-9 h-9 rounded-none border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-[#f6c947] hover:border-[#f6c947] hover:text-white transition-all"
          >
            <Heart size={15} />
          </button>
          <button
            onClick={() => onQuickView(product)}
            title="Quick View"
            className="w-9 h-9 rounded-none border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-[#f6c947] hover:border-[#f6c947] hover:text-white transition-all"
          >
            <Eye size={15} />
          </button>
          <button
            onClick={handleAddToCart}
            title="Add to Cart"
            className="w-9 h-9 rounded-none border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-[#f6c947] hover:border-[#f6c947] hover:text-white transition-all"
          >
            <ShoppingCart size={15} />
          </button>
        </div>
      </div>

      {/* 2. PRODUCT CONTENT AREA */}
      <div className="p-3.5 flex flex-col justify-between flex-1 bg-white">
        <div>
          {product.seller?.businessName && (
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
              {product.seller.businessName}
            </span>
          )}
          <Link href={`/products/${product.id}`}>
            <h3 className="text-xs md:text-sm font-bold text-[#222222] uppercase tracking-wide group-hover:text-[#f6c947] transition-colors line-clamp-1">
              {product.title}
            </h3>
          </Link>
        </div>

        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-black text-[#222222]">
              {formatCurrency(product.price)}
            </span>
            {product.oldPrice && (
              <span className="text-[10px] text-gray-400 line-through font-medium">
                {formatCurrency(product.oldPrice)}
              </span>
            )}
          </div>

          {/* RATING */}
          <div className="flex items-center gap-0.5">
            <Star size={11} fill="#fca311" stroke="#fca311" />
            <span className="text-[11px] font-bold text-gray-600">
              {product.averageRating ? product.averageRating.toFixed(1) : '5.0'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
