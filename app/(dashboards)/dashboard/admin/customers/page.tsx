'use client';
import React, { use, useCallback, useEffect, useState } from 'react';
import { MoreVertical, Mail, Phone, UserPlus, Search, Filter } from 'lucide-react';
import { useDebounce } from '@/hooks/debounceHook';
import { toast } from 'react-toastify';
import AdminUserDeleteModal from '@/app/components/AdminComponents/AdminDeleteModal';
import Link from 'next/link';
import AdminUserDetailModal from '@/app/components/AdminComponents/AdminDetailsModal';



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
  deletedAt: Date
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

  const [deleteUser, setDeleteUser] = useState<UserData | null>(null)

  const [loading, setLoading] = useState(false)

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/customers?page=${page}&limit=${limit}&search=${debouncedSearch}&role=${role || ''}&status=${status || ''}`
      );
      if (!res.ok) throw new Error('Failed to fetch customers');

      const result = await res.json();
      setUsers(result.data);
      setTotal(result.total);
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
      toast.success(`User ${action}d`);
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
      })

      if (!res.ok) throw new Error('Delete failed')

      toast.success('User deleted')
      setDeleteUser(null)
      fetchUsers()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const restoreUser = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/customers/${id}/restore`, {
        method: 'PATCH',
      })

      if (!res.ok) throw new Error('Restore failed')

      toast.success('User restored')
      fetchUsers()
    } catch (err: any) {
      toast.error(err.message)
    }
  }


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#243e6b]">Customers</h1>
          <p className="text-gray-500 text-sm">Manage your customer relationships and data.</p>
        </div>

      </div>

      <div className="bg-white rounded-xl border border-[#e2e2e2] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#e2e2e2] flex flex-wrap items-center justify-between gap-4 bg-gray-50/50">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customers by name or email..."
              className="w-full pl-10 pr-4 py-2 border border-[#e2e2e2] rounded-md text-sm outline-none focus:border-[#243e6b]"
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>


          <div className="flex justify- items-center gap-2 my-4 mr-4">
            <button className="flex items-center gap-2 border border-[#e2e2e2] px-4 py-2 rounded-md text-gray-600 hover:bg-gray-50 transition-colors text-sm">
              <Filter size={16} />
              Filter
              <select onChange={(e) => setRole(e.target.value || undefined)}>
                <option value="">All Roles</option>
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
                <option value="admin">Admin</option>
              </select>
            </button>

            <button className='bg-[#243e6b] text-white px-4 py-1 rounded-md' disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              Prev
            </button>

            <span className="text-sm">
              Page {page} of {Math.ceil(total / limit)}
            </span>

            <button

              className='bg-[#243e6b] text-white px-4 py-1 rounded-md'
              disabled={page * limit >= total}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </button>

          </div>


        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#e2e2e2] text-xs uppercase tracking-wider text-gray-500 font-bold">
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Role</th>

                <th className="px-6 py-4">Orders</th>
                <th className="px-6 py-4">Total Spent</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e2e2]">
              {loading && (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-400">
                    Loading...
                  </td>
                </tr>
              )}
              {users.map((user) => {
                const initials = user.fullName
                  ?.split(' ')
                  .map(n => n[0])
                  .join('')
                  .toUpperCase();

                const isDeleted = !!user.deletedAt;

                return (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors group">

                    {/* CUSTOMER */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setSelectedUser(user)}>
                        <div className="w-10 h-10 rounded-full bg-[#243e6b]/10 text-[#243e6b] flex items-center justify-center font-bold text-sm">
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
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 font-medium">
                        {user.role}
                      </span>
                    </td>
                    {/* ORDERS (fallback since backend doesn't provide yet) */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 font-medium">
                        0 orders
                      </span>
                    </td>

                    {/* TOTAL SPENT */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-[#243e6b]">
                        ₦{Number(user.lifetimeSalesVolume || 0).toLocaleString()}
                      </span>
                    </td>

                    {/* JOINED */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">

                        {/* EMAIL */}
                        <Link href={`mailto:${user.email}`} className="cursor-pointer p-1.5 text-gray-400 hover:text-[#243e6b]">
                          <Mail size={16} />
                        </Link>

                        {/* PHONE */}
                        <Link href={`tel:${user.phoneNumber}`} className="cursor-pointer p-1.5 text-gray-400 hover:text-gray-600">
                          <Phone size={16} />
                        </Link>

                        {/* SUSPEND / ACTIVATE */}
                        {!isDeleted && (
                          <button
                            onClick={() =>
                              updateUserStatus(
                                user.id,
                                user.status === 'active' ? 'suspend' : 'activate'
                              )
                            }
                            className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                          >
                            {user.status === 'active' ? 'Suspend' : 'Activate'}
                          </button>
                        )}

                        {/* DELETE / RESTORE */}
                        {!isDeleted ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setDeleteUser(user)
                            }}
                            className="text-xs px-2 py-1 rounded bg-rose-100 text-rose-600 hover:bg-rose-200"
                          >
                            Delete
                          </button>
                        ) : (
                          <button
                            onClick={() => restoreUser(user.id)}
                            className="text-xs px-2 py-1 rounded bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                          >
                            Restore
                          </button>
                        )}

                        <button className="p-1.5 text-gray-400">
                          <MoreVertical size={16} />
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
      {deleteUser && (
        <AdminUserDeleteModal
          userName={deleteUser.fullName}
          onClose={() => setDeleteUser(null)}
          onConfirm={(reason) =>
            softDeleteUser(deleteUser.id, reason)
          }
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
