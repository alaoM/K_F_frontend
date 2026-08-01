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
      button: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20',
      icon: <Trash2 size={24} />,
    },
    warning: {
      iconBg: 'bg-amber-100 text-amber-700',
      button: 'bg-[#243e6b] hover:bg-[#1a2e50] text-white shadow-blue-900/20',
      icon: <AlertTriangle size={24} />,
    },
    info: {
      iconBg: 'bg-blue-100 text-blue-600',
      button: 'bg-[#243e6b] hover:bg-[#1a2e50] text-white shadow-blue-900/20',
      icon: <Info size={24} />,
    },
  };

  const style = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
        
        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${style.iconBg}`}>
              {style.icon}
            </div>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg font-extrabold text-[#243e6b]">{title}</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{message}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-200/70 transition-colors"
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
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition-all ${style.button} disabled:opacity-50`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ConfirmModal;
