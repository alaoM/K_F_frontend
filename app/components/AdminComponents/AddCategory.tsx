import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save, Loader2, ImageIcon } from 'lucide-react';
import { toast } from 'react-toastify';

interface CreateCategoryDto {
  name: string;
  icon?: string;
  image?: string;
  parentId?: string;
  commissionPercent?: number;
}

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateCategoryDto) => void;
  parentOptions?: { id: string; name: string }[];
  editingCategory?: CreateCategoryDto & { id: string; parent?: { id: string } };
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  parentOptions = [],
  editingCategory
}) => {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CreateCategoryDto>();
  const [isUploading, setIsUploading] = React.useState(false);
  const currentImage = watch('image');

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
    } else {
      reset({ name: '', icon: '📁', image: '', parentId: '', commissionPercent: undefined });
    }
  }, [editingCategory, reset]);

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
    } catch (err) {
      toast.error("Image upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = (data: CreateCategoryDto) => {
    onSave({
      ...data,
      parentId: data.parentId || undefined,
      commissionPercent: data.commissionPercent ? data.commissionPercent / 100 : undefined
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl w-full max-w-md shadow-lg overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#f6c947] rounded-lg flex items-center justify-center text-[#243e6b]">
              <Save size={20} />
            </div>
            <h2 className="text-lg font-extrabold text-[#243e6b]">
              {editingCategory ? 'Edit Category' : 'New Category'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">

          {/* Name */}
          <div>
            <label className="text-sm font-bold text-gray-700">Category Name</label>
            <input
              {...register('name', { required: 'Category name is required', minLength: { value: 2, message: 'Minimum 2 characters' } })}
              className="w-full border border-gray-200 rounded-lg px-4 py-2 mt-1 focus:ring-2 focus:ring-[#243e6b] outline-none"
              placeholder="E.g. Electronics, Fashion"
            />
            {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Icon */}
            <div>
              <label className="text-sm font-bold text-gray-700">Emoji Icon</label>
              <input
                {...register('icon')}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 mt-1 text-center"
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
                className="w-full border border-gray-200 rounded-lg px-4 py-2 mt-1"
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
            <p className="text-[10px] text-gray-400 mt-2">Recommended: 800x1000px (4:5 ratio) for Mitho design compatibility.</p>
          </div>

          {/* Parent */}
          <div>
            <label className="text-sm font-bold text-gray-700">Parent Category (Optional)</label>
            <select
              {...register('parentId')}
              className="w-full border border-gray-200 rounded-lg px-4 py-2 mt-1 appearance-none bg-white"
            >
              <option value="">Top Level Category</option>
              {parentOptions
                .filter(p => !editingCategory || p.id !== editingCategory.id)
                .map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg text-gray-600 font-bold hover:bg-gray-100 transition-all">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="flex-[2] bg-[#243e6b] text-white py-2 rounded-lg font-extrabold hover:bg-[#243e6b]/90 shadow-md transition-all disabled:opacity-50"
            >
              {editingCategory ? 'UPDATE CATEGORY' : 'CREATE CATEGORY'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};


export default AddCategoryModal;