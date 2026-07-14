'use client';

import React, { useState } from 'react';
import BlogList from '@/app/components/AdminComponents/BlogList';
import AddBlog from '@/app/components/AdminComponents/AddBlog';

const BlogAdminPage = () => {
  const [isAddingBlog, setIsAddingBlog] = useState(false);
  const [editingBlog, setEditingBlog] = useState<any | null>(null);

  return (
    <div className="p-4 md:p-8">
      {isAddingBlog ? (
        <AddBlog
          onBack={() => {
            setIsAddingBlog(false);
            setEditingBlog(null);
          }}
          initialData={editingBlog}
        />
      ) : (
        <BlogList
          onAddBlog={() => {
            setEditingBlog(null);
            setIsAddingBlog(true);
          }}
          onEditBlog={(blog) => {
            setEditingBlog(blog);
            setIsAddingBlog(true);
          }}
        />
      )}
    </div>
  );
};

export default BlogAdminPage;
