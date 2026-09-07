"use client";
import React from 'react';
import { AlertTriangle, Info, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmation Required',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      iconBg: 'bg-rose-100 text-rose-600',
      button: 'bg-rose-600 hover:bg-rose-700 text-white',
      icon: <Trash2 size={22} />,
    },
    warning: {
      iconBg: 'bg-amber-100 text-amber-800',
      button: 'bg-[#111111] hover:bg-[#f6c947] hover:text-[#111111] text-white',
      icon: <AlertTriangle size={22} />,
    },
    info: {
      iconBg: 'bg-blue-100 text-blue-700',
      button: 'bg-[#111111] hover:bg-[#f6c947] hover:text-[#111111] text-white',
      icon: <Info size={22} />,
    },
  };

  const style = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-none w-full max-w-md shadow-2xl overflow-hidden border border-gray-200 animate-in zoom-in-95 duration-200">
        
        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className={`w-10 h-10 rounded-none flex items-center justify-center shrink-0 ${style.iconBg}`}>
              {style.icon}
            </div>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-none hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-black uppercase text-[#111111]">{title}</h3>
            <p className="text-xs text-gray-600 leading-relaxed">{message}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-none text-xs font-bold uppercase tracking-wider text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={async () => {
              await onConfirm();
              onClose();
            }}
            disabled={isLoading}
            className={`px-5 py-2 rounded-none text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${style.button} disabled:opacity-50`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ConfirmModal;
