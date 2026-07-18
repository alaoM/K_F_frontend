"use client"

export const dynamic = 'force-dynamic'
import React, { useCallback, useEffect, useState } from 'react';
import {
    AlertCircle,
    Search,
    Filter
} from 'lucide-react';
import DisputeDetails from '@/app/components/AdminComponents/DisputeDetails';
import { useApi } from '@/hooks/useApi';
import { toast } from 'react-toastify';

export interface Message {
    id: string;
    sender: 'Buyer' | 'Seller' | 'Admin';
    text: string;
    timestamp: string;
}

export interface Dispute {
    id: string;
    orderId: string;
    order: any; // Added to match live data
    buyer: any; // Changed from string to any (object)
    reason: string;
    status: 'pending' | 'escalated' | 'resolved' | 'under-review' | 'resolved' | 'closed' | 'open' | 'awaiting_response' | 'resolved_released' | 'resolved_refunded'
    priority: 'high' | 'medium' | 'low'; // Matches lowercase from API
    createdAt: string;
    updatedAt?: string;
    adminResolutionNote?: string | null;
    messages: any[];
}

const initialDisputes: Dispute[] = [
    {
        id: 'DSP-1024',
        orderId: 'ORD-7281',
        buyer: 'Sarah Jenkins',
        seller: 'Urban Vogue',
        reason: 'Item not as described (Quality issue)',
        amount: 124.50,
        status: 'pending',
        priority: 'high',
        createdAt: 'Apr 05, 2026',
        messages: [
            { id: '1', sender: 'Buyer', text: "The fabric quality is much thinner than what was shown in the photos. I'd like a full refund.", timestamp: 'Apr 05, 10:30 AM' },
            { id: '2', sender: 'Seller', text: "We use premium cotton for all our shirts. Can you please provide photos of the issue?", timestamp: 'Apr 05, 11:15 AM' }
        ]
    },
    {
        id: 'DSP-1023',
        orderId: 'ORD-7275',
        buyer: 'Michael Chen',
        seller: 'Classic Threads',
        reason: 'Shipping Delay (Package lost)',
        amount: 89.99,
        status: 'escalated',
        priority: 'medium',
        createdAt: 'Apr 03, 2026',
        messages: [
            { id: '1', sender: 'Buyer', text: "It's been 10 days and the tracking hasn't updated. Where is my order?", timestamp: 'Apr 03, 09:00 AM' },
            { id: '2', sender: 'Admin', text: "We are contacting the courier to locate the package. Please wait 24-48 hours.", timestamp: 'Apr 04, 02:00 PM' }
        ]
    },
    {
        id: 'DSP-1022',
        orderId: 'ORD-7260',
        buyer: 'Emma Wilson',
        seller: 'Luxe Wear',
        reason: 'Wrong size delivered',
        amount: 245.00,
        status: 'resolved',
        priority: 'low',
        createdAt: 'Mar 28, 2026',
        messages: [
            { id: '1', sender: 'Buyer', text: "I ordered a Medium but received a Small.", timestamp: 'Mar 28, 04:30 PM' },
            { id: '2', sender: 'Seller', text: "We apologize for the mistake. We've shipped the correct size and you can keep the Small one.", timestamp: 'Mar 29, 10:00 AM' }
        ]
    }
];

export const getStatusColor = (status: Dispute['status']) => {
    switch (status) {
        case 'pending': return 'bg-amber-100 text-amber-700';
        case 'under-review': return 'bg-blue-100 text-blue-700';
        case 'resolved': return 'bg-emerald-100 text-emerald-700';
        case 'closed': return 'bg-gray-100 text-gray-600';
        case 'escalated': return 'bg-rose-100 text-rose-700';
        case 'awaiting_response': return 'bg-blue-100 text-blue-700';
        case 'resolved_released': return 'bg-indigo-100 text-indigo-700';
        case 'resolved_refunded': return 'bg-orange-100 text-orange-700';
        default: return 'bg-gray-100 text-gray-500';
    }
};

const DisputeCenter: React.FC = () => {
    const fetcher = useApi() as (url: string, options?: RequestInit) => Promise<{ data: Dispute[] }>;
    const [disputes, setDisputes] = useState<Dispute[]>([]);
    const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);

    const [loading, setLoading] = useState(true);

    // --- LOAD DATA ---
    const loadDisputes = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetcher('/api/admin/disputes');

            const data = res.data || [];
            console.log(data);

            setDisputes(data);

            const escalated = data.find((d) => d.status === 'escalated');

            if (escalated) setSelectedDispute(escalated);

        } catch (e: any) {
            toast.error(e.message || "Failed to load cases");
        } finally {
            setLoading(false);
        }
    }, [fetcher]);

    useEffect(() => { loadDisputes(); }, [loadDisputes]);

    const getPriorityColor = (priority: string) => {
        switch (priority?.toLowerCase()) {
            case 'high': return 'text-rose-600';
            case 'medium': return 'text-amber-600';
            case 'low': return 'text-blue-600';
            default: return 'text-gray-600';
        }
    };

    if (selectedDispute) {
        return (
            <DisputeDetails
                dispute={selectedDispute}
                onBack={() => setSelectedDispute(null)}
            />
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#243e6b]" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold text-[#243e6b]">Dispute Center</h1>
                    <p className="text-gray-500 text-sm">Mediate disputes</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search disputes..."
                            className="pl-10 pr-4 py-2 border rounded-md text-sm w-64"
                        />
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                    <button className="flex items-center gap-2 border px-4 py-2 rounded-md text-sm">
                        <Filter size={16} />
                        Filters
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-[#e2e2e2] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-[#e2e2e2] text-xs uppercase tracking-wider text-gray-500 font-bold bg-gray-50/50">
                                <th className="px-6 py-4">Dispute ID</th>
                                <th className="px-6 py-4">Parties</th>
                                <th className="px-6 py-4">Reason</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Priority</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {disputes.map((dispute) => (
                                <tr key={dispute.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-[#243e6b] text-sm">{dispute.id}</span>
                                        <p className="text-[10px] text-gray-400 mt-0.5">{dispute.createdAt}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-xs">
                                                <span className="text-gray-400 font-medium w-10">Buyer:</span>
                                                <span className="text-[#243e6b] font-bold">{dispute.buyer?.fullName || 'Unknown'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs">
                                                <span className="text-gray-400 font-medium w-10">Seller:</span>
                                                <span className="text-gray-600 font-medium">
                                                    {dispute.order?.items?.[0]?.seller?.businessName || 'Unknown'}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-700 font-medium truncate max-w-[200px]">{dispute.reason}</p>
                                        <p className="text-[10px] text-gray-400">Order: {dispute.orderId}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-bold text-[#243e6b]">₦{Number(dispute.order?.totalAmount || 0).toFixed(2)}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`flex items-center gap-1.5 text-xs font-bold ${getPriorityColor(dispute.priority)}`}>
                                            <AlertCircle size={14} />
                                            {dispute.priority}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide
                                                                      ${getStatusColor(dispute.status)}
                                                               `}>
                                            {dispute.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => setSelectedDispute(dispute)}
                                            className="bg-[#243e6b] text-white text-xs font-bold px-4 py-1.5 rounded hover:bg-[#243e6b]/90 transition-all"
                                        >
                                            VIEW CASE
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DisputeCenter;