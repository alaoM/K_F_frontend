'use client';
import React, { useEffect, useState, useCallback } from 'react';

import { 
     MapPin, CheckCircle, XCircle, Loader2, Phone, Mail
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

   
    const loadQueue = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetcher('/api/admin/verify/verify-queue'); 
            setQueue(res?.data);
        } catch (e) { toast.error("Failed to load queue"); }
        finally { setLoading(false); }
    }, [fetcher]);

    useEffect(() => { loadQueue(); }, [loadQueue]);

    const handleApprove = async (id: string) => {
    
        setApproveLoading(true);
        try {
            await fetcher(`/api/admin/verify/${id}`, { method: 'PATCH' });
            toast.success("Seller verified successfully!");
            loadQueue();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
         
             setApproveLoading(false);
        }
    };

    const handleReject = async (id: string) => {
         setRejectLoading(true);
    const reason = window.prompt("Please provide a reason for rejection (this will be emailed to the user):");
   
    if (!reason) return; // Don't proceed if they cancel or leave empty

    setProcessingId(id);
    try {
        await fetcher(`/api/admin/verify/${id}/reject`, { 
            method: 'PATCH',
            body: JSON.stringify({ reason }) 
        });
        toast.warn("User rejected and notified.");
        loadQueue();
    } catch (err: any) {
        toast.error(err.message);
    } finally {
        setProcessingId(null);
         setRejectLoading(false);
    }
};

    return (
     <div className="bg-white rounded-xl border border-[#e2e2e2] shadow-sm overflow-hidden">

  {/* TABLE */}
  <div className="overflow-x-auto">
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-[#e2e2e2] text-xs uppercase tracking-wider text-gray-500 font-bold">
          <th className="px-6 py-4">User</th>
          <th className="px-6 py-4">Contact</th>
          <th className="px-6 py-4">Location</th>
          <th className="px-6 py-4">Business</th>
          <th className="px-6 py-4">Joined</th>
          <th className="px-6 py-4 text-right">Actions</th>
        </tr>
      </thead>

      <tbody className="divide-y divide-[#e2e2e2]">

        {loading && (
          <tr>
            <td colSpan={6} className="text-center py-10">
              <Loader2 className="animate-spin mx-auto text-emerald-600" />
            </td>
          </tr>
        )}

        {!loading && queue.length === 0 && (
          <tr>
            <td colSpan={6} className="text-center py-10 text-gray-400">
              No pending verifications
            </td>
          </tr>
        )}

        {queue.map((user) => {
          const initials = user.fullName
            ?.split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase();

          return (
            <tr key={user.id} className="hover:bg-gray-50 group">

              {/* USER */}
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                    {initials}
                  </div>
                  <div>
                    <p className="font-bold text-[#243e6b] text-sm">
                      {user.fullName}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
              </td>

              {/* CONTACT */}
              <td className="px-6 py-4">
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex items-center gap-1">
                    <Phone size={12} /> {user.phoneNumber || 'N/A'}
                  </div>
                  <div className="flex items-center gap-1">
                    <Mail size={12} /> {user.email}
                  </div>
                </div>
              </td>

              {/* LOCATION */}
              <td className="px-6 py-4">
                <div className="text-sm text-gray-600 flex items-center gap-1">
                  <MapPin size={14} className="text-gray-400" />
                  {user.location || 'N/A'}
                </div>
              </td>

              {/* BUSINESS */}
              <td className="px-6 py-4">
                <span className="text-sm font-medium text-gray-700">
                  {user.businessName || 'N/A'}
                </span>
              </td>

              {/* JOIN DATE */}
              <td className="px-6 py-4">
                <span className="text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </td>

              {/* ACTIONS */}
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">

                  {/* APPROVE */}
                  <button
                    onClick={() => handleApprove(user.id)}
                    disabled={approveLoading}
                    className="text-xs px-3 py-1.5 rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-semibold flex items-center gap-1"
                  >
                    {approveLoading
                      ? <Loader2 size={12} className="animate-spin" />
                      : <CheckCircle size={12} />}
                    Approve
                  </button>

                  {/* REJECT */}
                  <button
                    onClick={() => handleReject(user.id)}
                    disabled={rejectLoading}
                    className="text-xs px-3 py-1.5 rounded bg-rose-100 text-rose-600 hover:bg-rose-200 font-semibold flex items-center gap-1"
                  >
                    {rejectLoading
                      ? <Loader2 size={12} className="animate-spin" />
                      : <XCircle size={12} />}
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
    );
}