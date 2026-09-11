'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Upload, X, Save, Plus, Layers, ChevronRight } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import Image from 'next/image';
import { toast } from 'react-toastify';

export interface CategoryNode {
  id: string;
  name: string;
  icon?: string | null;
  commissionPercent?: number | null;
  parent?: { id?: string; name?: string; commissionPercent?: number | null } | null;
  children?: CategoryNode[];
}

export interface FlattenedCategory {
  id: string;
  name: string;
  depth: number;
  label: string;
  path: string;
  commissionPercent?: number | null;
  effectiveCommission: number;
  hasChildren: boolean;
  children?: CategoryNode[];
}

interface ProductFormData {
  title: string;
  description: string;
  category: string;
  categoryId: string;
  price: number;
  stock: number;
  status: string;
}

const flattenCategoryTree = (
  nodes: CategoryNode[],
  depth = 1,
  parentPath = '',
  inheritedCommission: number | null = null
): FlattenedCategory[] => {
  let result: FlattenedCategory[] = [];
  if (!Array.isArray(nodes)) return result;

  for (const node of nodes) {
    const currentPath = parentPath ? `${parentPath} > ${node.name}` : node.name;
    const currentCommission =
      node.commissionPercent !== null && node.commissionPercent !== undefined
        ? node.commissionPercent
        : inheritedCommission;
    const effectiveCommission = currentCommission ?? 0.05;

    const indent = depth > 1 ? `${'— '.repeat(depth - 1)} ` : '';
    const hasChildren = Boolean(node.children && node.children.length > 0);

    result.push({
      id: node.id,
      name: node.name,
      depth,
      label: `${indent}${node.name}${depth > 1 ? ` (Subcategory)` : ''}`,
      path: currentPath,
      commissionPercent: node.commissionPercent,
      effectiveCommission,
      hasChildren,
      children: node.children,
    });

    if (hasChildren) {
      result = result.concat(
        flattenCategoryTree(node.children!, depth + 1, currentPath, currentCommission)
      );
    }
  }
  return result;
};

const AddProduct: React.FC<{
  onBack: () => void;
  initialData?: any;
}> = ({ onBack, initialData }) => {
  const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm<ProductFormData>();

  const fetcher = useApi();
  const [rawCategories, setRawCategories] = useState<CategoryNode[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Flattened categories for fast lookup & hierarchical dropdown
  const flattenedCategories = useMemo(() => {
    return flattenCategoryTree(rawCategories);
  }, [rawCategories]);

  // Watch price and category for live earnings calculator
  const watchedPrice = watch('price');
  const watchedCategory = watch('category');

  // Compute selected category's effective commission and breadcrumbs
  const selectedCategoryObj = useMemo(() => {
    return flattenedCategories.find((c) => c.id === watchedCategory);
  }, [flattenedCategories, watchedCategory]);

  const effectiveCommission = selectedCategoryObj?.effectiveCommission ?? 0.05;

  const numericPrice = Number(watchedPrice) || 0;
  const platformFeeAmount = numericPrice * effectiveCommission;
  const estimatedNetPayout = Math.max(0, numericPrice - platformFeeAmount);

  // Immediate child subcategories for current selected category
  const directChildSubcategories = useMemo(() => {
    if (!selectedCategoryObj?.children || selectedCategoryObj.children.length === 0) return [];
    return selectedCategoryObj.children;
  }, [selectedCategoryObj]);

  // Images
  const [primaryFile, setPrimaryFile] = useState<File | null>(null);
  const [primaryPreview, setPrimaryPreview] = useState<string | null>(null);

  const [otherFiles, setOtherFiles] = useState<File[]>([]);
  const [otherPreviews, setOtherPreviews] = useState<string[]>([]);

  /* ---------------- FETCH CATEGORIES ---------------- */
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetcher('/api/categories');
      setRawCategories(res?.data || []);
    } catch {
      toast.error('Failed to load categories');
    }
  }, [fetcher]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

const normalizeStatusForForm = (status?: string): string => {
  if (!status) return 'published';
  const s = status.toLowerCase();
  if (s === 'active' || s === 'published') return 'published';
  if (s === 'draft') return 'draft';
  if (s === 'out of stock' || s === 'out_of_stock') return 'out_of_stock';
  if (s === 'archived') return 'archived';
  if (s === 'suspended') return 'suspended';
  return s;
};

  useEffect(() => {
    if (initialData) {
      let initCatId =
        initialData.categoryId ||
        initialData.category?.id ||
        initialData.rawCategory?.id ||
        '';

      if (!initCatId && initialData.category && typeof initialData.category === 'string') {
        const directMatch = flattenedCategories.find((c) => c.id === initialData.category);
        if (directMatch) {
          initCatId = directMatch.id;
        } else {
          const nameMatch = flattenedCategories.find(
            (c) => c.name.toLowerCase() === initialData.category.toLowerCase()
          );
          if (nameMatch) {
            initCatId = nameMatch.id;
          }
        }
      }

      const formStatus = normalizeStatusForForm(
        initialData.rawStatus || initialData.status
      );

      reset({
        title: initialData.title || initialData.name || '',
        description: initialData.description || '',
        price: initialData.price || 0,
        stock: initialData.stock || 0,
        status: formStatus,
        category: initCatId,
        categoryId: initCatId,
      });

      if (initCatId) {
        setValue('category', initCatId, { shouldValidate: true });
        setValue('categoryId', initCatId);
      }
      setValue('status', formStatus);

      setPrimaryPreview(initialData.primaryImage || initialData.image || null);
      if (Array.isArray(initialData.otherImages)) {
        setOtherPreviews(initialData.otherImages);
      } else if (typeof initialData.otherImages === 'string') {
        try {
          setOtherPreviews(JSON.parse(initialData.otherImages));
        } catch {
          setOtherPreviews([]);
        }
      }
    }
  }, [initialData, flattenedCategories, reset, setValue]);

  /* ---------------- IMAGE UPLOAD ---------------- */
  const uploadPrimaryImage = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append('file', file);

    const res = await fetch('/api/upload/upload-single-image', {
      method: 'POST',
      body: fd,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.message || 'Primary image upload failed');
    }

    return data?.url || data?.data?.url || '';
  };

  const uploadOtherImages = async (files: File[]): Promise<string[]> => {
    if (!files.length) return [];

    const fd = new FormData();
    files.forEach((file) => fd.append('files', file));

    const res = await fetch('/api/upload/upload-multiple-images', {
      method: 'POST',
      body: fd,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || 'Gallery upload failed');
    }

    if (Array.isArray(data)) {
      return data.map((item: any) => item?.url || item);
    }
    if (data && Array.isArray(data.urls)) {
      return data.urls;
    }
    if (data && Array.isArray(data.data)) {
      return data.data.map((item: any) => item?.url || item);
    }

    throw new Error(data?.message || 'Failed to upload gallery images');
  };

  /* ---------------- HANDLERS ---------------- */
  const handlePrimaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPrimaryFile(file);
    setPrimaryPreview(URL.createObjectURL(file));
  };

  const handleOtherImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setOtherFiles((prev) => [...prev, ...files]);

    const previews = files.map((file) => URL.createObjectURL(file));
    setOtherPreviews((prev) => [...prev, ...previews]);
  };

  const removeOtherImage = (index: number) => {
    setOtherPreviews((prev) => prev.filter((_, i) => i !== index));
    setOtherFiles((prev) => prev.filter((_, i) => i !== index));
  };

  /* ---------------- SUBMIT ---------------- */
  const onSubmit = async (data: ProductFormData) => {
    try {
      setIsSubmitting(true);

      const chosenCategoryId = data.category || data.categoryId;
      if (!chosenCategoryId) {
        toast.error('Please select a category or subcategory');
        return;
      }

      const payload = {
        ...data,
        price: Number(data.price),
        stock: Number(data.stock),
        status: data.status.toLowerCase(),
        categoryId: chosenCategoryId,
      };

      let primaryUrl = initialData?.primaryImage || '';
      let galleryUrls = initialData?.otherImages || [];

      if (primaryFile) {
        primaryUrl = await uploadPrimaryImage(primaryFile);
      }

      if (otherFiles.length) {
        const newlyUploaded = await uploadOtherImages(otherFiles);
        galleryUrls = [...galleryUrls, ...newlyUploaded];
      }

      const url = initialData
        ? `/api/products/${initialData.id}` // UPDATE
        : `/api/products`; // CREATE

      const method = initialData ? 'PATCH' : 'POST';

      await fetcher(url, {
        method,
        body: JSON.stringify({
          ...payload,
          primaryImage: primaryUrl,
          otherImages: galleryUrls,
        }),
      });

      toast.success(initialData ? 'Product updated!' : 'Product created!');
      reset();
      onBack();
    } catch (err: any) {
      toast.error(err.message || 'Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-[#111111] bg-gray-100 rounded-none text-[#111111] hover:text-[#f6c947] border border-gray-300 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-[#111111]">
              {initialData ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mt-0.5">
              {initialData ? 'Update catalog specifications and pricing' : 'Create a new catalog item for your store'}
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="flex items-center gap-2 bg-[#f6c947] hover:bg-[#111111] hover:text-[#f6c947] transition-all text-[#111111] font-black uppercase text-xs tracking-wider px-5 py-2.5 rounded-none border-2 border-[#f6c947] hover:border-[#111111] disabled:opacity-50 shadow-sm"
        >
          <Save size={16} />
          {isSubmitting ? 'Saving...' : initialData ? 'Update Product' : 'Save Product'}
        </button>
      </div>

      {/* FORM */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-none border border-gray-300 shadow-sm space-y-6">
            <h3 className="font-black text-sm uppercase tracking-wider text-[#111111] border-b border-gray-200 pb-3">
              General Information
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-[#111111]">
                  Product Name
                </label>
                <input
                  {...register('title', { required: 'Title is required' })}
                  placeholder="e.g. Premium Cotton T-Shirt"
                  className={`w-full border ${errors.title ? 'border-red-500' : 'border-gray-300 focus:border-[#111111]'} rounded-none px-4 py-2.5 outline-none text-xs font-semibold transition-colors bg-white`}
                />
                {errors.title && <p className="text-rose-500 text-xs mt-1 font-bold">{errors.title.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-[#111111]">
                  Description
                </label>
                <textarea
                  {...register('description', {
                    minLength: { value: 20, message: 'Description must be at least 20 characters' },
                    maxLength: { value: 2000, message: 'Max length is 2000 characters' },
                  })}
                  rows={6}
                  placeholder="Describe your product in detail..."
                  className={`w-full border ${errors.description ? 'border-red-500' : 'border-gray-300 focus:border-[#111111]'} rounded-none px-4 py-2.5 outline-none text-xs font-semibold transition-colors bg-white`}
                />
                {errors.description && <p className="text-rose-500 text-xs mt-1 font-bold">{errors.description.message}</p>}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-none border border-gray-300 shadow-sm space-y-6">
            <h3 className="font-black text-sm uppercase tracking-wider text-[#111111] border-b border-gray-200 pb-3">
              Pricing & Inventory
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-[#111111]">
                  Base Price (₦)
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('price', {
                    required: 'Price is required',
                    valueAsNumber: true,
                    min: { value: 0.01, message: 'Must be greater than 0' },
                  })}
                  placeholder="0.00"
                  className={`w-full border ${errors.price ? 'border-red-500' : 'border-gray-300 focus:border-[#111111]'} rounded-none px-4 py-2.5 outline-none text-xs font-semibold transition-colors bg-white`}
                />
                {errors.price && <p className="text-rose-500 text-xs mt-1 font-bold">{errors.price.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-[#111111]">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  {...register('stock', {
                    required: 'Number of stock available is required',
                    valueAsNumber: true,
                    min: { value: 0, message: 'Cannot be negative' },
                  })}
                  placeholder="0"
                  className={`w-full border ${errors.stock ? 'border-red-500' : 'border-gray-300 focus:border-[#111111]'} rounded-none px-4 py-2.5 outline-none text-xs font-semibold transition-colors bg-white`}
                />
                {errors.stock && <p className="text-rose-500 text-xs mt-1 font-bold">{errors.stock.message}</p>}
              </div>
            </div>

            {/* LIVE SELLER PAYOUT NOTIFICATION */}
            {numericPrice > 0 && (
              <div className="bg-gray-50 p-4 rounded-none border border-gray-300 space-y-2">
                <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider text-[#111111]">
                  <span className="flex items-center gap-1.5">
                    🏷️ Category Commission {selectedCategoryObj ? `(${selectedCategoryObj.name})` : '(Default Rate)'}:
                  </span>
                  <span className="bg-[#f6c947] text-[#111111] px-2.5 py-0.5 rounded-none font-black text-xs font-mono">
                    {(effectiveCommission * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold text-gray-600">
                  <span>Platform Fee per item sold:</span>
                  <span className="text-rose-600 font-bold">
                    -₦{platformFeeAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200 text-xs sm:text-sm font-black uppercase tracking-wider text-[#111111]">
                  <span>Your Net Earnings Per Item Sold:</span>
                  <span className="text-emerald-700 font-black">
                    ₦{estimatedNetPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-none border border-gray-300 shadow-sm space-y-6">
            <h3 className="font-black text-sm uppercase tracking-wider text-[#111111] border-b border-gray-200 pb-3">
              Product Status & Category
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-[#111111]">
                  Status
                </label>
                <select
                  {...register('status', { required: true })}
                  className={`w-full border ${errors.status ? 'border-red-500' : 'border-gray-300 focus:border-[#111111]'} rounded-none px-4 py-2.5 outline-none font-semibold text-xs transition-colors bg-white`}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="out_of_stock">Out of Stock</option>
                  <option value="archived">Archived</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              {/* HIERARCHICAL CATEGORY SELECTOR */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-[#111111] flex items-center justify-between">
                  <span>Category / Subcategory</span>
                  {selectedCategoryObj && (
                    <span className="text-[10px] font-black uppercase tracking-wider bg-gray-100 text-[#111111] px-2 py-0.5 border border-gray-300">
                      Gen {selectedCategoryObj.depth}
                    </span>
                  )}
                </label>
                <select
                  {...register('category', { required: 'Please select a category' })}
                  className={`w-full ${errors.category ? 'border-red-500' : 'border-gray-300 focus:border-[#111111]'} border rounded-none px-4 py-2.5 outline-none transition-colors bg-white text-xs font-semibold`}
                >
                  <option value="">Select Category or Subcategory</option>
                  {flattenedCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-rose-500 text-xs mt-1 font-bold">{errors.category.message}</p>
                )}

                {/* ACTIVE CATEGORY PATH BREADCRUMB */}
                {selectedCategoryObj && (
                  <div className="mt-2.5 p-3 bg-gray-50 border border-gray-300 rounded-none text-xs space-y-1.5">
                    <div className="text-gray-500 font-black uppercase tracking-wider text-[10px] flex items-center gap-1">
                      <Layers size={13} className="text-[#111111]" />
                      <span>Category Hierarchy:</span>
                    </div>
                    <div className="font-bold text-[#111111] flex items-center flex-wrap gap-1">
                      {selectedCategoryObj.path.split(' > ').map((segment, idx, arr) => (
                        <React.Fragment key={idx}>
                          <span
                            className={
                              idx === arr.length - 1
                                ? 'bg-[#111111] text-[#f6c947] px-2 py-0.5 rounded-none font-black text-xs uppercase tracking-wider'
                                : 'text-gray-700'
                            }
                          >
                            {segment}
                          </span>
                          {idx < arr.length - 1 && (
                            <ChevronRight size={12} className="text-gray-400 inline" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}

                {/* QUICK SUB-CATEGORY DRILL-DOWN CHIPS */}
                {directChildSubcategories.length > 0 && (
                  <div className="mt-3 space-y-1.5 pt-2 border-t border-gray-200">
                    <label className="text-[11px] font-black uppercase tracking-wider text-gray-600 block">
                      Subcategories under &ldquo;{selectedCategoryObj?.name}&rdquo;:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {directChildSubcategories.map((subcat) => (
                        <button
                          key={subcat.id}
                          type="button"
                          onClick={() => {
                            setValue('category', subcat.id, { shouldValidate: true });
                          }}
                          className="text-xs px-2.5 py-1 bg-white hover:bg-[#111111] border border-gray-300 hover:border-[#111111] text-[#111111] hover:text-[#f6c947] rounded-none font-bold transition flex items-center gap-1"
                        >
                          <Plus size={11} />
                          <span>{subcat.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-none border border-gray-300 shadow-sm space-y-6">
            <h3 className="font-black text-sm uppercase tracking-wider text-[#111111] border-b border-gray-200 pb-3">
              Product Images
            </h3>

            <div className="space-y-5">
              {/* PRIMARY IMAGE */}
              <label className="block cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePrimaryChange}
                  className="hidden"
                />

                <div className="border-2 border-dashed border-gray-300 rounded-none p-6 flex flex-col items-center justify-center h-36 text-center hover:border-[#111111] hover:bg-gray-50 transition-all group relative overflow-hidden">
                  {primaryPreview ? (
                    <>
                      <Image
                        src={primaryPreview}
                        alt="Primary"
                        fill
                        className="object-cover rounded-none"
                      />
                      <div className="absolute inset-0 bg-[#111111]/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                        <p className="text-[#f6c947] text-xs font-black uppercase tracking-wider">Change Image</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-none bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 group-hover:text-[#111111] group-hover:bg-[#f6c947] group-hover:border-[#f6c947] transition-all mb-2">
                        <Upload size={20} />
                      </div>
                      <p className="text-xs font-black uppercase tracking-wider text-[#111111]">
                        Upload Primary Image
                      </p>
                      <p className="text-[11px] text-gray-500 mt-1 font-medium">
                        PNG, JPG or WEBP (Max 2MB)
                      </p>
                    </>
                  )}
                </div>
              </label>

              {/* GALLERY */}
              <div className="grid grid-cols-3 gap-3">
                {/* ADD MORE */}
                <label className="aspect-square border-2 border-dashed border-gray-300 rounded-none flex flex-col items-center justify-center text-gray-500 hover:border-[#111111] hover:text-[#111111] hover:bg-gray-50 transition cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleOtherImagesChange}
                    className="hidden"
                  />
                  <Plus size={20} />
                  <span className="text-[10px] mt-1 font-black uppercase tracking-wider">Add</span>
                </label>

                {/* PREVIEWS */}
                {otherPreviews.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-none overflow-hidden border border-gray-300 group bg-gray-100"
                  >
                    <Image
                      src={url}
                      alt="Gallery"
                      fill
                      className="object-cover"
                    />

                    {/* HOVER OVERLAY */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition">
                      <button
                        type="button"
                        onClick={() => removeOtherImage(idx)}
                        className="absolute top-1 right-1 bg-rose-600 text-white rounded-none p-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;