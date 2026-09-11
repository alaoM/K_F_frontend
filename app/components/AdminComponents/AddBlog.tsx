'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, Upload, X, Image as ImageIcon } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { toast } from 'react-toastify';
import Image from 'next/image';

interface BlogFormData {
  title: string;
  content: string;
  tags: string;
}

const AddBlog: React.FC<{
  onBack: () => void;
  initialData?: any;
}> = ({ onBack, initialData }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<BlogFormData>();
  const fetcher = useApi();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [featuredFile, setFeaturedFile] = useState<File | null>(null);
  const [featuredPreview, setFeaturedPreview] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title,
        content: initialData.content,
        tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : initialData.tags || '',
      });
      setFeaturedPreview(initialData.featuredImage || null);
    }
  }, [initialData, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFeaturedFile(file);
    setFeaturedPreview(URL.createObjectURL(file));
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload/upload-single-image', {
      method: 'POST',
      body: fd,
    });
    if (!res.ok) throw new Error('Image upload failed');
    const data = await res.json();
    return data.url;
  };

  const onSubmit = async (data: BlogFormData) => {
    try {
      setIsSubmitting(true);
      let imageUrl = featuredPreview;

      if (featuredFile) {
        imageUrl = await uploadImage(featuredFile);
      }

      const payload = {
        title: data.title,
        content: data.content,
        tags: data.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
        featuredImage: imageUrl,
      };

      const url = initialData ? `/api/blog/${initialData.id}` : '/api/blog';
      const method = initialData ? 'PATCH' : 'POST';

      await fetcher(url, {
        method,
        body: JSON.stringify(payload),
      });

      toast.success(initialData ? 'Blog post updated!' : 'Blog post published!');
      onBack();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save blog post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-poppins">
      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-[#111111] bg-gray-100 border border-gray-300 rounded-none text-[#111111] hover:text-[#f6c947] transition-all">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-[#111111] uppercase tracking-tight">
              {initialData ? 'Edit Blog Post' : 'Create New Post'}
            </h1>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-0.5">Article details and publishing</p>
          </div>
        </div>

        <button
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="flex items-center gap-2 bg-[#f6c947] text-[#111111] border-2 border-[#f6c947] font-black uppercase text-xs tracking-wider px-6 py-2.5 rounded-none hover:bg-[#111111] hover:text-[#f6c947] hover:border-[#111111] transition-all shadow-sm disabled:opacity-50"
        >
          <Save size={16} />
          {isSubmitting ? 'Publishing...' : initialData ? 'Update Post' : 'Publish Post'}
        </button>
      </div>

      {/* FORM CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-none border border-gray-300 shadow-sm space-y-6">
            <h3 className="font-black text-[#111111] uppercase tracking-wider text-sm border-b border-gray-200 pb-3">Content Information</h3>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-[#111111]">Post Title</label>
                <input
                  {...register('title', { required: 'Title is required' })}
                  placeholder="Enter a catchy title..."
                  className="w-full bg-white border border-gray-300 rounded-none px-4 py-2.5 outline-none focus:border-[#111111] transition-all text-xs font-semibold"
                />
                {errors.title && <p className="text-rose-500 text-xs font-bold mt-1 uppercase tracking-wider">{errors.title.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-[#111111]">Content (HTML/Markdown supported)</label>
                <textarea
                  {...register('content', { required: 'Content is required' })}
                  rows={15}
                  placeholder="Write your article here..."
                  className="w-full bg-white border border-gray-300 rounded-none px-4 py-2.5 outline-none focus:border-[#111111] transition-all text-xs font-semibold resize-none"
                />
                {errors.content && <p className="text-rose-500 text-xs font-bold mt-1 uppercase tracking-wider">{errors.content.message}</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* FEATURED IMAGE */}
          <div className="bg-white p-6 rounded-none border border-gray-300 shadow-sm space-y-6">
            <h3 className="font-black text-[#111111] uppercase tracking-wider text-sm border-b border-gray-200 pb-3">Featured Image</h3>
            
            <label className="block cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <div className="aspect-[4/3] border-2 border-dashed border-gray-300 rounded-none flex flex-col items-center justify-center text-center hover:border-[#111111] transition-all group relative overflow-hidden bg-gray-50">
                {featuredPreview ? (
                  <>
                    <Image src={featuredPreview} alt="Preview" fill className="object-cover rounded-none" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200">
                      <p className="text-[#f6c947] text-xs font-black uppercase tracking-wider">Change Image</p>
                    </div>
                  </>
                ) : (
                  <div className="p-6">
                    <div className="w-12 h-12 rounded-none bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 group-hover:text-[#111111] group-hover:bg-[#f6c947] transition-all mb-3 mx-auto">
                      <Upload size={20} />
                    </div>
                    <p className="text-xs font-black uppercase tracking-wider text-[#111111]">Upload Image</p>
                    <p className="text-[11px] text-gray-500 mt-1 font-medium">PNG, JPG or WEBP (Max 2MB)</p>
                  </div>
                )}
              </div>
            </label>
          </div>

          {/* TAGS */}
          <div className="bg-white p-6 rounded-none border border-gray-300 shadow-sm space-y-6">
            <h3 className="font-black text-[#111111] uppercase tracking-wider text-sm border-b border-gray-200 pb-3">Meta Data</h3>
            
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-[#111111]">Tags (Comma separated)</label>
              <input
                {...register('tags')}
                placeholder="Fashion, Tech, Trends..."
                className="w-full bg-white border border-gray-300 rounded-none px-4 py-2.5 outline-none focus:border-[#111111] transition-all text-xs font-semibold"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBlog;
