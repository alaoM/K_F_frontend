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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-[#243e6b]">Bulk Product Upload</h2>
            <p className="text-sm text-gray-500">Upload multiple products via JSON file</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* UPLOAD ZONE */}
          {!file ? (
            <label className="border-2 border-dashed border-gray-200 rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-[#243e6b] hover:bg-blue-50/30 transition-all group">
              <input type="file" className="hidden" accept=".json" onChange={handleFileChange} />
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-[#243e6b] group-hover:bg-blue-50 transition-all mb-4">
                <Upload size={30} />
              </div>
              <p className="font-bold text-gray-700">Click to upload or drag and drop</p>
              <p className="text-sm text-gray-400 mt-1">Only .JSON files are supported</p>
            </label>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-blue-900">{file.name}</p>
                    <p className="text-xs text-blue-700">{(file.size / 1024).toFixed(2)} KB • {previewData?.length} items found</p>
                  </div>
                </div>
                <button onClick={() => { setFile(null); setPreviewData(null); }} className="text-xs font-bold text-rose-600 hover:underline">
                  Remove
                </button>
              </div>

              {/* PREVIEW TABLE */}
              <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500 font-bold text-[10px] uppercase">
                    <tr>
                      <th className="px-4 py-3">Product Name</th>
                      <th className="px-4 py-3">Price</th>
                      <th className="px-4 py-3">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {previewData?.slice(0, 5).map((item, i) => (
                      <tr key={i} className="text-gray-600">
                        <td className="px-4 py-3 font-medium">{item.title}</td>
                        <td className="px-4 py-3">₦{Number(item.price).toLocaleString()}</td>
                        <td className="px-4 py-3">{item.stock}</td>
                      </tr>
                    ))}
                    {previewData && previewData.length > 5 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-2 text-center text-xs text-gray-400 italic bg-gray-50/30">
                          ... and {previewData.length - 5} more items
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* TIPS */}
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3">
                <AlertCircle size={20} className="text-amber-600 shrink-0" />
                <div className="text-xs text-amber-800 space-y-1">
                  <p className="font-bold">Important Notes:</p>
                  <ul className="list-disc list-inside space-y-0.5 opacity-80">
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
        <div className="p-6 border-t flex justify-end gap-3 bg-gray-50/50">
          <button 
            onClick={onClose}
            disabled={isUploading}
            className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            disabled={!file || isUploading}
            onClick={handleUpload}
            className="px-8 py-2.5 bg-[#243e6b] text-white text-sm font-bold rounded-lg shadow-lg shadow-blue-900/10 hover:bg-[#243e6b]/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <CheckCircle2 size={18} />
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
