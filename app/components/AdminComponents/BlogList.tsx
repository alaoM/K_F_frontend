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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#243e6b] uppercase tracking-tight">Blog Management</h1>
          <p className="text-sm text-gray-500 font-medium">Manage your website's news and articles</p>
        </div>
        <button
          onClick={onAddBlog}
          className="flex items-center justify-center gap-2 bg-[#243e6b] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#1a2f52] transition-all shadow-lg shadow-blue-900/10"
        >
          <Plus size={18} />
          Create New Post
        </button>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search blog posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#243e6b]/10 outline-none text-sm font-medium transition-all"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100">Post Info</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100">Slug</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100">Views</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100">Date</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-400 font-medium italic">Loading blog posts...</td>
                </tr>
              ) : filteredBlogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-400 font-medium italic">No blog posts found.</td>
                </tr>
              ) : (
                filteredBlogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                          {blog.featuredImage ? (
                            <img src={blog.featuredImage} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <Eye size={16} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#243e6b] line-clamp-1">{blog.title}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Article</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">/{blog.slug}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600">
                        <Eye size={14} className="text-gray-400" />
                        {blog.views}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-gray-500">{new Date(blog.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => onEditBlog(blog)}
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            setBlogToDelete(blog.id);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
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
