import React, { useState } from 'react'

interface Props {
  isOpen?: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
  title?: string
  message?: string
  userName?: string // Backward compatibility
  showReasonField?: boolean
}

const AdminDeleteModal: React.FC<Props> = ({
  isOpen = true,
  onClose,
  onConfirm,
  title = "Confirm Deletion",
  message,
  userName,
  showReasonField = true,
}) => {
  const [reason, setReason] = useState('')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">
            {message || (userName ? (
              <>
                You are about to delete <strong>{userName}</strong>. This action is reversible.
              </>
            ) : "Are you sure you want to proceed with this deletion?")}
          </p>
        </div>

        {showReasonField && (
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for deletion..."
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all resize-none"
              rows={3}
            />
          </div>
        )}

        <div className="flex justify-end items-center gap-3 pt-2">
          <button 
            className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-lg shadow-red-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={showReasonField && !reason.trim()}
            onClick={() => onConfirm(reason)}
          >
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminDeleteModal