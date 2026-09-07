'use client'

import { useState } from 'react'
import { useApi } from '@/hooks/useApi'
import { toast } from 'react-toastify'

type Props = {
  orderId: string | null
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function DisputeModal({
  orderId,
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const fetcher = useApi()

  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    reason: '',
    message: '',
    priority: 'MEDIUM',
    attachments: [] as string[],
  })

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async () => {
  if (!form.reason || !form.message) {
    toast.error("Reason and message are required")
    return
  }

  setLoading(true)

  try {
    const resp = await fetcher(`/api/orders/${orderId}/dispute`, {
      method: 'POST',
      body: JSON.stringify(form),
    })

    
    if (resp?.success) {
      toast.success(resp.message || "Dispute submitted successfully")
      onClose()
      onSuccess?.()
    } else {
      toast.error(resp?.message || "Something went wrong")
    }

  } catch (err: any) {
    toast.error(err?.message || "Failed to submit dispute")
  } finally {
    setLoading(false)
  }
}

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      
      <div className="bg-white w-full max-w-lg rounded-none p-6 border border-gray-200 shadow-2xl">
        
        <h2 className="text-base font-black uppercase text-[#111111] mb-4">
          Raise Dispute
        </h2>

        {/* Reason */}
        <input
          placeholder="Reason (e.g. Defective item, wrong size)"
          className="w-full border border-gray-300 p-3 rounded-none mb-3 text-xs outline-none focus:border-[#111111]"
          value={form.reason}
          onChange={(e) => handleChange('reason', e.target.value)}
        />

        {/* Priority */}
        <select
          className="w-full border border-gray-300 p-3 rounded-none mb-3 text-xs outline-none focus:border-[#111111]"
          value={form.priority}
          onChange={(e) => handleChange('priority', e.target.value)}
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>

        {/* Message */}
        <textarea
          placeholder="Describe the issue..."
          className="w-full border border-gray-300 p-3 rounded-none mb-3 text-xs outline-none focus:border-[#111111]"
          rows={4}
          value={form.message}
          onChange={(e) => handleChange('message', e.target.value)}
        />

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-none text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-none text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Dispute'}
          </button>
        </div>
      </div>
    </div>
  )
}