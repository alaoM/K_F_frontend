'use client';

export const dynamic = 'force-dynamic';
import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  Search,
  Filter,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import DisputeDetails from '@/app/components/AdminComponents/DisputeDetails';
import { useApi } from '@/hooks/useApi';
import { toast } from 'react-toastify';
import { formatCurrency } from '@/helpers/functions';

export interface Message {
  id: string;
  sender: 'Buyer' | 'Seller' | 'Admin';
  text: string;
  timestamp: string;
}

export interface Dispute {
  id: string;
  orderId?: string;
  order?: any;
  buyer?: any;
  seller?: any;
  amount?: number;
  reason: string;
  status: 'pending' | 'escalated' | 'resolved' | 'under-review' | 'closed' | 'open' | 'awaiting_response' | 'resolved_released' | 'resolved_refunded';
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  updatedAt?: string;
  adminResolutionNote?: string | null;
  messages: any[];
}

export const getStatusColor = (status: Dispute['status'] | string) => {
  switch (status) {
    case 'pending':
    case 'open':
      return 'bg-amber-50 text-amber-800 border-amber-300';
    case 'under-review':
    case 'awaiting_response':
      return 'bg-blue-50 text-blue-800 border-blue-300';
    case 'resolved':
    case 'resolved_released':
    case 'resolved_refunded':
      return 'bg-emerald-50 text-emerald-800 border-emerald-300';
    case 'closed':
      return 'bg-gray-100 text-gray-700 border-gray-300';
    case 'escalated':
      return 'bg-rose-50 text-rose-800 border-rose-300';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-300';
  }
};

const DisputeCenter: React.FC = () => {
  const fetcher = useApi() as (url: string, options?: RequestInit) => Promise<{ data: Dispute[] }>;
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // --- LOAD DATA ---
  const loadDisputes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetcher('/api/admin/disputes');
      const data = res.data || [];
      setDisputes(data);

      const escalated = data.find((d) => d.status === 'escalated');
      if (escalated && !selectedDispute) {
        // Keep focus on escalated if initial load
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to load dispute cases");
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => { 
    loadDisputes(); 
  }, [loadDisputes]);

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'text-rose-600 bg-rose-50 border-rose-200';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const filteredDisputes = disputes.filter((d) => {
    const matchesSearch = 
      d.id.toLowerCase().includes(search.toLowerCase()) ||
      d.reason?.toLowerCase().includes(search.toLowerCase()) ||
      d.buyer?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      (d.order?.id && d.order.id.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (selectedDispute) {
    return (
      <DisputeDetails
        dispute={selectedDispute as any}
        onBack={() => setSelectedDispute(null)}
        onResolved={loadDisputes}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-[#111111]">
            Dispute & Resolution Center
          </h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mt-1">
            Escrow mediation, dispute triage, and buyer/seller communication ({disputes.length} Total Cases)
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-none border-2 border-gray-200 shadow-xs overflow-hidden">
        {/* Search & Filter Bar */}
        <div className="p-4 border-b-2 border-gray-200 flex flex-wrap items-center justify-between gap-4 bg-gray-50/50">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by dispute ID, buyer, order #..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-none text-xs font-medium text-[#111111] bg-white outline-none focus:border-[#111111] transition-all"
            />
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 border border-gray-300 bg-white px-3 py-1.5 rounded-none text-xs font-bold uppercase tracking-wider text-[#111111]">
              <Filter size={13} className="text-gray-400" />
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent border-none outline-none font-black text-xs uppercase cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="escalated">Escalated</option>
                <option value="awaiting_response">Awaiting Response</option>
                <option value="resolved_released">Resolved (Released)</option>
                <option value="resolved_refunded">Resolved (Refunded)</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-gray-200 text-[11px] uppercase tracking-wider text-gray-500 font-black bg-gray-50/50">
                <th className="px-6 py-4">Dispute ID</th>
                <th className="px-6 py-4">Parties Involved</th>
                <th className="px-6 py-4">Dispute Reason</th>
                <th className="px-6 py-4">Order Value</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Resolution Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {loading && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400 font-bold uppercase tracking-widest text-xs">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#111111] border-t-transparent rounded-full animate-spin" />
                      Loading dispute cases...
                    </div>
                  </td>
                </tr>
              )}

              {!loading && filteredDisputes.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400 font-bold uppercase tracking-wider text-xs">
                    No dispute cases found matching your filter.
                  </td>
                </tr>
              )}

              {!loading && filteredDisputes.map((dispute) => (
                <tr key={dispute.id} className="hover:bg-gray-50/80 transition-colors group">
                  {/* ID */}
                  <td className="px-6 py-4">
                    <span className="font-mono font-black text-[#111111] text-xs">
                      #{dispute.id.slice(0, 8)}
                    </span>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                      {new Date(dispute.createdAt).toLocaleDateString('en-NG', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </td>

                  {/* PARTIES */}
                  <td className="px-6 py-4">
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-400 font-black text-[10px] uppercase tracking-wider w-12">Buyer:</span>
                        <span className="text-[#111111] font-bold">{dispute.buyer?.fullName || 'Anonymous'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-400 font-black text-[10px] uppercase tracking-wider w-12">Seller:</span>
                        <span className="text-gray-700 font-medium">
                          {dispute.order?.items?.[0]?.seller?.businessName || 'Verified Merchant'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* REASON */}
                  <td className="px-6 py-4">
                    <p className="text-xs text-[#111111] font-bold truncate max-w-[200px]">
                      {dispute.reason}
                    </p>
                    <p className="text-[10px] font-mono text-gray-400">
                      Order: #{dispute.order?.id ? dispute.order.id.slice(0, 8) : dispute.orderId?.slice(0, 8)}
                    </p>
                  </td>

                  {/* AMOUNT */}
                  <td className="px-6 py-4">
                    <span className="text-xs font-black text-[#111111]">
                      {formatCurrency(Number(dispute.order?.totalAmount || dispute.amount || 0))}
                    </span>
                  </td>

                  {/* PRIORITY */}
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-none text-[10px] font-black uppercase tracking-wider border ${getPriorityColor(dispute.priority)}`}>
                      <AlertCircle size={12} />
                      {dispute.priority}
                    </div>
                  </td>

                  {/* STATUS */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-none text-[10px] font-black uppercase tracking-wider border ${getStatusColor(dispute.status)}`}>
                      {dispute.status.replace(/_/g, ' ')}
                    </span>
                  </td>

                  {/* ACTION */}
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedDispute(dispute)}
                      className="px-3 py-1.5 bg-[#f6c947] text-[#111111] border border-[#f6c947] hover:bg-[#111111] hover:text-[#f6c947] hover:border-[#111111] rounded-none text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-1"
                    >
                      <span>View Case</span>
                      <ArrowRight size={12} />
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