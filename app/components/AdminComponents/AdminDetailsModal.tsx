 import { UserData } from '@/app/(dashboards)/dashboard/admin/customers/page';
import React from 'react'

interface Props {
  user: UserData;
  onClose: () => void;
  onSuspend: () => void;
  onActivate: () => void;
}

const AdminUserDetailModal = ({ user, onClose, onSuspend, onActivate }: Props) => {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-xl p-6 space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">User Details</h3>
          <button onClick={onClose}>✕</button>
        </div>

        {/* Profile */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><b>Name:</b> {user.fullName}</div>
          <div><b>Email:</b> {user.email}</div>
          <div><b>Role:</b> {user.role}</div>
          <div><b>Joined:</b> {new Date(user.createdAt).toDateString()}</div>
          <div><b>Phone:</b> {user.phoneNumber ?? '—'}</div>
          <div><b>Location:</b> {user.location ?? '—'}</div>
        </div>

        {/* Security */}
        <div className="border-t pt-4">
          <h4 className="font-bold mb-2">Security</h4>
          <ul className="text-sm space-y-1">
            <li>Email Verified: {user.isEmailVerified ? '✅' : '❌'}</li>
            <li>2FA Enabled: {user.isTwoFactorEnabled ? '✅' : '❌'}</li>
            <li>KYC Verified: {user.isVerified ? '✅' : '❌'}</li>
            <li>Onboarded: {user.isOnboarded ? '✅' : '❌'}</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          {user.isSuspended ? (
            <button className="text-xs px-2 py-1 rounded bg-emerald-100 text-emerald-600 hover:bg-emerald-200" onClick={onActivate}>Activate</button>
          ) : (
            <button className='text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200'  onClick={onSuspend}>Suspend</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetailModal