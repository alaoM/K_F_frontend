'use client'

export const dynamic = 'force-dynamic'

import React, { useCallback, useEffect, useState } from 'react'
import { AlertCircle, Search, Filter } from 'lucide-react'
import DisputeDetails from '@/app/components/AdminComponents/DisputeDetails'
import { useApi } from '@/hooks/useApi'
import { toast } from 'react-toastify'
import { formatCurrency } from '@/helpers/functions'
// API shape
export interface ApiDispute {
    id: string
    reason: string
    status: 'open' | 'awaiting_response' | 'escalated' | 'resolved_released' | 'resolved_refunded' | 'closed'
    priority: 'low' | 'medium' | 'high'  // lowercase from API
    adminResolutionNote: string | null
    createdAt: string
    updatedAt: string
    order: {
        id: string
        totalAmount: string
        paymentStatus: string
        paymentMethod: string
        createdAt: string
        items?: Array<{
            seller?: {
                businessName: string
            }
        }>
    }
    buyer: {
        id: string
        fullName: string
        email: string
    } | null
    messages: ApiMessage[]
}

export interface ApiMessage {
    id: string
    message: string
    attachments: string[] | null
    createdAt: string
    sender: {
        id: string
        fullName: string
        role: string      // 'buyer' | 'seller' | 'admin'
    }
}
// ✅ Status values match actual API
const STATUS_STYLE: Record<string, string> = {
    open: 'bg-amber-100 text-amber-800',
    awaiting_response: 'bg-blue-100 text-blue-800',
    escalated: 'bg-red-100 text-red-800',
    resolved_released: 'bg-green-100 text-green-800',
    resolved_refunded: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-600',
}

const STATUS_LABEL: Record<string, string> = {
    open: 'Open',
    awaiting_response: 'Awaiting response',
    escalated: 'Escalated',
    resolved_released: 'Resolved — released',
    resolved_refunded: 'Resolved — refunded',
    closed: 'Closed',
}

// ✅ Priority values are lowercase from API
const PRIORITY_STYLE: Record<string, string> = {
    high: 'text-rose-600',
    medium: 'text-amber-600',
    low: 'text-blue-600',
}

export const getStatusColor = (status: string) => STATUS_STYLE[status] ?? 'bg-gray-100 text-gray-600'

const DisputeCenter = () => {
    const fetcher = useApi()
    const [disputes, setDisputes] = useState<ApiDispute[]>([])
    const [selectedDispute, setSelectedDispute] = useState<ApiDispute | null>(null)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    const loadDisputes = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetcher('/api/admin/disputes')
            setDisputes(res.data || [])
        } catch (e: any) {
            toast.error(e.message || 'Failed to load disputes')
        } finally {
            setLoading(false)
        }
    }, [fetcher])

    useEffect(() => { loadDisputes() }, [loadDisputes])

    const filtered = disputes.filter(d =>
        d.id.toLowerCase().includes(search.toLowerCase()) ||
        d.reason.toLowerCase().includes(search.toLowerCase()) ||
        d.buyer?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        d.order.id.toLowerCase().includes(search.toLowerCase())
    )

    if (selectedDispute) {
        return (
            <DisputeDetails
                dispute={selectedDispute}
                onBack={() => setSelectedDispute(null)}
                onResolved={loadDisputes}
            />
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold text-[#243e6b]">Dispute Center</h1>
                    <p className="text-gray-500 text-sm">Mediate disputes between buyers and sellers</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search by ID, buyer, reason..."
                            className="pl-10 pr-4 py-2 border rounded-md text-sm w-64"
                        />
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-[#e2e2e2] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-[#e2e2e2] text-xs uppercase tracking-wider text-gray-500 font-bold bg-gray-50/50">
                                <th className="px-6 py-4">Dispute</th>
                                <th className="px-6 py-4">Buyer</th>
                                <th className="px-6 py-4">Reason</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Priority</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-sm">
                                        Loading disputes...
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-sm">
                                        No disputes found
                                    </td>
                                </tr>
                            ) : filtered.map(dispute => (
                                <tr key={dispute.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        {/* ✅ Use actual UUID shortened */}
                                        <span className="font-bold text-[#243e6b] text-sm">
                                            #{dispute.id.slice(0, 8)}
                                        </span>
                                        <p className="text-[10px] text-gray-400 mt-0.5">
                                            {new Date(dispute.createdAt).toLocaleDateString('en-NG', {
                                                day: 'numeric', month: 'short', year: 'numeric'
                                            })}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        {/* ✅ buyer comes from dispute.buyer.fullName */}
                                        <p className="text-sm font-semibold text-[#243e6b]">
                                            {dispute.buyer?.fullName ?? 'Unknown'}
                                        </p>
                                        <p className="text-[10px] text-gray-400">
                                            {dispute.buyer?.email}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-700 font-medium truncate max-w-[200px]">
                                            {dispute.reason}
                                        </p>
                                        {/* ✅ orderId from dispute.order.id */}
                                        <p className="text-[10px] text-gray-400">
                                            Order: #{dispute.order.id.slice(0, 8)}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        {/* ✅ amount from dispute.order.totalAmount */}
                                        <span className="text-sm font-bold text-[#243e6b]">
                                            {formatCurrency(Number(dispute.order.totalAmount))}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {/* ✅ priority is lowercase from API */}
                                        <div className={`flex items-center gap-1.5 text-xs font-bold ${PRIORITY_STYLE[dispute.priority] ?? 'text-gray-500'}`}>
                                            <AlertCircle size={14} />
                                            {dispute.priority.charAt(0).toUpperCase() + dispute.priority.slice(1)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${STATUS_STYLE[dispute.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                            {STATUS_LABEL[dispute.status] ?? dispute.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => setSelectedDispute(dispute)}
                                            className="bg-[#243e6b] text-white text-xs font-bold px-4 py-1.5 rounded hover:bg-[#243e6b]/90 transition-all"
                                        >
                                            View case
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default DisputeCenter