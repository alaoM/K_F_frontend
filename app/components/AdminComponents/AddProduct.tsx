import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Upload, X, Save, Plus, Layers, ChevronRight, Trash2, RotateCcw, Filter, Sparkles } from 'lucide-react';
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

  // ----------------- PRODUCT VARIATIONS STATE -----------------
  const isPreloadingRef = useRef<boolean>(false);
  const [hasVariants, setHasVariants] = useState<boolean>(false);
  const [enableColor, setEnableColor] = useState<boolean>(true);
  const [enableSize, setEnableSize] = useState<boolean>(true);

  const [colorList, setColorList] = useState<Array<{ name: string; hex: string }>>([
    { name: 'Black', hex: '#111111' },
    { name: 'White', hex: '#FFFFFF' },
  ]);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#000000');

  const [sizeList, setSizeList] = useState<string[]>(['S', 'M', 'L', 'XL']);
  const [newSizeName, setNewSizeName] = useState('');

  const [bulkStockVal, setBulkStockVal] = useState<number>(5);
  const [bulkPriceVal, setBulkPriceVal] = useState<string>('');
  const [matrixColorFilter, setMatrixColorFilter] = useState<string>('ALL');

  interface MatrixRow {
    id?: string;
    sku: string;
    color?: string;
    colorHex?: string;
    size?: string;
    stock: number;
    price?: number | '';
  }

  const [variantMatrix, setVariantMatrix] = useState<MatrixRow[]>([]);

  // Regenerate / restore all possible combinations (Cartesian product)
  const restoreAllCombinations = useCallback(() => {
    const activeColors = enableColor && colorList.length > 0 ? colorList : [{ name: '', hex: '' }];
    const activeSizes = enableSize && sizeList.length > 0 ? sizeList : [''];

    const newMatrix: MatrixRow[] = [];

    activeColors.forEach((col) => {
      activeSizes.forEach((sz) => {
        if (!col.name && !sz) return;

        // Try to find existing matching row to preserve customized stock/price
        const existing = variantMatrix.find(
          (m) => (col.name ? m.color === col.name : !m.color) && (sz ? m.size === sz : !m.size)
        );

        const skuParts = [
          'PRD',
          col.name ? col.name.slice(0, 3).toUpperCase() : '',
          sz ? sz.toUpperCase() : '',
        ].filter(Boolean);

        newMatrix.push({
          id: existing?.id,
          color: col.name || undefined,
          colorHex: col.hex || undefined,
          size: sz || undefined,
          stock: existing !== undefined ? existing.stock : 5,
          price: existing?.price !== undefined ? existing.price : '',
          sku: existing?.sku || skuParts.join('-'),
        });
      });
    });

    setVariantMatrix(newMatrix);
    toast.success('Restored all combination rows');
  }, [enableColor, colorList, enableSize, sizeList, variantMatrix]);

  // Synchronize Matrix when colorList or sizeList changes without overwriting user deletions
  useEffect(() => {
    if (!hasVariants) return;

    if (isPreloadingRef.current) {
      isPreloadingRef.current = false;
      return;
    }

    const activeColors = enableColor && colorList.length > 0 ? colorList : [{ name: '', hex: '' }];
    const activeSizes = enableSize && sizeList.length > 0 ? sizeList : [''];

    setVariantMatrix((prev) => {
      // 1. Remove rows for colors or sizes that were deleted from the option lists
      const filtered = prev.filter((row) => {
        const colorStillValid = !enableColor || !row.color || colorList.some((c) => c.name === row.color);
        const sizeStillValid = !enableSize || !row.size || sizeList.includes(row.size);
        return colorStillValid && sizeStillValid;
      });

      // 2. If prev was empty, generate initial matrix
      if (prev.length === 0) {
        const initialRows: MatrixRow[] = [];
        activeColors.forEach((col) => {
          activeSizes.forEach((sz) => {
            if (!col.name && !sz) return;
            const skuParts = [
              'PRD',
              col.name ? col.name.slice(0, 3).toUpperCase() : '',
              sz ? sz.toUpperCase() : '',
            ].filter(Boolean);

            initialRows.push({
              color: col.name || undefined,
              colorHex: col.hex || undefined,
              size: sz || undefined,
              stock: 5,
              price: '',
              sku: skuParts.join('-'),
            });
          });
        });
        return initialRows;
      }

      return filtered;
    });
  }, [hasVariants, enableColor, enableSize, colorList, sizeList]);

  // Sync total variant stock to main form stock field
  useEffect(() => {
    if (hasVariants && variantMatrix.length > 0) {
      const totalStock = variantMatrix.reduce((acc, row) => acc + (Number(row.stock) || 0), 0);
      setValue('stock', totalStock);
    }
  }, [hasVariants, variantMatrix, setValue]);

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
    const applyProductData = (prod: any) => {
      let initCatId =
        prod.categoryId ||
        prod.category?.id ||
        prod.rawCategory?.id ||
        '';

      if (!initCatId && prod.category && typeof prod.category === 'string') {
        const directMatch = flattenedCategories.find((c) => c.id === prod.category);
        if (directMatch) {
          initCatId = directMatch.id;
        } else {
          const nameMatch = flattenedCategories.find(
            (c) => c.name.toLowerCase() === prod.category.toLowerCase()
          );
          if (nameMatch) {
            initCatId = nameMatch.id;
          }
        }
      }

      const formStatus = normalizeStatusForForm(
        prod.rawStatus || prod.status
      );

      reset({
        title: prod.title || prod.name || '',
        description: prod.description || '',
        price: prod.price || 0,
        stock: prod.stock || 0,
        status: formStatus,
        category: initCatId,
        categoryId: initCatId,
      });

      if (initCatId) {
        setValue('category', initCatId, { shouldValidate: true });
        setValue('categoryId', initCatId);
      }
      setValue('status', formStatus);

      setPrimaryPreview(prod.primaryImage || prod.image || null);
      if (Array.isArray(prod.otherImages)) {
        setOtherPreviews(prod.otherImages);
      } else if (typeof prod.otherImages === 'string') {
        try {
          setOtherPreviews(JSON.parse(prod.otherImages));
        } catch {
          setOtherPreviews([]);
        }
      }

      // Preload Variants if available
      const vars = prod.variants || [];
      if (prod.hasVariants || vars.length > 0) {
        isPreloadingRef.current = true;
        setHasVariants(true);

        const loadedColors: Array<{ name: string; hex: string }> = [];
        const loadedSizes: string[] = [];

        vars.forEach((v: any) => {
          if (v.color && !loadedColors.some((c) => c.name.toLowerCase() === v.color.toLowerCase())) {
            loadedColors.push({ name: v.color, hex: v.colorHex || '#111111' });
          }
          if (v.size && !loadedSizes.includes(v.size)) {
            loadedSizes.push(v.size);
          }
        });

        if (loadedColors.length > 0) {
          setEnableColor(true);
          setColorList(loadedColors);
        } else {
          setEnableColor(false);
        }

        if (loadedSizes.length > 0) {
          setEnableSize(true);
          setSizeList(loadedSizes);
        } else {
          setEnableSize(false);
        }

        setVariantMatrix(
          vars.map((v: any) => ({
            id: v.id,
            sku: v.sku || '',
            color: v.color,
            colorHex: v.colorHex,
            size: v.size,
            stock: Number(v.stock) || 0,
            price: v.price !== undefined && v.price !== null ? v.price : '',
          }))
        );
      } else {
        setHasVariants(false);
      }
    };

    if (initialData) {
      applyProductData(initialData);

      // If initialData is missing variants or incomplete, fetch full product by ID
      if (initialData.id) {
        fetcher(`/api/products/${initialData.id}`)
          .then((res: any) => {
            if (res?.data) {
              applyProductData(res.data);
            }
          })
          .catch(() => {});
      }
    }
  }, [initialData, flattenedCategories, reset, setValue, fetcher]);

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
        stock: hasVariants && variantMatrix.length > 0
          ? variantMatrix.reduce((acc, r) => acc + (Number(r.stock) || 0), 0)
          : Number(data.stock),
        status: data.status.toLowerCase(),
        categoryId: chosenCategoryId,
        hasVariants,
        variantOptions: hasVariants
          ? {
              colors: enableColor ? colorList.map((c) => c.name) : [],
              sizes: enableSize ? sizeList : [],
            }
          : undefined,
        variants: hasVariants
          ? variantMatrix.map((r) => ({
              id: r.id,
              sku: r.sku,
              color: r.color,
              colorHex: r.colorHex,
              size: r.size,
              stock: Number(r.stock) || 0,
              price: r.price !== '' && r.price !== undefined ? Number(r.price) : undefined,
            }))
          : [],
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
                  {hasVariants ? 'Total Stock (Auto-Summed)' : 'Stock Quantity'}
                </label>
                <input
                  type="number"
                  disabled={hasVariants}
                  {...register('stock', {
                    required: 'Number of stock available is required',
                    valueAsNumber: true,
                    min: { value: 0, message: 'Cannot be negative' },
                  })}
                  placeholder="0"
                  className={`w-full border ${errors.stock ? 'border-red-500' : 'border-gray-300 focus:border-[#111111]'} ${hasVariants ? 'bg-gray-100 text-gray-700 cursor-not-allowed' : 'bg-white'} rounded-none px-4 py-2.5 outline-none text-xs font-semibold transition-colors`}
                />
                {errors.stock && <p className="text-rose-500 text-xs mt-1 font-bold">{errors.stock.message}</p>}
              </div>
            </div>

            {/* LIVE SELLER PAYOUT NOTIFICATION */}
            {numericPrice > 0 && (
              <div className="bg-gray-50 p-4 rounded-none border border-gray-300 space-y-2.5">
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
                  <span>Your Net Earnings Per Base Item Sold:</span>
                  <span className="text-emerald-700 font-black">
                    ₦{estimatedNetPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="text-[10px] text-gray-500 font-medium pt-1 border-t border-gray-200 flex items-center gap-1">
                  <span>💡 Note: The {(effectiveCommission * 100).toFixed(1)}% commission applies proportionally to each variation based on its custom price.</span>
                </div>
              </div>
            )}
          </div>

          {/* ---------------- VARIATIONS BUILDER ---------------- */}
          <div className="bg-white p-6 rounded-none border border-gray-300 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 flex-wrap gap-2">
              <div>
                <h3 className="font-black text-sm uppercase tracking-wider text-[#111111]">
                  Product Variations (Sizes & Colors)
                </h3>
                <p className="text-gray-500 text-xs mt-0.5 font-medium">
                  Configure specific colors, sizes, and individual stock levels.
                </p>
              </div>

              <label className="flex items-center gap-2 cursor-pointer bg-gray-50 border border-gray-300 hover:border-[#111111] px-3 py-1.5 transition-all">
                <input
                  type="checkbox"
                  checked={hasVariants}
                  onChange={(e) => setHasVariants(e.target.checked)}
                  className="w-4 h-4 accent-[#111111] cursor-pointer"
                />
                <span className="text-xs font-black uppercase tracking-wider text-[#111111]">
                  Enable Variations
                </span>
              </label>
            </div>

            {hasVariants && (
              <div className="space-y-6">
                {/* 1. COLOR OPTIONS */}
                <div className="p-4 bg-gray-50 border border-gray-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableColor}
                        onChange={(e) => setEnableColor(e.target.checked)}
                        className="w-4 h-4 accent-[#111111]"
                      />
                      <span className="text-xs font-black uppercase tracking-wider text-[#111111]">
                        1. Colors & Swatches
                      </span>
                    </label>
                    <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                      {colorList.length} Selected
                    </span>
                  </div>

                  {enableColor && (
                    <div className="space-y-3 pt-2">
                      {/* Active Color Chips */}
                      <div className="flex flex-wrap gap-2">
                        {colorList.map((col, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 px-2.5 py-1.5 bg-white border border-gray-300 rounded-none shadow-xs text-xs font-bold text-[#111111]"
                          >
                            <span
                              className="w-4 h-4 rounded-full border border-gray-400 shrink-0 inline-block shadow-xs"
                              style={{ backgroundColor: col.hex }}
                            />
                            <span>{col.name}</span>
                            <button
                              type="button"
                              onClick={() => setColorList((prev) => prev.filter((_, i) => i !== idx))}
                              className="text-gray-400 hover:text-rose-600 ml-1 p-0.5"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add Color Input */}
                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        <input
                          type="text"
                          placeholder="Color Name (e.g. Navy Blue)"
                          value={newColorName}
                          onChange={(e) => setNewColorName(e.target.value)}
                          className="border border-gray-300 px-3 py-1.5 text-xs font-semibold bg-white outline-none focus:border-[#111111]"
                        />
                        <div className="flex items-center gap-1.5 border border-gray-300 px-2 py-1 bg-white">
                          <input
                            type="color"
                            value={newColorHex}
                            onChange={(e) => setNewColorHex(e.target.value)}
                            className="w-6 h-6 border-0 bg-transparent cursor-pointer"
                          />
                          <span className="text-[10px] font-mono font-bold text-gray-600">{newColorHex}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (newColorName.trim()) {
                              setColorList((prev) => [
                                ...prev,
                                { name: newColorName.trim(), hex: newColorHex },
                              ]);
                              setNewColorName('');
                            }
                          }}
                          className="bg-[#111111] hover:bg-[#f6c947] text-white hover:text-[#111111] px-4 py-2 text-xs font-black uppercase tracking-wider transition-colors"
                        >
                          + Add Color
                        </button>
                      </div>

                      {/* Quick Presets */}
                      <div className="pt-2 border-t border-gray-200">
                        <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block mb-1.5">
                          Quick Presets:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { name: 'Black', hex: '#111111' },
                            { name: 'White', hex: '#FFFFFF' },
                            { name: 'Navy Blue', hex: '#000080' },
                            { name: 'Red', hex: '#DC2626' },
                            { name: 'Emerald', hex: '#046307' },
                            { name: 'Beige', hex: '#F5F5DC' },
                            { name: 'Brown', hex: '#8B4513' },
                            { name: 'Gold', hex: '#D4AF37' },
                          ].map((preset) => (
                            <button
                              key={preset.name}
                              type="button"
                              onClick={() => {
                                if (!colorList.some((c) => c.name.toLowerCase() === preset.name.toLowerCase())) {
                                  setColorList((prev) => [...prev, preset]);
                                }
                              }}
                              className="text-[11px] px-2 py-0.5 bg-white border border-gray-300 hover:border-[#111111] text-gray-800 font-bold flex items-center gap-1.5"
                            >
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-gray-300 shrink-0"
                                style={{ backgroundColor: preset.hex }}
                              />
                              <span>{preset.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. SIZE OPTIONS */}
                <div className="p-4 bg-gray-50 border border-gray-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableSize}
                        onChange={(e) => setEnableSize(e.target.checked)}
                        className="w-4 h-4 accent-[#111111]"
                      />
                      <span className="text-xs font-black uppercase tracking-wider text-[#111111]">
                        2. Sizes & Dimensions
                      </span>
                    </label>
                    <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                      {sizeList.length} Selected
                    </span>
                  </div>

                  {enableSize && (
                    <div className="space-y-3 pt-2">
                      {/* Active Size Pills */}
                      <div className="flex flex-wrap gap-2">
                        {sizeList.map((sz, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-300 text-xs font-bold text-[#111111]"
                          >
                            <span>{sz}</span>
                            <button
                              type="button"
                              onClick={() => setSizeList((prev) => prev.filter((_, i) => i !== idx))}
                              className="text-gray-400 hover:text-rose-600 ml-1 p-0.5"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add Custom Size */}
                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        <input
                          type="text"
                          placeholder="Custom Size (e.g. XXL or EU 43)"
                          value={newSizeName}
                          onChange={(e) => setNewSizeName(e.target.value)}
                          className="border border-gray-300 px-3 py-1.5 text-xs font-semibold bg-white outline-none focus:border-[#111111]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newSizeName.trim()) {
                              setSizeList((prev) => [...prev, newSizeName.trim().toUpperCase()]);
                              setNewSizeName('');
                            }
                          }}
                          className="bg-[#111111] hover:bg-[#f6c947] text-white hover:text-[#111111] px-4 py-2 text-xs font-black uppercase tracking-wider transition-colors"
                        >
                          + Add Size
                        </button>
                      </div>

                      {/* Quick Size Presets */}
                      <div className="pt-2 border-t border-gray-200 flex flex-wrap gap-2 items-center">
                        <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">
                          Add Presets:
                        </span>
                        <button
                          type="button"
                          onClick={() => setSizeList(['XS', 'S', 'M', 'L', 'XL', 'XXL'])}
                          className="text-[11px] px-2.5 py-1 bg-white border border-gray-300 hover:border-[#111111] text-[#111111] font-bold"
                        >
                          + Standard (XS - XXL)
                        </button>
                        <button
                          type="button"
                          onClick={() => setSizeList(['38', '39', '40', '41', '42', '43', '44', '45'])}
                          className="text-[11px] px-2.5 py-1 bg-white border border-gray-300 hover:border-[#111111] text-[#111111] font-bold"
                        >
                          + Shoes (EU 38 - 45)
                        </button>
                        <button
                          type="button"
                          onClick={() => setSizeList(['One Size'])}
                          className="text-[11px] px-2.5 py-1 bg-white border border-gray-300 hover:border-[#111111] text-[#111111] font-bold"
                        >
                          + One Size
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. VARIANT INVENTORY & PRICING MATRIX TABLE */}
                {variantMatrix.length > 0 && (
                  <div className="space-y-4 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-[#111111] flex items-center gap-2">
                          <span>3. Inventory & Pricing Matrix ({variantMatrix.length} Active Combinations)</span>
                        </h4>
                        <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                          Delete combinations you don't produce, or set stock to 0 for temporarily sold out items.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={restoreAllCombinations}
                        className="text-xs font-bold text-gray-700 hover:text-[#111111] flex items-center gap-1.5 border border-gray-300 hover:border-gray-500 bg-white px-3 py-1.5 transition-colors cursor-pointer"
                        title="Recreate any missing/deleted color-size combination rows"
                      >
                        <RotateCcw size={13} />
                        <span>Restore All Combinations</span>
                      </button>
                    </div>

                    {/* COLOR FILTER TABS (FOR MULTI-COLOR MANAGEMENT) */}
                    {colorList.length > 1 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 mr-1 flex items-center gap-1">
                          <Filter size={11} /> Filter:
                        </span>
                        <button
                          type="button"
                          onClick={() => setMatrixColorFilter('ALL')}
                          className={`text-xs px-2.5 py-1 font-bold transition-colors cursor-pointer ${
                            matrixColorFilter === 'ALL'
                              ? 'bg-[#111111] text-white'
                              : 'bg-white border border-gray-300 text-gray-700 hover:border-gray-500'
                          }`}
                        >
                          All Colors ({variantMatrix.length})
                        </button>
                        {colorList.map((col) => {
                          const count = variantMatrix.filter((m) => m.color === col.name).length;
                          const isSelected = matrixColorFilter === col.name;
                          return (
                            <button
                              key={col.name}
                              type="button"
                              onClick={() => setMatrixColorFilter(col.name)}
                              className={`text-xs px-2.5 py-1 font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-[#111111] text-white'
                                  : 'bg-white border border-gray-300 text-gray-700 hover:border-gray-500'
                              }`}
                            >
                              <span
                                className="w-2 h-2 rounded-full border border-gray-300 shrink-0"
                                style={{ backgroundColor: col.hex }}
                              />
                              <span>{col.name}</span>
                              <span className={`text-[10px] ${isSelected ? 'text-gray-300' : 'text-gray-400'}`}>
                                ({count})
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* BULK ACTIONS TOOLBAR */}
                    <div className="p-3 bg-gray-50 border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Bulk Stock */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] text-gray-600 font-bold uppercase">
                          Bulk Stock {matrixColorFilter !== 'ALL' ? `(${matrixColorFilter})` : ''}:
                        </span>
                        <input
                          type="number"
                          min="0"
                          value={bulkStockVal}
                          onChange={(e) => setBulkStockVal(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-16 border border-gray-300 px-2 py-1 text-xs font-bold text-center bg-white outline-none focus:border-[#111111]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setVariantMatrix((prev) =>
                              prev.map((row) =>
                                matrixColorFilter === 'ALL' || row.color === matrixColorFilter
                                  ? { ...row, stock: bulkStockVal }
                                  : row
                              )
                            );
                            toast.success(`Updated stock to ${bulkStockVal}`);
                          }}
                          className="text-xs bg-[#111111] hover:bg-[#f6c947] hover:text-[#111111] text-white font-black uppercase px-3 py-1 transition-colors cursor-pointer"
                        >
                          Apply Stock
                        </button>
                      </div>

                      {/* Bulk Price */}
                      <div className="flex items-center gap-2 flex-wrap md:justify-end">
                        <span className="text-[11px] text-gray-600 font-bold uppercase">
                          Bulk Price {matrixColorFilter !== 'ALL' ? `(${matrixColorFilter})` : ''}:
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Base Price"
                          value={bulkPriceVal}
                          onChange={(e) => setBulkPriceVal(e.target.value)}
                          className="w-24 border border-gray-300 px-2 py-1 text-xs font-bold text-center bg-white outline-none focus:border-[#111111]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const val = bulkPriceVal === '' ? '' : parseFloat(bulkPriceVal) || 0;
                            setVariantMatrix((prev) =>
                              prev.map((row) =>
                                matrixColorFilter === 'ALL' || row.color === matrixColorFilter
                                  ? { ...row, price: val }
                                  : row
                              )
                            );
                            toast.success(`Updated price across ${matrixColorFilter === 'ALL' ? 'all' : matrixColorFilter} variants`);
                          }}
                          className="text-xs bg-[#f6c947] hover:bg-[#111111] hover:text-white text-[#111111] font-black uppercase px-3 py-1 transition-colors cursor-pointer"
                        >
                          Apply Price
                        </button>
                      </div>
                    </div>

                    {/* TABLE */}
                    <div className="overflow-x-auto border border-gray-300 bg-white">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-gray-100 border-b border-gray-300 text-[10px] font-black uppercase tracking-wider text-gray-600">
                            <th className="p-3">Variant Option</th>
                            <th className="p-3 w-32">Stock Qty</th>
                            <th className="p-3 w-44">Custom Price (₦)</th>
                            <th className="p-3 w-36">SKU Code</th>
                            <th className="p-3 w-16 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {variantMatrix
                            .map((row, originalIdx) => ({ row, originalIdx }))
                            .filter(({ row }) => matrixColorFilter === 'ALL' || row.color === matrixColorFilter)
                            .map(({ row, originalIdx }) => (
                              <tr key={originalIdx} className="hover:bg-gray-50 transition-colors">
                                <td className="p-3">
                                  <div className="flex items-center gap-2">
                                    {row.color && (
                                      <div className="flex items-center gap-1.5">
                                        <span
                                          className="w-3.5 h-3.5 rounded-full border border-gray-400 shrink-0"
                                          style={{ backgroundColor: row.colorHex || '#111111' }}
                                        />
                                        <span className="font-bold text-[#111111]">{row.color}</span>
                                      </div>
                                    )}
                                    {row.color && row.size && <span className="text-gray-400">/</span>}
                                    {row.size && (
                                      <span className="bg-gray-100 px-2 py-0.5 font-mono font-bold text-[#111111] border border-gray-300">
                                        {row.size}
                                      </span>
                                    )}
                                    {Number(row.stock) === 0 && (
                                      <span className="ml-1 text-[9px] font-black uppercase tracking-wider bg-rose-100 text-rose-700 px-1.5 py-0.5">
                                        Out of stock
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="p-3">
                                  <input
                                    type="number"
                                    min="0"
                                    value={row.stock}
                                    onChange={(e) => {
                                      const val = Math.max(0, parseInt(e.target.value) || 0);
                                      setVariantMatrix((prev) =>
                                        prev.map((r, i) => (i === originalIdx ? { ...r, stock: val } : r))
                                      );
                                    }}
                                    className="w-full border border-gray-300 px-2.5 py-1 font-bold text-[#111111] text-xs outline-none focus:border-[#111111]"
                                  />
                                </td>
                                <td className="p-3">
                                  <input
                                    type="number"
                                    step="0.01"
                                    placeholder="Base Price"
                                    value={row.price}
                                    onChange={(e) => {
                                      const val = e.target.value === '' ? '' : parseFloat(e.target.value) || 0;
                                      setVariantMatrix((prev) =>
                                        prev.map((r, i) => (i === originalIdx ? { ...r, price: val } : r))
                                      );
                                    }}
                                    className="w-full border border-gray-300 px-2.5 py-1 font-medium text-xs outline-none focus:border-[#111111]"
                                  />
                                  {/* LIVE NET PAYOUT FOR VARIANT */}
                                  {(() => {
                                    const hasCustomPrice = row.price !== '' && row.price !== undefined;
                                    const effectiveVariantPrice = hasCustomPrice ? Number(row.price) : numericPrice;
                                    if (effectiveVariantPrice <= 0) return null;
                                    const fee = effectiveVariantPrice * effectiveCommission;
                                    const net = effectiveVariantPrice - fee;
                                    return (
                                      <div className="mt-1 flex items-center justify-between text-[10px] leading-tight">
                                        <span className="font-bold text-emerald-700">
                                          Net: ₦{Math.round(net).toLocaleString()}
                                        </span>
                                        <span className="text-gray-400 font-medium">
                                          (-₦{Math.round(fee).toLocaleString()})
                                        </span>
                                      </div>
                                    );
                                  })()}
                                </td>
                                <td className="p-3">
                                  <input
                                    type="text"
                                    value={row.sku}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setVariantMatrix((prev) =>
                                        prev.map((r, i) => (i === originalIdx ? { ...r, sku: val } : r))
                                      );
                                    }}
                                    className="w-full border border-gray-300 px-2.5 py-1 font-mono text-[11px] outline-none focus:border-[#111111]"
                                  />
                                </td>
                                <td className="p-3 text-center">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setVariantMatrix((prev) => prev.filter((_, i) => i !== originalIdx));
                                      toast.info(`Removed ${row.color || ''} ${row.size || ''} combination`);
                                    }}
                                    title="Exclude this combination (Not produced)"
                                    className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="p-3 bg-gray-50 border border-gray-300 flex justify-between items-center text-xs font-black uppercase tracking-wider text-[#111111]">
                      <span>Total Inventory Count Across Active Variations:</span>
                      <span className="text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-none">
                        {variantMatrix.reduce((sum, r) => sum + (Number(r.stock) || 0), 0)} Units in Stock
                      </span>
                    </div>
                  </div>
                )}
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