'use client';

export const dynamic = 'force-dynamic';
import React, { useEffect, useState, useCallback } from 'react';
import { 
  MapPin, CheckCircle, XCircle, Loader2, Phone, Mail, Building, UserCheck, X
} from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { toast } from 'react-toastify';

export default function VerificationQueuePage() {
  const fetcher = useApi();
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [approveLoading, setApproveLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Reject Modal State
  const [rejectTarget, setRejectTarget] = useState<{ id: string; name: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const loadQueue = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetcher('/api/admin/verify/verify-queue'); 
      setQueue(res?.data || []);
    } catch (e) {
      toast.error("Failed to load verification queue"); 
    } finally {
      setLoading(false); 
    }
  }, [fetcher]);

  useEffect(() => { 
    loadQueue(); 
  }, [loadQueue]);

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    setApproveLoading(true);
    try {
      await fetcher(`/api/admin/verify/${id}`, { method: 'PATCH' });
      toast.success("Seller approved & verified successfully!");
      loadQueue();
    } catch (err: any) {
      toast.error(err.message || "Failed to approve seller");
    } finally {
      setProcessingId(null);
      setApproveLoading(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) {
      toast.warning("Please provide a reason for rejection");
      return;
    }

    setProcessingId(rejectTarget.id);
    setRejectLoading(true);
    try {
      await fetcher(`/api/admin/verify/${rejectTarget.id}/reject`, { 
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason.trim() }) 
      });
      toast.warn("Seller application rejected and notified.");
      setRejectTarget(null);
      setRejectReason('');
      loadQueue();
    } catch (err: any) {
      toast.error(err.message || "Failed to reject seller");
    } finally {
      setProcessingId(null);
      setRejectLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-[#111111]">
            Seller Verification Queue
          </h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mt-1">
            Review and approve pending seller onboarding applications ({queue.length} Pending)
          </p>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-none border-2 border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-gray-200 text-[11px] uppercase tracking-wider text-gray-500 font-black bg-gray-50/50">
                <th className="px-6 py-4">Seller Account</th>
                <th className="px-6 py-4">Contact Details</th>
                <th className="px-6 py-4">Store Location</th>
                <th className="px-6 py-4">Business / Trade Name</th>
                <th className="px-6 py-4">Application Date</th>
                <th className="px-6 py-4 text-right">Verification Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {loading && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400 font-bold uppercase tracking-widest text-xs">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#111111] border-t-transparent rounded-full animate-spin" />
                      Loading queue...
                    </div>
                  </td>
                </tr>
              )}

              {!loading && queue.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400 font-bold uppercase tracking-wider text-xs">
                    No pending seller verification requests.
                  </td>
                </tr>
              )}

              {!loading && queue.map((user) => {
                const initials = user.fullName
                  ?.split(' ')
                  .filter(Boolean)
                  .map((n: string) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase() || 'S';

                const isCurrentProcessing = processingId === user.id;

                return (
                  <tr key={user.id} className="hover:bg-gray-50/80 transition-colors group">
                    {/* USER */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-none bg-[#111111] text-[#f6c947] border border-[#111111] flex items-center justify-center font-black text-xs shrink-0 tracking-wider">
                          {initials}
                        </div>
                        <div>
                          <p className="font-black text-[#111111] text-xs uppercase tracking-tight group-hover:text-[#f6c947] transition-colors">
                            {user.fullName || 'Unnamed Seller'}
                          </p>
                          <p className="text-[11px] font-medium text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* CONTACT */}
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-600 space-y-1">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Phone size={13} className="text-gray-400" />
                          <span>{user.phoneNumber || 'No phone provided'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-medium">
                          <Mail size={13} className="text-gray-400" />
                          <span>{user.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* LOCATION */}
                    <td className="px-6 py-4">
                      <div className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                        <MapPin size={14} className="text-[#111111] shrink-0" />
                        <span>{user.location || 'Location Not Specified'}</span>
                      </div>
                    </td>

                    {/* BUSINESS */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Building size={14} className="text-gray-400 shrink-0" />
                        <span className="text-xs font-black text-[#111111] uppercase tracking-tight">
                          {user.businessName || 'N/A'}
                        </span>
                      </div>
                    </td>

                    {/* JOIN DATE */}
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString('en-NG', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* APPROVE */}
                        <button
                          onClick={() => handleApprove(user.id)}
                          disabled={isCurrentProcessing && approveLoading}
                          className="px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 border border-emerald-600 rounded-none text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                        >
                          {isCurrentProcessing && approveLoading ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <CheckCircle size={12} />
                          )}
                          Approve
                        </button>

                        {/* REJECT */}
                        <button
                          onClick={() => setRejectTarget({ id: user.id, name: user.fullName || user.email })}
                          disabled={isCurrentProcessing && rejectLoading}
                          className="px-3 py-1.5 bg-white text-rose-600 hover:bg-rose-50 border border-rose-300 rounded-none text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                        >
                          <XCircle size={12} />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Styled Rejection Modal */}
      {rejectTarget && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-none border-2 border-[#111111] shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-gray-200 pb-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-[#111111]">
                Reject Seller Application
              </h3>
              <button
                onClick={() => {
                  setRejectTarget(null);
                  setRejectReason('');
                }}
                className="p-1 text-gray-400 hover:text-[#111111] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-gray-600 font-medium">
              You are rejecting the seller application for <strong className="text-[#111111]">{rejectTarget.name}</strong>. Please provide a clear explanation below:
            </p>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-[#111111] mb-1">
                Reason for Rejection (Emailed to applicant)
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Incomplete business documents or invalid identification details provided..."
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-none text-xs text-[#111111] outline-none focus:border-[#111111] transition-all resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setRejectTarget(null);
                  setRejectReason('');
                }}
                disabled={rejectLoading}
                className="px-4 py-2 border border-gray-300 text-xs font-black uppercase tracking-wider text-gray-700 bg-white hover:bg-gray-100 rounded-none transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={rejectLoading || !rejectReason.trim()}
                className="px-4 py-2 bg-rose-600 text-white border border-rose-600 hover:bg-rose-700 text-xs font-black uppercase tracking-wider rounded-none transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {rejectLoading ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <XCircle size={13} />
                )}
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}