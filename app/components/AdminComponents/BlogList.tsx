'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Search, MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { toast } from 'react-toastify';
import AdminDeleteModal from './AdminDeleteModal';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  views: number;
  createdAt: string;
  featuredImage?: string;
}

const BlogList: React.FC<{
  onAddBlog: () => void;
  onEditBlog: (blog: any) => void;
}> = ({ onAddBlog, onEditBlog }) => {
  const fetcher = useApi();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<string | null>(null);

  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetcher('/api/blog');
      setBlogs(Array.isArray(res) ? res : res.data || []);
    } catch (err) {
      toast.error('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleDelete = async () => {
    if (!blogToDelete) return;
    try {
      await fetcher(`/api/blog/${blogToDelete}`, { method: 'DELETE' });
      toast.success('Blog post deleted');
      fetchBlogs();
    } catch (err) {
      toast.error('Failed to delete blog post');
    } finally {
      setShowDeleteModal(false);
      setBlogToDelete(null);
    }
  };

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 font-poppins">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#111111] uppercase tracking-tight">Blog Management</h1>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-1">Manage platform news, guides, and articles</p>
        </div>
        <button
          onClick={onAddBlog}
          className="flex items-center justify-center gap-2 bg-[#f6c947] text-[#111111] border-2 border-[#f6c947] px-6 py-2.5 rounded-none font-black text-xs uppercase tracking-wider hover:bg-[#111111] hover:text-[#f6c947] hover:border-[#111111] transition-all shadow-sm"
        >
          <Plus size={16} />
          Create New Post
        </button>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="bg-white p-4 rounded-none border border-gray-300 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search blog posts by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-none focus:border-[#111111] outline-none text-xs font-semibold transition-all"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-none border border-gray-300 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-200">
                <th className="px-6 py-3.5 text-[11px] font-black uppercase tracking-wider text-[#111111]">Post Info</th>
                <th className="px-6 py-3.5 text-[11px] font-black uppercase tracking-wider text-[#111111]">Slug</th>
                <th className="px-6 py-3.5 text-[11px] font-black uppercase tracking-wider text-[#111111]">Views</th>
                <th className="px-6 py-3.5 text-[11px] font-black uppercase tracking-wider text-[#111111]">Date</th>
                <th className="px-6 py-3.5 text-[11px] font-black uppercase tracking-wider text-[#111111] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-bold uppercase tracking-wider text-xs">Loading blog posts...</td>
                </tr>
              ) : filteredBlogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-bold uppercase tracking-wider text-xs">No blog posts found.</td>
                </tr>
              ) : (
                filteredBlogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-none bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                          {blog.featuredImage ? (
                            <img src={blog.featuredImage} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <Eye size={16} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#111111] line-clamp-1">{blog.title}</p>
                          <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider mt-0.5">Article</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono font-semibold text-gray-700 bg-gray-100 px-2 py-1 border border-gray-200 rounded-none">/{blog.slug}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                        <Eye size={14} className="text-gray-400" />
                        {blog.views}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-semibold text-gray-600">{new Date(blog.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => onEditBlog(blog)}
                          className="p-2 bg-white hover:bg-[#111111] text-gray-700 hover:text-white border border-gray-300 rounded-none transition-all"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={() => {
                            setBlogToDelete(blog.id);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 bg-white hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 rounded-none transition-all"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Blog Post"
        message="Are you sure you want to delete this blog post? This action cannot be undone."
        showReasonField={false}
      />
    </div>
  );
};

export default BlogList;
