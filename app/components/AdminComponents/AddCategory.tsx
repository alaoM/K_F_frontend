import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save, Loader2, ImageIcon, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

interface CreateCategoryDto {
  name: string;
  icon?: string;
  image?: string;
  parentId?: string;
  commissionPercent?: number;
  subcategories?: string[];
}

interface CategoryNode {
  id: string;
  name: string;
  children?: CategoryNode[];
  parent?: { id: string };
}

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateCategoryDto) => void;
  parentOptions?: CategoryNode[];
  editingCategory?: CreateCategoryDto & { id: string; parent?: { id: string } };
  defaultParentId?: string;
}

const flattenCategoryTree = (
  nodes: CategoryNode[],
  depth = 1
): { id: string; name: string; depth: number; label: string }[] => {
  let result: { id: string; name: string; depth: number; label: string }[] = [];
  for (const node of nodes) {
    const indent = depth > 1 ? `${'— '.repeat(depth - 1)} ` : '';
    result.push({
      id: node.id,
      name: node.name,
      depth,
      label: `${indent}${node.name} (Gen ${depth})`,
    });
    if (node.children && node.children.length > 0) {
      result = result.concat(flattenCategoryTree(node.children, depth + 1));
    }
  }
  return result;
};

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  parentOptions = [],
  editingCategory,
  defaultParentId = ''
}) => {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CreateCategoryDto>();
  const [isUploading, setIsUploading] = useState(false);
  const [bulkSubcategories, setBulkSubcategories] = useState<string[]>([]);
  const [bulkInput, setBulkInput] = useState('');

  const currentImage = watch('image');
  const selectedParentId = watch('parentId');

  const flatOptions = useMemo(() => flattenCategoryTree(parentOptions), [parentOptions]);

  // Compute generation level based on selected parent
  const targetGeneration = useMemo(() => {
    if (!selectedParentId) return 1;
    const parentOpt = flatOptions.find(o => o.id === selectedParentId);
    return parentOpt ? parentOpt.depth + 1 : 1;
  }, [selectedParentId, flatOptions]);

  // Prefill form on edit
  useEffect(() => {
    if (editingCategory) {
      reset({
        name: editingCategory.name,
        icon: editingCategory.icon || '📁',
        image: editingCategory.image || '',
        parentId: editingCategory.parent?.id || '',
        commissionPercent: editingCategory.commissionPercent ? editingCategory.commissionPercent * 100 : undefined
      });
      setBulkSubcategories([]);
    } else {
      reset({
        name: '',
        icon: '📁',
        image: '',
        parentId: defaultParentId || '',
        commissionPercent: undefined
      });
      setBulkSubcategories([]);
    }
    setBulkInput('');
  }, [editingCategory, defaultParentId, reset]);

  const handleAddBulkSub = () => {
    if (!bulkInput.trim()) return;
    // Support comma-separated or single subcategory addition
    const newItems = bulkInput
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !bulkSubcategories.includes(s));
    
    if (newItems.length) {
      setBulkSubcategories([...bulkSubcategories, ...newItems]);
      setBulkInput('');
    }
  };

  const handleRemoveBulkSub = (index: number) => {
    setBulkSubcategories(bulkSubcategories.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload/upload-single-image', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.url) {
        setValue('image', data.url);
        toast.success("Image uploaded");
      } else {
        throw new Error("Upload failed");
      }
    } catch {
      toast.error("Image upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = (data: CreateCategoryDto) => {
    if (targetGeneration > 5) {
      toast.error("Categories cannot exceed 5 generations deep");
      return;
    }

    onSave({
      ...data,
      parentId: data.parentId || undefined,
      commissionPercent: data.commissionPercent ? data.commissionPercent / 100 : undefined,
      subcategories: bulkSubcategories.length > 0 ? bulkSubcategories : undefined
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-lg overflow-hidden my-8">

        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#f6c947] rounded-lg flex items-center justify-center text-[#243e6b]">
              <Save size={20} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#243e6b]">
                {editingCategory ? 'Edit Category' : 'New Category'}
              </h2>
              <span className="text-xs text-gray-500 font-medium">
                Creating as <strong className="text-[#243e6b]">Generation {targetGeneration}</strong> (Max 5 Gen)
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">

          {/* Parent Category */}
          <div>
            <label className="text-sm font-bold text-gray-700">Parent Category (Optional)</label>
            <select
              {...register('parentId')}
              className="w-full border border-gray-200 rounded-lg px-4 py-2 mt-1 appearance-none bg-white text-sm"
            >
              <option value="">Top Level Category (Generation 1)</option>
              {flatOptions
                .filter(p => !editingCategory || p.id !== editingCategory.id)
                .map(p => (
                  <option key={p.id} value={p.id} disabled={p.depth >= 5}>
                    {p.label} {p.depth >= 5 ? '(Max depth reached)' : ''}
                  </option>
                ))}
            </select>
          </div>

          {/* Name */}
          <div>
            <label className="text-sm font-bold text-gray-700">Category Name</label>
            <input
              {...register('name', { required: 'Category name is required', minLength: { value: 2, message: 'Minimum 2 characters' } })}
              className="w-full border border-gray-200 rounded-lg px-4 py-2 mt-1 focus:ring-2 focus:ring-[#243e6b] outline-none text-sm"
              placeholder="E.g. Electronics, Laptops, Gaming Laptops"
            />
            {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          {!editingCategory && targetGeneration < 5 && (
            /* Bulk Sub-Categories Addition */
            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200/60 space-y-3">
              <div>
                <label className="text-xs font-extrabold text-[#243e6b] uppercase tracking-wider block">
                  Add Sub-Categories in Bulk (Optional)
                </label>
                <p className="text-[11px] text-gray-500">
                  Enter sub-category names separated by commas (will be created as Generation {targetGeneration + 1}).
                </p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddBulkSub(); } }}
                  placeholder="E.g. Gaming, Business, Ultrabooks"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#243e6b]"
                />
                <button
                  type="button"
                  onClick={handleAddBulkSub}
                  className="bg-[#243e6b] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-[#1a2e50]"
                >
                  <Plus size={14} /> Add
                </button>
              </div>

              {bulkSubcategories.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {bulkSubcategories.map((sub, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-300 rounded-full text-xs font-semibold text-[#243e6b] shadow-xs"
                    >
                      {sub}
                      <button
                        type="button"
                        onClick={() => handleRemoveBulkSub(idx)}
                        className="text-gray-400 hover:text-rose-600"
                      >
                        <Trash2 size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Icon */}
            <div>
              <label className="text-sm font-bold text-gray-700">Emoji Icon</label>
              <input
                {...register('icon')}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 mt-1 text-center text-sm"
                placeholder="📁"
              />
            </div>

            {/* Commission */}
            <div>
              <label className="text-sm font-bold text-gray-700">Commission Fee (%)</label>
              <input
                type="number"
                step="0.01"
                {...register('commissionPercent', { min: 0, max: 100 })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 mt-1 text-sm"
                placeholder="E.g. 5 for 5%"
              />
            </div>
          </div>

          {/* Banner Image Upload */}
          <div>
            <label className="text-sm font-bold text-gray-700 block mb-2">Category Banner Image</label>
            <div className="relative group aspect-video rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-[#f6c947]">
              {currentImage ? (
                <>
                  <img src={currentImage} alt="Category preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
                    <label className="bg-white text-black px-4 py-2 rounded-lg text-xs font-bold cursor-pointer hover:bg-gray-100">
                      Change Image
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                    <button
                      type="button"
                      onClick={() => setValue('image', '')}
                      className="bg-rose-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-rose-700"
                    >
                      Remove
                    </button>
                  </div>
                </>
              ) : (
                <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-4">
                  <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-2 text-gray-400">
                    {isUploading ? <Loader2 className="animate-spin" size={20} /> : <ImageIcon size={20} />}
                  </div>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {isUploading ? 'Uploading...' : 'Upload Banner'}
                  </span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg text-gray-600 font-bold hover:bg-gray-100 transition-all text-sm">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="flex-[2] bg-[#243e6b] text-white py-2 rounded-lg font-extrabold hover:bg-[#243e6b]/90 shadow-md transition-all disabled:opacity-50 text-sm"
            >
              {editingCategory ? 'UPDATE CATEGORY' : `CREATE CATEGORY (${bulkSubcategories.length ? 1 + bulkSubcategories.length : 1} TOTAL)`}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddCategoryModal;