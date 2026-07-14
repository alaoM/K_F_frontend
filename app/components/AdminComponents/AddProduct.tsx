'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Upload, X, Save, Plus } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import Image from 'next/image';
import { toast } from 'react-toastify';

interface Category {
  id: string;
  name: string;
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

const AddProduct: React.FC<{
  onBack: () => void;
  initialData?: any;  
}> = ({ onBack, initialData }) => {

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProductFormData>();

  const fetcher = useApi();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Images
  const [primaryFile, setPrimaryFile] = useState<File | null>(null);
  const [primaryPreview, setPrimaryPreview] = useState<string | null>(null);

  const [otherFiles, setOtherFiles] = useState<File[]>([]);
  const [otherPreviews, setOtherPreviews] = useState<string[]>([]);

  /* ---------------- FETCH CATEGORIES ---------------- */
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetcher("/api/categories");
      setCategories(res?.data || []);
    } catch {
      toast.error("Failed to load categories");
    }
  }, [fetcher]);

  useEffect(() => {
    fetchCategories();
    if (initialData) {
      reset({
        title: initialData.title,
        description: initialData.description,
        price: initialData.price,
        stock: initialData.stock,
        status: initialData.status,
        category: initialData.category,
        categoryId: initialData.categoryId,
      });

      setPrimaryPreview(initialData.primaryImage || null);
      setOtherPreviews(initialData.otherImages || []);
    }
  }, [fetchCategories, initialData, reset]);

 
  /* ---------------- IMAGE UPLOAD ---------------- */
  const uploadPrimaryImage = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/upload/upload-single-image", {
      method: "POST",
      body: fd,
    });

    if (!res.ok) throw new Error("Primary image upload failed");

    const data = await res.json();
    return data.url;
  };

  const uploadOtherImages = async (files: File[]): Promise<string[]> => {
    if (!files.length) return [];

    const fd = new FormData();
    files.forEach((file) => fd.append("files", file));

    const res = await fetch("/api/upload/upload-multiple-images", {
      method: "POST",
      body: fd,
    });

    if (!res.ok) throw new Error("Gallery upload failed");

    const data = await res.json();
    return data.map((item: { url: string }) => item.url);
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

      const payload = {
        ...data,
        price: Number(data.price),
        stock: Number(data.stock),
        status: data.status.toLowerCase(),
        categoryId: data.category,
      };

      let primaryUrl = initialData?.primaryImage || '';
      let galleryUrls = initialData?.otherImages || [];

      if (primaryFile) {
        primaryUrl = await uploadPrimaryImage(primaryFile);
      }

      if (otherFiles.length) {
        galleryUrls = await uploadOtherImages(otherFiles);
      }

      const url = initialData
        ? `/api/products/${initialData.id}`   // ✅ UPDATE
        : `/api/products`;                   // ✅ CREATE

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
          <button onClick={onBack} className="p-2 hover:bg-[#243e6b] bg-gray-100 rounded-full text-gray-500 hover:text-white">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-lg font-extrabold text-[#243e6b]">Add New Product</h1>
          </div>
        </div>

        <button
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="flex items-center gap-2 bg-[#243e6b] text-white font-bold px-4 py-1.5 rounded-md"
        >
          <Save size={18} />
          {isSubmitting ? 'Saving...' : 'Save Product'}
        </button>
      </div>

      {/* FORM */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-[#e2e2e2] shadow-sm space-y-6">
            <h3 className="font-bold text-[#243e6b] border-b border-[#e2e2e2] pb-4">General Information</h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Product Name</label>
                <input
                  {...register('title', { required: 'Title is required' })}
                  placeholder="e.g. Premium Cotton T-Shirt"
                 className={`w-full border ${errors.title ? 'border-red-500' : 'border-[#e2e2e2] focus:border-[#243e6b]'}  rounded-md px-4 py-2.5 outline-none focus:border-[#243e6b] transition-colors bg-white`}
                />
                {errors.title && <p className="text-rose-500 text-xs mt-1">{errors.title.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Description</label>
                <textarea
                  {...register('description', {minLength: { value: 20, message: 'Description must be at least 20 characters' }, maxLength: { value: 2000, message: 'Max length is 2000 characters' } })}
                  rows={6}
                  placeholder="Describe your product in detail..."
                  className={`w-full border ${errors.description ? 'border-red-500' : 'border-[#e2e2e2] focus:border-[#243e6b]'}  rounded-md px-4 py-2.5 outline-none focus:border-[#243e6b] transition-colors bg-white`}
                />
                {errors.description && <p className="text-rose-500 text-xs mt-1">{errors.description.message}</p>}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#e2e2e2] shadow-sm space-y-6">
            <h3 className="font-bold text-[#243e6b] border-b border-[#e2e2e2] pb-4">Pricing & Inventory</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Base Price (₦)</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('price', {
                    required: 'Price is required',
                    valueAsNumber: true,
                    min: { value: 0.01, message: 'Must be greater than 0' }
                  })}
                  placeholder="0.00"
                  className={`w-full border ${errors.price ? 'border-red-500' : 'border-[#e2e2e2] focus:border-[#243e6b]'}  rounded-md px-4 py-2.5 outline-none focus:border-[#243e6b] transition-colors bg-white`}
                />
                {errors.price && <p className="text-rose-500 text-xs mt-1">{errors.price.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Stock Quantity</label>
                <input
                  type="number"
                  {...register('stock', {
                    required: 'Number of stock available is required',
                    valueAsNumber: true,
                    min: { value: 0, message: 'Cannot be negative' }
                  })}
                  placeholder="0"
                  className={`w-full border ${errors.stock ? 'border-red-500' : 'border-[#e2e2e2] focus:border-[#243e6b]'}  rounded-md px-4 py-2.5 outline-none focus:border-[#243e6b] transition-colors bg-white`} 
                />
                {errors.stock && <p className="text-rose-500 text-xs mt-1">{errors.stock.message}</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-[#e2e2e2] shadow-sm space-y-6">
            <h3 className="font-bold text-[#243e6b] border-b border-[#e2e2e2] pb-4">Product Status</h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Status</label>
                <select
                  {...register('status', { required: true })}
                  className={`w-full border ${errors.status ? 'border-red-500' : 'border-[#e2e2e2] focus:border-[#243e6b]'}  rounded-md px-4 py-2.5 outline-none focus:border-[#243e6b] transition-colors bg-white`}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="out_of_stock">Out of Stock</option>
                  <option value="archived">Archived</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Category</label>
                <select
                  {...register('category', { required: true })}
                  className={`w-full ${errors.category ? 'border-red-500' : 'border-[#e2e2e2] focus:border-[#243e6b]'} border  rounded-md px-4 py-2.5 outline-none  transition-colors bg-white`}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#e2e2e2] shadow-sm space-y-6">
            <h3 className="font-bold text-[#243e6b] border-b border-[#e2e2e2] pb-4">
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

                <div className="border-2 border-dashed border-[#e2e2e2] rounded-xl p-6 flex flex-col items-center justify-center  h-32 text-center hover:border-[#243e6b] transition-all group relative overflow-hidden">

                  {primaryPreview ? (
                    <>
                      <Image
                        src={primaryPreview}
                        alt="Primary"
                        fill
                        className="object-cover rounded-xl"
                      />
                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                        <p className="text-white text-xs font-bold">Change Image</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-[#243e6b] group-hover:bg-blue-50 transition-all mb-3">
                        <Upload size={22} />
                      </div>
                      <p className="text-sm font-bold text-[#243e6b]">
                        Upload Primary Image
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG or WEBP (Max 2MB)
                      </p>
                    </>
                  )}
                </div>
              </label>

              {/* GALLERY */}
              <div className="grid grid-cols-3 gap-3">

                {/* ADD MORE */}
                <label className="aspect-square border-2 border-dashed border-[#e2e2e2] rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-[#243e6b] hover:text-[#243e6b] transition cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleOtherImagesChange}
                    className="hidden"
                  />
                  <Plus size={22} />
                  <span className="text-[10px] mt-1 font-semibold">Add</span>
                </label>

                {/* PREVIEWS */}
                {otherPreviews.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-xl overflow-hidden border border-[#e2e2e2] group"
                  >
                    <Image
                      src={url}
                      alt="Gallery"
                      fill
                      className="object-cover"
                    />

                    {/* REMOVE BUTTON */}

                    {/* HOVER OVERLAY */}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition" >
                      <button
                        type="button"
                        onClick={() => removeOtherImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
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