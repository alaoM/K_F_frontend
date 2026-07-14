"use client";
import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Folder } from 'lucide-react';
import AddCategoryModal from '@/app/components/AdminComponents/AddCategory';
import { useApi } from '@/hooks/useApi';
import { toast } from 'react-toastify';

const CategoryList: React.FC = () => {
  const fetcher = useApi();

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  // ✅ FETCH
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetcher('/api/categories');
      setCategories(res.data || []);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => { loadData(); }, [loadData]);

  // ✅ CREATE / UPDATE
  const handleSave = async (data: any) => {
    try {
      const url = editingCategory
        ? `/api/categories/${editingCategory.id}`
        : `/api/categories`;

      await fetcher(url, {
        method: editingCategory ? 'PATCH' : 'POST',
        body: JSON.stringify(data)
      });

      toast.success(editingCategory ? "Category updated" : "Category created");

      setIsModalOpen(false);
      setEditingCategory(null);
      loadData();

    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // ✅ DELETE
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;

    try {
      await fetcher(`/api/categories/${id}`, { method: 'DELETE' });
      toast.success("Category deleted");
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // ✅ OPEN CREATE
  const onCreateClick = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  // ✅ OPEN EDIT
  const onEditClick = (cat: any) => {
    setEditingCategory(cat);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Categories</h1>

        <button
          onClick={onCreateClick}
          className="flex items-center gap-2 bg-[#f6c947] px-4 py-2 rounded"
        >
          <Plus size={16} /> New
        </button>
      </div>

      {/* LIST */}
      <div className="grid md:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white p-6 rounded-xl border border-[#e2e2e2] shadow-sm hover:shadow-md transition-all group">

            <div className="flex justify-between">
             <div 
               className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center text-2xl border border-[#e2e2e2] bg-cover bg-center"
               style={cat.image ? { backgroundImage: `url(${cat.image})`, fontSize: '0' } : {}}
             >
                {!cat.image && cat.icon}
              </div>

              <div className="flex gap-2">
                <button onClick={() => onEditClick(cat)}>
                  <Edit size={16} />
                </button>
                <button onClick={() => handleDelete(cat.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

           <h3 className="font-bold text-[#243e6b] text-lg mb-1">{cat.name}</h3>
            <p className="text-xs text-gray-400 font-mono mb-4">/{cat.slug}</p>


            {/* CHILDREN */}
            {cat.children?.length > 0 && (
              <div className="mt-3 pl-3 border-l">
                {cat.children.map((child: any) => (
                  <div key={child.id} className="text-sm flex justify-between">
                    <span>↳ {child.name}</span>
                    <button onClick={() => onEditClick(child)}>
                      <Edit size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

         

          </div>
        ))}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <AddCategoryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          parentOptions={categories}   // ✅ IMPORTANT
          editingCategory={editingCategory}
        />
      )}
    </div>
  );
};

export default CategoryList;