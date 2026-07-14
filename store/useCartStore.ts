import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 1. Perfectly match your API JSON Response
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
    logo: string;
  };
  views: number;
  attributes: Record<string, any>;
  status: string;
  averageRating?: number;
  reviewCount?: number;
}

// 2. Cart items only need specific data
export interface CartItem {
  id: string;
  title: string;
  price: number;
  primaryImage: string;
  quantity: number;
  businessName: string;
  color?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void; // CHANGED from number to string
  updateQuantity: (productId: string, quantity: number) => void; // CHANGED to string
  clearCart: () => void;
  getTotalPrice: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((item) => item.id === product.id);

        if (existingItem) {
          set({
            items: currentItems.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          // Map API Product payload to CartItem
          const newItem: CartItem = {
            id: product.id,
            title: product.title,
            price: product.price,
            primaryImage: product.primaryImage,
            businessName: product.seller?.businessName || 'Unknown Seller',
            quantity,
          };
          set({ items: [...currentItems, newItem] });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((item) => item.id !== productId) });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.id === productId ? { ...item, quantity } : item
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