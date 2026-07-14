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
          <button onClick={onBack} className="p-2 hover:bg-[#243e6b] bg-gray-100 rounded-full text-gray-500 hover:text-white transition-all">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-black text-[#243e6b] uppercase tracking-tight">
              {initialData ? 'Edit Blog Post' : 'Create New Post'}
            </h1>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Article Details</p>
          </div>
        </div>

        <button
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="flex items-center gap-2 bg-[#243e6b] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#1a2f52] transition-all shadow-lg shadow-blue-900/10"
        >
          <Save size={18} />
          {isSubmitting ? 'Publishing...' : initialData ? 'Update Post' : 'Publish Post'}
        </button>
      </div>

      {/* FORM CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="font-black text-[#243e6b] uppercase tracking-wider text-sm border-b border-gray-50 pb-4">Content Information</h3>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Post Title</label>
                <input
                  {...register('title', { required: 'Title is required' })}
                  placeholder="Enter a catchy title..."
                  className="w-full bg-gray-50 border-none rounded-xl px-5 py-4 outline-none focus:ring-2 focus:ring-[#243e6b]/10 transition-all font-medium text-sm"
                />
                {errors.title && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wider">{errors.title.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Content (HTML/Markdown supported)</label>
                <textarea
                  {...register('content', { required: 'Content is required' })}
                  rows={15}
                  placeholder="Write your article here..."
                  className="w-full bg-gray-50 border-none rounded-xl px-5 py-4 outline-none focus:ring-2 focus:ring-[#243e6b]/10 transition-all font-medium text-sm resize-none"
                />
                {errors.content && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wider">{errors.content.message}</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* FEATURED IMAGE */}
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="font-black text-[#243e6b] uppercase tracking-wider text-sm border-b border-gray-50 pb-4">Featured Image</h3>
            
            <label className="block cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <div className="aspect-[4/3] border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center text-center hover:border-[#243e6b] transition-all group relative overflow-hidden bg-gray-50">
                {featuredPreview ? (
                  <>
                    <Image src={featuredPreview} alt="Preview" fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                      <p className="text-white text-[10px] font-black uppercase tracking-widest">Change Image</p>
                    </div>
                  </>
                ) : (
                  <div className="p-6">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-gray-400 group-hover:text-[#243e6b] group-hover:scale-110 transition-all mb-4 mx-auto shadow-sm">
                      <Upload size={20} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#243e6b]">Upload Image</p>
                    <p className="text-[9px] text-gray-400 mt-2 font-bold uppercase tracking-widest">PNG, JPG or WEBP (Max 2MB)</p>
                  </div>
                )}
              </div>
            </label>
          </div>

          {/* TAGS */}
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="font-black text-[#243e6b] uppercase tracking-wider text-sm border-b border-gray-50 pb-4">Meta Data</h3>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Tags (Comma separated)</label>
              <input
                {...register('tags')}
                placeholder="Fashion, Tech, Trends..."
                className="w-full bg-gray-50 border-none rounded-xl px-5 py-4 outline-none focus:ring-2 focus:ring-[#243e6b]/10 transition-all font-medium text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBlog;
