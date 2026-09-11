'use client';

export const dynamic = 'force-dynamic';
import React, { useCallback, useEffect, useState } from 'react';
import { Mail, Phone, Search, Filter, Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useDebounce } from '@/hooks/debounceHook';
import { toast } from 'react-toastify';
import AdminUserDeleteModal from '@/app/components/AdminComponents/AdminDeleteModal';
import Link from 'next/link';
import AdminUserDetailModal from '@/app/components/AdminComponents/AdminDetailsModal';
import { formatCurrency } from '@/helpers/functions';

export interface UserData {
  id: string;
  fullName: string;
  email: string;
  role: 'buyer' | 'seller' | 'admin';
  createdAt: string;

  phoneNumber?: string | null;
  location?: string | null;

  isEmailVerified: boolean;
  isVerified: boolean;
  isOnboarded: boolean;
  isTwoFactorEnabled: boolean;

  status: 'active' | 'pending' | 'suspended';
  lifetimeSalesVolume: number;

  isSuspended?: boolean;
  deletedAt: Date;
}

const CustomerList: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const debouncedSearch = useDebounce(search, 500);
  const [role, setRole] = useState<string | undefined>();
  const [status, setStatus] = useState<string | undefined>();
  const limit = 10;

  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [deleteUser, setDeleteUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/customers?page=${page}&limit=${limit}&search=${debouncedSearch}&role=${role || ''}&status=${status || ''}`
      );
      if (!res.ok) throw new Error('Failed to fetch customers');

      const result = await res.json();
      setUsers(result.data || []);
      setTotal(result.total || 0);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, role, status]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateUserStatus = async (id: string, action: 'suspend' | 'activate' | 'delete') => {
    try {
      const res = await fetch(`/api/admin/customers/?id=${id}&action=${action}`, {
        method: 'PATCH',
      });
      if (!res.ok) throw new Error('Action failed');
      toast.success(`User ${action}d successfully`);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const softDeleteUser = async (id: string, reason: string) => {
    try {
      const res = await fetch(`/api/admin/customers/${id}/delete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      if (!res.ok) throw new Error('Delete failed');

      toast.success('User account deleted');
      setDeleteUser(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const restoreUser = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/customers/${id}/restore`, {
        method: 'PATCH',
      });

      if (!res.ok) throw new Error('Restore failed');

      toast.success('User restored successfully');
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-[#111111]">
            Customer Management
          </h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mt-1">
            Directory of buyers, sellers, and system administrators ({total} Total Records)
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-none border-2 border-gray-200 shadow-xs overflow-hidden">
        {/* Search, Filter & Pagination Bar */}
        <div className="p-4 border-b-2 border-gray-200 flex flex-wrap items-center justify-between gap-4 bg-gray-50/50">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by customer name, email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-none text-xs font-medium text-[#111111] bg-white outline-none focus:border-[#111111] transition-all"
            />
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Role Filter */}
            <div className="flex items-center gap-2 border border-gray-300 bg-white px-3 py-1.5 rounded-none text-xs font-bold uppercase tracking-wider text-[#111111]">
              <Filter size={13} className="text-gray-400" />
              <span>Role:</span>
              <select 
                value={role || ''} 
                onChange={(e) => {
                  setRole(e.target.value || undefined);
                  setPage(1);
                }}
                className="bg-transparent border-none outline-none font-black text-xs uppercase cursor-pointer"
              >
                <option value="">All Roles</option>
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 bg-white text-[#111111] border border-gray-300 text-xs font-black uppercase tracking-wider rounded-none hover:bg-[#111111] hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-[#111111] cursor-pointer"
              >
                Prev
              </button>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 bg-white text-[#111111] border border-gray-300 text-xs font-black uppercase tracking-wider rounded-none hover:bg-[#111111] hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-[#111111] cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-gray-200 text-[11px] uppercase tracking-wider text-gray-500 font-black bg-gray-50/50">
                <th className="px-6 py-4">Customer Details</th>
                <th className="px-6 py-4">Platform Role</th>
                <th className="px-6 py-4">Lifetime Spent</th>
                <th className="px-6 py-4">Account Status</th>
                <th className="px-6 py-4">Registration Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400 font-bold uppercase tracking-widest text-xs">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#111111] border-t-transparent rounded-full animate-spin" />
                      Loading customers...
                    </div>
                  </td>
                </tr>
              )}

              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400 font-bold uppercase tracking-wider text-xs">
                    No customers found matching your criteria.
                  </td>
                </tr>
              )}

              {!loading && users.map((user) => {
                const initials = user.fullName
                  ?.split(' ')
                  .filter(Boolean)
                  .map(n => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase() || 'U';

                const isDeleted = !!user.deletedAt;

                return (
                  <tr key={user.id} className="hover:bg-gray-50/80 transition-colors group">
                    {/* CUSTOMER */}
                    <td className="px-6 py-4">
                      <div
                        className="flex items-center gap-3.5 cursor-pointer"
                        onClick={() => setSelectedUser(user)}
                      >
                        <div className="w-10 h-10 rounded-none bg-[#111111] text-[#f6c947] border border-[#111111] flex items-center justify-center font-black text-xs shrink-0 tracking-wider">
                          {initials}
                        </div>
                        <div>
                          <p className="font-black text-[#111111] text-xs uppercase tracking-tight group-hover:text-[#f6c947] transition-colors">
                            {user.fullName || 'Anonymous User'}
                          </p>
                          <p className="text-[11px] font-medium text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* ROLE */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-none text-[10px] font-black uppercase tracking-wider border ${
                        user.role === 'admin'
                          ? 'bg-[#111111] text-[#f6c947] border-[#111111]'
                          : user.role === 'seller'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-gray-50 text-gray-700 border-gray-300'
                      }`}>
                        {user.role}
                      </span>
                    </td>

                    {/* TOTAL SPENT */}
                    <td className="px-6 py-4">
                      <span className="text-xs font-black text-[#111111]">
                        {formatCurrency(Number(user.lifetimeSalesVolume || 0))}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-4">
                      {isDeleted ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-none text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-300">
                          Deleted
                        </span>
                      ) : user.status === 'suspended' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-none text-[10px] font-black uppercase tracking-wider bg-red-50 text-red-700 border border-red-300">
                          Suspended
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-none text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-300">
                          Active
                        </span>
                      )}
                    </td>

                    {/* JOINED */}
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
                        {/* EMAIL */}
                        <Link
                          href={`mailto:${user.email}`}
                          title="Send Email"
                          className="p-1.5 text-gray-500 hover:text-[#111111] hover:bg-gray-100 rounded-none border border-transparent hover:border-gray-300 transition-all"
                        >
                          <Mail size={15} />
                        </Link>

                        {/* PHONE */}
                        {user.phoneNumber && (
                          <Link
                            href={`tel:${user.phoneNumber}`}
                            title="Call Phone"
                            className="p-1.5 text-gray-500 hover:text-[#111111] hover:bg-gray-100 rounded-none border border-transparent hover:border-gray-300 transition-all"
                          >
                            <Phone size={15} />
                          </Link>
                        )}

                        {/* VIEW PROFILE BUTTON */}
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 rounded-none transition-all cursor-pointer"
                        >
                          Details
                        </button>

                        {/* SUSPEND / ACTIVATE */}
                        {!isDeleted && (
                          <button
                            onClick={() =>
                              updateUserStatus(
                                user.id,
                                user.status === 'active' ? 'suspend' : 'activate'
                              )
                            }
                            className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-none border transition-all cursor-pointer ${
                              user.status === 'active'
                                ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                            }`}
                          >
                            {user.status === 'active' ? 'Suspend' : 'Activate'}
                          </button>
                        )}

                        {/* DELETE / RESTORE */}
                        {!isDeleted ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteUser(user);
                            }}
                            className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100 rounded-none transition-all cursor-pointer"
                          >
                            Delete
                          </button>
                        ) : (
                          <button
                            onClick={() => restoreUser(user.id)}
                            className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 rounded-none transition-all cursor-pointer"
                          >
                            Restore
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {deleteUser && (
        <AdminUserDeleteModal
          userName={deleteUser.fullName}
          onClose={() => setDeleteUser(null)}
          onConfirm={(reason) => softDeleteUser(deleteUser.id, reason)}
        />
      )}

      {selectedUser && (
        <AdminUserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSuspend={() => updateUserStatus(selectedUser.id, 'suspend')}
          onActivate={() => updateUserStatus(selectedUser.id, 'activate')}
        />
      )}
    </div>
  );
};

export default CustomerList;
