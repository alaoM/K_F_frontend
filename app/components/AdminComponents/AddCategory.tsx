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
  const currentIcon = watch('icon');
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
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-none border-2 border-[#111111] w-full max-w-lg shadow-2xl overflow-hidden my-8">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#f6c947] border border-[#111111] rounded-none flex items-center justify-center text-[#111111]">
              <Save size={18} />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight text-[#111111]">
                {editingCategory ? 'Edit Category' : 'New Category'}
              </h2>
              <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                Creating as <strong className="text-[#111111]">Generation {targetGeneration}</strong> (Max 5 Gen)
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-[#111111] text-gray-600 hover:text-white border border-gray-300 rounded-none transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">

          {/* Parent Category */}
          <div className="space-y-1">
            <label className="text-xs font-black uppercase tracking-wider text-[#111111]">Parent Category (Optional)</label>
            <select
              {...register('parentId')}
              className="w-full border border-gray-300 rounded-none px-4 py-2.5 bg-white text-xs font-semibold outline-none focus:border-[#111111]"
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
          <div className="space-y-1">
            <label className="text-xs font-black uppercase tracking-wider text-[#111111]">Category Name</label>
            <input
              {...register('name', { required: 'Category name is required', minLength: { value: 2, message: 'Minimum 2 characters' } })}
              className="w-full border border-gray-300 rounded-none px-4 py-2.5 focus:border-[#111111] outline-none text-xs font-semibold bg-white"
              placeholder="E.g. Electronics, Laptops, Gaming Laptops"
            />
            {errors.name && <p className="text-rose-500 text-xs mt-1 font-bold">{errors.name.message}</p>}
          </div>

          {!editingCategory && targetGeneration < 5 && (
            /* Bulk Sub-Categories Addition */
            <div className="bg-gray-50 p-4 rounded-none border border-gray-300 space-y-3">
              <div>
                <label className="text-xs font-black text-[#111111] uppercase tracking-wider block">
                  Add Sub-Categories in Bulk (Optional)
                </label>
                <p className="text-[11px] text-gray-500 font-medium mt-0.5">
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
                  className="flex-1 border border-gray-300 rounded-none px-3 py-2 text-xs bg-white focus:outline-none focus:border-[#111111]"
                />
                <button
                  type="button"
                  onClick={handleAddBulkSub}
                  className="bg-[#111111] text-[#f6c947] hover:bg-[#f6c947] hover:text-[#111111] px-4 py-2 rounded-none text-xs font-black uppercase tracking-wider flex items-center gap-1 transition-all"
                >
                  <Plus size={14} /> Add
                </button>
              </div>

              {bulkSubcategories.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {bulkSubcategories.map((sub, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-300 rounded-none text-xs font-bold text-[#111111] shadow-xs"
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
            <div className="space-y-1">
              <label className="text-xs font-black uppercase tracking-wider text-[#111111]">Emoji Icon(s)</label>
              <div className="flex items-center gap-2">
                <input
                  {...register('icon')}
                  className="flex-1 border border-gray-300 rounded-none px-3 py-2 text-xs font-semibold focus:border-[#111111] outline-none"
                  placeholder="📁"
                />
                <div
                  className="w-9 h-9 rounded-none bg-gray-100 border border-gray-300 flex items-center justify-center text-lg overflow-hidden shrink-0 whitespace-nowrap px-1 select-none relative group/icon cursor-help"
                  title={currentIcon || '📁'}
                >
                  <span className="whitespace-nowrap truncate max-w-full leading-none tracking-tighter text-center">
                    {currentIcon || '📁'}
                  </span>
                  {currentIcon && (
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover/icon:flex items-center gap-1 bg-[#111111] text-[#f6c947] text-xs px-2.5 py-1.5 rounded-none shadow-2xl whitespace-nowrap z-[100] border border-gray-700 animate-in fade-in zoom-in-95 duration-150">
                      <span className="text-sm">{currentIcon}</span>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#111111]" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Commission */}
            <div className="space-y-1">
              <label className="text-xs font-black uppercase tracking-wider text-[#111111]">Commission Fee (%)</label>
              <input
                type="number"
                step="0.01"
                {...register('commissionPercent', { min: 0, max: 100 })}
                className="w-full border border-gray-300 rounded-none px-3 py-2 text-xs font-semibold focus:border-[#111111] outline-none"
                placeholder="E.g. 5 for 5%"
              />
            </div>
          </div>

          {/* Banner Image Upload */}
          <div className="space-y-1">
            <label className="text-xs font-black uppercase tracking-wider text-[#111111] block mb-1">Category Banner Image</label>
            <div className="relative group aspect-video rounded-none border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-[#111111]">
              {currentImage ? (
                <>
                  <img src={currentImage} alt="Category preview" className="w-full h-full object-cover rounded-none" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
                    <label className="bg-[#f6c947] text-[#111111] px-4 py-2 rounded-none text-xs font-black uppercase tracking-wider cursor-pointer hover:bg-white">
                      Change Image
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                    <button
                      type="button"
                      onClick={() => setValue('image', '')}
                      className="bg-rose-600 text-white px-4 py-2 rounded-none text-xs font-black uppercase tracking-wider hover:bg-rose-700"
                    >
                      Remove
                    </button>
                  </div>
                </>
              ) : (
                <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-4">
                  <div className="w-12 h-12 rounded-none bg-gray-100 border border-gray-200 flex items-center justify-center mb-2 text-gray-400 group-hover:text-[#111111] group-hover:bg-[#f6c947]">
                    {isUploading ? <Loader2 className="animate-spin" size={20} /> : <ImageIcon size={20} />}
                  </div>
                  <span className="text-xs font-black text-gray-600 uppercase tracking-wider">
                    {isUploading ? 'Uploading...' : 'Upload Banner'}
                  </span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-none text-gray-700 font-black uppercase text-xs tracking-wider border border-gray-300 hover:bg-gray-100 transition-all">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="flex-[2] bg-[#f6c947] text-[#111111] border-2 border-[#f6c947] hover:bg-[#111111] hover:text-[#f6c947] hover:border-[#111111] py-2.5 rounded-none font-black uppercase text-xs tracking-wider shadow-sm transition-all disabled:opacity-50"
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