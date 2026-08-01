"use client";

export const dynamic = 'force-dynamic';
import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Edit, Trash2, ChevronRight, ChevronDown, FolderTree, RefreshCw } from 'lucide-react';
import AddCategoryModal from '@/app/components/AdminComponents/AddCategory';
import ConfirmModal from '@/app/components/ConfirmModal';
import { useApi } from '@/hooks/useApi';
import { toast } from 'react-toastify';

const RecursiveCategoryNode: React.FC<{
  category: any;
  depth: number;
  onEdit: (cat: any) => void;
  onDelete: (id: string) => void;
  onAddSub: (parentId: string) => void;
}> = ({ category, depth, onEdit, onDelete, onAddSub }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = category.children && category.children.length > 0;

  const depthColors: Record<number, string> = {
    1: 'bg-[#243e6b] text-white',
    2: 'bg-[#f6c947] text-[#243e6b]',
    3: 'bg-emerald-600 text-white',
    4: 'bg-indigo-600 text-white',
    5: 'bg-purple-600 text-white',
  };

  return (
    <div className={`space-y-2 ${depth > 1 ? 'ml-3 sm:ml-6 pl-3 border-l-2 border-dashed border-gray-200 mt-2' : ''}`}>
      <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-gray-200 shadow-xs hover:shadow-md transition-all group">
        <div className="flex items-center gap-3 min-w-0">
          {hasChildren ? (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-gray-700 transition-colors p-1"
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          ) : (
            <span className="w-5" />
          )}

          <div
            className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-lg border border-gray-200 shrink-0 bg-cover bg-center overflow-hidden px-1 select-none relative group/icon cursor-help"
            style={category.image ? { backgroundImage: `url(${category.image})`, fontSize: '0' } : {}}
            title={category.icon || '📁'}
          >
            {!category.image && (
              <>
                <span className="whitespace-nowrap truncate max-w-full leading-none tracking-tighter text-center">
                  {category.icon || '📁'}
                </span>
                {category.icon && (
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover/icon:flex items-center gap-1 bg-[#1e293b] text-white text-xs px-2.5 py-1.5 rounded-xl shadow-2xl whitespace-nowrap z-[100] border border-gray-700 animate-in fade-in zoom-in-95 duration-150">
                    <span className="text-sm">{category.icon}</span>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1e293b]" />
                  </div>
                )}
              </>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-[#243e6b] text-sm truncate">{category.name}</h4>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${depthColors[depth] || 'bg-gray-700 text-white'}`}>
                Gen {depth}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-mono">/{category.slug}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
          {depth < 5 && (
            <button
              onClick={() => onAddSub(category.id)}
              className="p-1.5 text-xs font-bold text-[#243e6b] bg-amber-50 hover:bg-amber-100 rounded-lg flex items-center gap-1 transition-colors"
              title="Add Subcategory"
            >
              <Plus size={14} /> Sub
            </button>
          )}
          <button
            onClick={() => onEdit(category)}
            className="p-1.5 text-gray-500 hover:text-[#243e6b] hover:bg-gray-100 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => onDelete(category.id)}
            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="space-y-2">
          {category.children.map((child: any) => (
            <RecursiveCategoryNode
              key={child.id}
              category={child}
              depth={depth + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddSub={onAddSub}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CategoryList: React.FC = () => {
  const fetcher = useApi();

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [defaultParentId, setDefaultParentId] = useState<string>('');

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
      setDefaultParentId('');
      loadData();

    } catch (err: any) {
      toast.error(err.message || "Failed to save category");
    }
  };

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // ✅ DELETE
  const handleDelete = async (id: string) => {
    try {
      await fetcher(`/api/categories/${id}`, { method: 'DELETE' });
      toast.success("Category deleted");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete category");
    }
  };

  // ✅ OPEN CREATE (Top level)
  const onCreateClick = () => {
    setEditingCategory(null);
    setDefaultParentId('');
    setIsModalOpen(true);
  };

  // ✅ OPEN CREATE SUB-CATEGORY
  const onAddSubClick = (parentId: string) => {
    setEditingCategory(null);
    setDefaultParentId(parentId);
    setIsModalOpen(true);
  };

  // ✅ OPEN EDIT
  const onEditClick = (cat: any) => {
    setEditingCategory(cat);
    setDefaultParentId('');
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <FolderTree className="text-[#243e6b]" size={24} />
            <h1 className="text-2xl font-bold text-[#243e6b]">Category Management</h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Organize products in up to <strong>5 generations</strong> of sub-categories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData()}
            className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
            title="Refresh Categories"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={onCreateClick}
            className="flex items-center gap-2 bg-[#f6c947] hover:bg-[#f5c233] text-[#243e6b] font-bold px-5 py-2.5 rounded-xl shadow-xs transition-all"
          >
            <Plus size={18} /> New Root Category
          </button>
        </div>
      </div>

      {/* LIST */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center text-gray-400">
          <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-[#243e6b]" />
          Loading category hierarchy...
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center space-y-3">
          <FolderTree size={40} className="mx-auto text-gray-300" />
          <h3 className="font-bold text-gray-700">No categories found</h3>
          <p className="text-xs text-gray-400">Create your first root category to get started.</p>
          <button
            onClick={onCreateClick}
            className="bg-[#243e6b] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#1d3358]"
          >
            Create Category
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((cat) => (
            <RecursiveCategoryNode
              key={cat.id}
              category={cat}
              depth={1}
              onEdit={onEditClick}
              onDelete={(id) => setDeleteConfirmId(id)}
              onAddSub={onAddSubClick}
            />
          ))}
        </div>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <AddCategoryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          parentOptions={categories}
          editingCategory={editingCategory}
          defaultParentId={defaultParentId}
        />
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => {
          if (deleteConfirmId) handleDelete(deleteConfirmId);
        }}
        title="Delete Category"
        message="Are you sure you want to delete this category? Categories containing active products or sub-categories cannot be deleted."
        confirmText="Delete Category"
        variant="danger"
      />

    </div>
  );
};

export default CategoryList;