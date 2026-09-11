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
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-none border-2 border-[#111111] w-full max-w-md p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="space-y-1.5 border-b border-gray-200 pb-3">
          <h3 className="text-lg font-black uppercase tracking-tight text-[#111111]">{title}</h3>
          <p className="text-xs text-gray-600 font-medium">
            {message || (userName ? (
              <>
                You are about to delete <strong>{userName}</strong>. This action is reversible.
              </>
            ) : "Are you sure you want to proceed with this deletion?")}
          </p>
        </div>

        {showReasonField && (
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-[#111111]">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for deletion..."
              className="w-full border border-gray-300 rounded-none p-3 text-xs font-semibold focus:border-[#111111] outline-none transition-all resize-none bg-white"
              rows={3}
            />
          </div>
        )}

        <div className="flex justify-end items-center gap-3 pt-2">
          <button 
            className="px-5 py-2.5 text-xs font-black uppercase tracking-wider text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-none transition-colors" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-2.5 rounded-none text-xs font-black uppercase tracking-wider shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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