'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { MoreVertical, Edit, Trash2, Plus, Filter } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';
import { useApi } from '@/hooks/useApi';
import { useDebounce } from '@/hooks/debounceHook';
import Image from 'next/image';
import BulkUpload from './BulkUpload';

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
  status: string;

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
      return 'bg-emerald-100 text-emerald-700';
    case 'Draft':
      return 'bg-gray-100 text-gray-600';
    case 'Out of Stock':
      return 'bg-rose-100 text-rose-700';
    default:
      return 'bg-gray-100 text-gray-500';
  }
};

const mapProduct = (p: any): Product => ({
  ...p,
  name: p.title,
  image: p.primaryImage,
  category: p.category?.name || 'N/A',
  status: normalizeStatus(p.status),
});

/* ---------------- COMPONENT ---------------- */

const ProductList: React.FC<{ 
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;  // ✅ NEW
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
    if (user?.hasCreatedStore) {
      fetchProducts();
    }
  }, [fetchProducts, user]);

  /* ---------------- DELETE ---------------- */

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to archive this product?')) return;

    try {
      await fetcher(`/api/products/${id}`, { method: 'DELETE' });

      toast.success('Product deleted');

      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#243e6b]">Products</h1>
          <p className="text-gray-500 text-sm">
            Manage your inventory and product listings.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setIsBulkUploading(true)}
            className="flex items-center gap-2 bg-white text-[#243e6b] border border-[#243e6b] font-bold px-6 py-2 rounded-md hover:bg-gray-50"
          >
            Bulk Upload
          </button>
          <button
            onClick={onAddProduct}
            className="flex items-center gap-2 bg-[#f6c947] text-[#243e6b] font-bold px-6 py-2 rounded-md hover:bg-[#f6c947]/90"
          >
            <Plus size={18} />
            Add Product
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border border-[#e2e2e2] shadow-sm overflow-hidden">
        {/* TOP BAR */}
        <div className="p-4 border-b flex justify-between bg-gray-50/50">
          <div className="flex gap-4">
            <select className="border rounded-md px-4 py-1.5 text-sm">
              <option>All Categories</option>
            </select>

            <select className="border rounded-md px-4 py-1.5 text-sm">
              <option>Status: All</option>
            </select>
          </div>

          <p className="text-sm text-gray-500">
            Showing {products.length} of {total}
          </p>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-xs uppercase text-gray-500 font-bold">
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 group">
                  {/* PRODUCT */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden border">
                        <Image
                          src={product.image || '/placeholder.png'}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div>
                        <p className="font-bold text-[#243e6b] text-sm">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          ID: #{product.id.slice(0, 6)}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* CATEGORY */}
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {product.category}
                  </td>

                  {/* PRICE */}
                  <td className="px-6 py-4 font-bold text-[#243e6b]">
                    ₦{Number(product.price).toFixed(2)}
                  </td>

                  {/* STOCK */}
                  <td className="px-6 py-4">
                    <span
                      className={`text-sm font-medium ${
                        product.stock === 0
                          ? 'text-rose-600'
                          : 'text-gray-600'
                      }`}
                    >
                      {product.stock} in stock
                    </span>
                  </td>

                  {/* STATUS */}
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusStyle(
                        product.status
                      )}`}
                    >
                      {product.status}
                    </span>
                  </td>

                  {/* ACTIONS */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100">
                      <button
                         onClick={() => onEditProduct(product)} 
                        className="p-1.5 text-gray-400 hover:text-[#243e6b]"
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-600"
                      >
                        <Trash2 size={16} />
                      </button>

                      <button className="p-1.5 text-gray-400 hover:text-gray-600">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="p-4 flex justify-end gap-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="text-sm disabled:opacity-50"
          >
            Previous
          </button>

          <span className="font-bold text-sm">{page}</span>

          <button
            disabled={page * ITEMS_PER_PAGE >= total}
            onClick={() => setPage((p) => p + 1)}
            className="text-sm"
          >
            Next
          </button>
        </div>
      </div>

      {isBulkUploading && (
        <BulkUpload 
          onClose={() => setIsBulkUploading(false)} 
          onSuccess={fetchProducts}
        />
      )}
    </div>
  );
};

export default ProductList;