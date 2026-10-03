import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 1. Match backend Product & Variant Response
export interface ProductVariant {
  id: string;
  sku?: string;
  color?: string;
  colorHex?: string;
  size?: string;
  stock: number;
  price?: number;
  image?: string;
  attributes?: Record<string, any>;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  primaryImage: string;
  otherImages: string[];
  categoryId: string;
  seller: {
    id: string;
    businessName: string;
    logo?: string;
  };
  views: number;
  attributes: Record<string, any>;
  status: string;
  hasVariants?: boolean;
  variantOptions?: {
    colors?: string[];
    sizes?: string[];
    custom?: Record<string, string[]>;
  };
  variants?: ProductVariant[];
  averageRating?: number;
  reviewCount?: number;
}

// 2. Cart items data structure
export interface CartItem {
  id: string; // Unique Cart Item Key (e.g. productId or productId-variantId)
  productId: string;
  variantId?: string;
  title: string;
  price: number;
  primaryImage: string;
  quantity: number;
  businessName: string;
  seller?: {
    id?: string;
    businessName?: string;
    logo?: string;
  };
  color?: string;
  colorHex?: string;
  size?: string;
}

export interface AddItemOptions {
  quantity?: number;
  variant?: ProductVariant | null;
  selectedColor?: string;
  selectedSize?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantityOrOptions?: number | AddItemOptions, options?: AddItemOptions) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantityOrOptions = 1, options) => {
        let quantity = 1;
        let variant: ProductVariant | null | undefined = null;
        let selectedColor: string | undefined = undefined;
        let selectedSize: string | undefined = undefined;

        if (typeof quantityOrOptions === 'number') {
          quantity = quantityOrOptions;
          if (options) {
            variant = options.variant;
            selectedColor = options.selectedColor;
            selectedSize = options.selectedSize;
          }
        } else if (typeof quantityOrOptions === 'object' && quantityOrOptions !== null) {
          quantity = quantityOrOptions.quantity || 1;
          variant = quantityOrOptions.variant;
          selectedColor = quantityOrOptions.selectedColor;
          selectedSize = quantityOrOptions.selectedSize;
        }

        const variantId = variant?.id;
        const color = selectedColor || variant?.color;
        const colorHex = variant?.colorHex;
        const size = selectedSize || variant?.size;
        const price = variant?.price !== undefined && variant?.price !== null ? Number(variant.price) : Number(product.price);
        const image = variant?.image || product.primaryImage;

        // Unique cart key based on product and variant/options
        const itemKey = variantId
          ? `${product.id}-${variantId}`
          : color || size
          ? `${product.id}-${color || 'default'}-${size || 'default'}`
          : product.id;

        const currentItems = get().items;
        const existingItem = currentItems.find((item) => item.id === itemKey);

        if (existingItem) {
          set({
            items: currentItems.map((item) =>
              item.id === itemKey
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          const newItem: CartItem = {
            id: itemKey,
            productId: product.id,
            variantId,
            title: product.title,
            price,
            primaryImage: image,
            businessName: product.seller?.businessName || 'Verified Merchant',
            quantity,
            color,
            colorHex,
            size,
          };
          set({ items: [...currentItems, newItem] });
        }
      },

      removeItem: (itemId) => {
        set({ items: get().items.filter((item) => item.id !== itemId) });
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      getTotalPrice: () => {
        return get().items.reduce((acc, item) => acc + item.price * item.quantity, 0);
      },

      getItemCount: () => {
        return get().items.length;
      },
    }),
    {
      name: 'F&K-market-cart', 
    }
  )
);