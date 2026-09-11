'use client';

import React, { useState } from 'react';
import { X, Upload, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useApi } from '@/hooks/useApi';

interface BulkUploadProps {
  onClose: () => void;
  onSuccess: () => void;
}

const BulkUpload: React.FC<BulkUploadProps> = ({ onClose, onSuccess }) => {
  const fetcher = useApi();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewData, setPreviewData] = useState<any[] | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/json' && !selectedFile.name.endsWith('.json')) {
      toast.error('Please upload a JSON file');
      return;
    }

    setFile(selectedFile);

    // Preview
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        setPreviewData(Array.isArray(json) ? json : [json]);
      } catch (err) {
        toast.error('Invalid JSON format');
        setFile(null);
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleUpload = async () => {
    if (!previewData) return;

    setIsUploading(true);
    try {
      const res = await fetcher('/api/products/bulk', {
        method: 'POST',
        body: JSON.stringify(previewData),
      });

      if (res.successCount > 0) {
        toast.success(`Successfully uploaded ${res.successCount} products!`);
        if (res.errorCount > 0) {
          toast.warning(`${res.errorCount} products failed to upload.`);
        }
        onSuccess();
        onClose();
      } else {
        toast.error('Failed to upload products. Check JSON format.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-none border-2 border-[#111111] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight text-[#111111]">Bulk Product Upload</h2>
            <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mt-0.5">Upload multiple products via JSON catalog file</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-[#111111] text-gray-600 hover:text-white rounded-none transition-colors border border-gray-300"
          >
            <X size={18} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* UPLOAD ZONE */}
          {!file ? (
            <label className="border-2 border-dashed border-gray-300 rounded-none p-12 flex flex-col items-center justify-center cursor-pointer hover:border-[#111111] hover:bg-gray-50 transition-all group">
              <input type="file" className="hidden" accept=".json" onChange={handleFileChange} />
              <div className="w-16 h-16 rounded-none bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 group-hover:text-[#111111] group-hover:bg-[#f6c947] group-hover:border-[#f6c947] transition-all mb-4">
                <Upload size={28} />
              </div>
              <p className="font-black uppercase text-xs tracking-wider text-[#111111]">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-500 mt-1 font-medium">Only .JSON files are supported</p>
            </label>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-300 rounded-none">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white border border-gray-200 rounded-none text-[#111111] shadow-sm">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="font-black text-xs uppercase tracking-wider text-[#111111]">{file.name}</p>
                    <p className="text-xs text-gray-600 font-medium">{(file.size / 1024).toFixed(2)} KB • {previewData?.length} items found</p>
                  </div>
                </div>
                <button onClick={() => { setFile(null); setPreviewData(null); }} className="text-xs font-black uppercase tracking-wider text-rose-600 hover:underline">
                  Remove
                </button>
              </div>

              {/* PREVIEW TABLE */}
              <div className="border border-gray-300 rounded-none overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-100 text-[#111111] font-black text-[11px] uppercase tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3">Product Name</th>
                      <th className="px-4 py-3">Price</th>
                      <th className="px-4 py-3">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {previewData?.slice(0, 5).map((item, i) => (
                      <tr key={i} className="text-gray-700 text-xs">
                        <td className="px-4 py-3 font-bold text-[#111111]">{item.title}</td>
                        <td className="px-4 py-3 font-semibold">₦{Number(item.price).toLocaleString()}</td>
                        <td className="px-4 py-3 font-semibold">{item.stock}</td>
                      </tr>
                    ))}
                    {previewData && previewData.length > 5 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-2 text-center text-xs text-gray-500 font-bold uppercase tracking-wider bg-gray-50">
                          ... and {previewData.length - 5} more items
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* TIPS */}
              <div className="p-4 bg-amber-50 border border-amber-300 rounded-none flex gap-3">
                <AlertCircle size={20} className="text-amber-800 shrink-0" />
                <div className="text-xs text-amber-900 space-y-1">
                  <p className="font-black uppercase tracking-wider text-[11px]">Important Notes:</p>
                  <ul className="list-disc list-inside space-y-0.5 opacity-90 font-medium">
                    <li>Ensure all categories IDs are correct</li>
                    <li>Images should be provided as absolute URLs</li>
                    <li>Status will default to 'draft' if not specified</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
          <button 
            onClick={onClose}
            disabled={isUploading}
            className="px-6 py-2.5 text-xs font-black uppercase tracking-wider text-gray-700 hover:bg-gray-200 rounded-none border border-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button 
            disabled={!file || isUploading}
            onClick={handleUpload}
            className="px-8 py-2.5 bg-[#f6c947] text-[#111111] border-2 border-[#f6c947] hover:bg-[#111111] hover:text-[#f6c947] hover:border-[#111111] text-xs font-black uppercase tracking-wider rounded-none shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-200"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-[#111111] border-t-transparent rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                Confirm Bulk Upload
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkUpload;
