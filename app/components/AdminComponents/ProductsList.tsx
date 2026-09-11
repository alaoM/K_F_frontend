'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { MoreVertical, Edit, Trash2, Plus, Filter } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';
import { useApi } from '@/hooks/useApi';
import { useDebounce } from '@/hooks/debounceHook';
import Image from 'next/image';
import BulkUpload from './BulkUpload';
import ConfirmModal from '../ConfirmModal';

/* ---------------- TYPES ---------------- */

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;

  primaryImage: string;
  otherImages: string[];

  averageRating: number;
  reviewCount: number;
  views: number;

  isOrganic: boolean;
  isVerifiedVendor: boolean;

  category: string;
  categoryId?: string;
  status: string;
  rawStatus?: string;
  rawCategory?: any;

  createdAt: string;
  updatedAt: string;

  // UI helpers
  name: string;
  image: string;
}

  /* ---------------- HELPERS ---------------- */

const ITEMS_PER_PAGE = 10;

const normalizeStatus = (status: string) => {
  switch (status) {
    case 'published':
      return 'Active';
    case 'draft':
      return 'Draft';
    case 'out_of_stock':
      return 'Out of Stock';
    case 'archived':
      return 'Archived';
    case 'suspended':
      return 'Suspended';
    default:
      return status;
  }
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'Active':
      return 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-black';
    case 'Draft':
      return 'bg-gray-100 text-gray-800 border border-gray-300 font-black';
    case 'Out of Stock':
      return 'bg-rose-100 text-rose-800 border border-rose-300 font-black';
    default:
      return 'bg-gray-100 text-gray-700 border border-gray-200 font-black';
  }
};

const mapProduct = (p: any): Product => ({
  ...p,
  rawStatus: p.status,
  categoryId: p.categoryId || p.category?.id,
  rawCategory: p.category,
  name: p.title,
  image: p.primaryImage,
  category: p.category?.name || 'N/A',
  status: normalizeStatus(p.status),
});

/* ---------------- COMPONENT ---------------- */

const ProductList: React.FC<{ 
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
}> = ({ onAddProduct, onEditProduct }) => {
  
  const { user } = useAuth();
  const fetcher = useApi();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isBulkUploading, setIsBulkUploading] = useState(false);

 
  /* ---------------- FETCH PRODUCTS ---------------- */

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const offset = (page - 1) * ITEMS_PER_PAGE;

      const res = await fetcher(
        `/api/products/seller-products?limit=${ITEMS_PER_PAGE}&offset=${offset}&search=${debouncedSearch}`
      );

      const data = res?.data;

      const mapped = (data?.data || []).map(mapProduct);

      setProducts(mapped);
      setTotal(data?.total || 0);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, fetcher]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const [archiveConfirmId, setArchiveConfirmId] = useState<string | null>(null);

  /* ---------------- DELETE ---------------- */

  const handleDeleteProduct = async (id: string) => {
    try {
      await fetcher(`/api/products/${id}`, { method: 'DELETE' });

      toast.success('Product archived');

      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-[#111111]">Products</h1>
          <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mt-1">
            Manage your inventory and live product catalog
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setIsBulkUploading(true)}
            className="flex items-center gap-2 bg-white text-[#111111] border-2 border-[#111111] font-black uppercase text-xs tracking-wider px-5 py-2.5 rounded-none hover:bg-[#111111] hover:text-white transition-all duration-200"
          >
            Bulk Upload
          </button>
          <button
            onClick={onAddProduct}
            className="flex items-center gap-2 bg-[#f6c947] text-[#111111] border-2 border-[#f6c947] font-black uppercase text-xs tracking-wider px-5 py-2.5 rounded-none hover:bg-[#111111] hover:text-[#f6c947] hover:border-[#111111] transition-all duration-200 shadow-sm"
          >
            <Plus size={16} />
            Add Product
          </button>
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white rounded-none border border-gray-300 shadow-sm overflow-hidden">
        {/* TOP BAR */}
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50">
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 rounded-none px-3 py-1.5 text-xs font-semibold focus:border-[#111111] outline-none bg-white w-56"
            />
            <select className="border border-gray-300 rounded-none px-3 py-1.5 text-xs font-black uppercase tracking-wider text-gray-700 bg-white outline-none focus:border-[#111111]">
              <option>All Categories</option>
            </select>

            <select className="border border-gray-300 rounded-none px-3 py-1.5 text-xs font-black uppercase tracking-wider text-gray-700 bg-white outline-none focus:border-[#111111]">
              <option>Status: All</option>
            </select>
          </div>

          <p className="text-xs font-black uppercase tracking-wider text-gray-500">
            Showing {products.length} of {total} products
          </p>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-100 text-[11px] uppercase tracking-wider text-[#111111] font-black">
                <th className="px-6 py-3.5">Product</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Price</th>
                <th className="px-6 py-3.5">Stock</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {products.length === 0 && !loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 text-xs uppercase font-bold tracking-wider">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/80 transition-colors">
                    {/* PRODUCT */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-none overflow-hidden border border-gray-200 bg-gray-100 shrink-0">
                          <Image
                            src={product.image || '/placeholder.png'}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div>
                          <p className="font-bold text-[#111111] text-sm">
                            {product.name}
                          </p>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            ID: #{product.id.slice(0, 6)}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* CATEGORY */}
                    <td className="px-6 py-4 text-xs font-semibold text-gray-700">
                      {product.category}
                    </td>

                    {/* PRICE */}
                    <td className="px-6 py-4 font-black text-[#111111] text-sm">
                      ₦{Number(product.price).toFixed(2)}
                    </td>

                    {/* STOCK */}
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-bold ${
                          product.stock === 0
                            ? 'text-rose-600'
                            : 'text-gray-700'
                        }`}
                      >
                        {product.stock} in stock
                      </span>
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-none text-[10px] uppercase tracking-wider ${getStatusStyle(
                          product.status
                        )}`}
                      >
                        {product.status}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-1.5">
                        <button
                          onClick={() => onEditProduct(product)}
                          title="Edit product"
                          className="p-2 text-slate-700 hover:text-white bg-white hover:bg-[#111111] border border-gray-300 rounded-none transition-all duration-150 transform hover:scale-105 active:scale-95 shadow-sm"
                        >
                          <Edit size={14} />
                        </button>

                        <button
                          onClick={() => setArchiveConfirmId(product.id)}
                          title="Archive product"
                          className="p-2 text-rose-600 hover:text-white bg-white hover:bg-rose-600 border border-rose-300 rounded-none transition-all duration-150 transform hover:scale-105 active:scale-95 shadow-sm"
                        >
                          <Trash2 size={14} />
                        </button>

                        <button
                          title="More options"
                          className="p-2 text-slate-500 hover:text-[#111111] bg-white hover:bg-gray-100 border border-gray-300 rounded-none transition-all duration-150 transform hover:scale-105 active:scale-95 shadow-sm"
                        >
                          <MoreVertical size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="p-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
          <span className="text-xs font-black uppercase tracking-wider text-gray-500">
            Page {page} of {Math.max(1, Math.ceil(total / ITEMS_PER_PAGE))}
          </span>

          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="border border-gray-300 rounded-none px-3 py-1 text-xs font-black uppercase tracking-wider bg-white hover:bg-[#111111] hover:text-[#f6c947] disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-inherit transition-all"
            >
              Previous
            </button>

            <button
              disabled={page * ITEMS_PER_PAGE >= total}
              onClick={() => setPage((p) => p + 1)}
              className="border border-gray-300 rounded-none px-3 py-1 text-xs font-black uppercase tracking-wider bg-white hover:bg-[#111111] hover:text-[#f6c947] disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-inherit transition-all"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {isBulkUploading && (
        <BulkUpload 
          onClose={() => setIsBulkUploading(false)} 
          onSuccess={fetchProducts}
        />
      )}

      {/* CONFIRM ARCHIVE MODAL */}
      <ConfirmModal
        isOpen={Boolean(archiveConfirmId)}
        onClose={() => setArchiveConfirmId(null)}
        onConfirm={() => {
          if (archiveConfirmId) handleDeleteProduct(archiveConfirmId);
        }}
        title="Archive Product"
        message="Are you sure you want to archive this product? Archived products will no longer be visible on the public marketplace."
        confirmText="Archive Product"
        variant="warning"
      />
    </div>
  );
};

export default ProductList;