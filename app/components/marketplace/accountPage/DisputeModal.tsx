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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      
      <div className="bg-white w-full max-w-lg rounded-xl p-6">
        
        <h2 className="text-lg font-semibold mb-4">
          Raise Dispute
        </h2>

        {/* Reason */}
        <input
          placeholder="Reason (e.g. Rotten Produce)"
          className="w-full border border-[#e2e2e2] p-3 rounded mb-3"
          value={form.reason}
          onChange={(e) => handleChange('reason', e.target.value)}
        />

        {/* Priority */}
        <select
          className="w-full border border-[#e2e2e2] p-3 rounded mb-3"
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
          className="w-full border border-[#e2e2e2] p-3 rounded mb-3"
          rows={4}
          value={form.message}
          onChange={(e) => handleChange('message', e.target.value)}
        />

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[#e2e2e2] rounded"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            {loading ? 'Submitting...' : 'Submit Dispute'}
          </button>
        </div>
      </div>
    </div>
  )
}