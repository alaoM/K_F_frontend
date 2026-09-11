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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-2xl rounded-none border-2 border-[#111111] p-6 space-y-6 shadow-2xl">

        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-3">
          <h3 className="text-lg font-black uppercase tracking-tight text-[#111111]">User Account Details</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 text-gray-500 hover:text-[#111111] border border-gray-300 rounded-none transition-colors">✕</button>
        </div>

        {/* Profile */}
        <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-gray-700">
          <div><b className="text-[#111111] uppercase tracking-wider text-[11px] block">Name:</b> {user.fullName}</div>
          <div><b className="text-[#111111] uppercase tracking-wider text-[11px] block">Email:</b> {user.email}</div>
          <div><b className="text-[#111111] uppercase tracking-wider text-[11px] block">Role:</b> {user.role}</div>
          <div><b className="text-[#111111] uppercase tracking-wider text-[11px] block">Joined:</b> {new Date(user.createdAt).toDateString()}</div>
          <div><b className="text-[#111111] uppercase tracking-wider text-[11px] block">Phone:</b> {user.phoneNumber ?? '—'}</div>
          <div><b className="text-[#111111] uppercase tracking-wider text-[11px] block">Location:</b> {user.location ?? '—'}</div>
        </div>

        {/* Security */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="font-black uppercase tracking-wider text-[#111111] text-xs mb-2">Account Verification Status</h4>
          <ul className="text-xs font-semibold space-y-1.5 text-gray-700">
            <li>Email Verified: {user.isEmailVerified ? '✅ Yes' : '❌ No'}</li>
            <li>2FA Enabled: {user.isTwoFactorEnabled ? '✅ Yes' : '❌ No'}</li>
            <li>KYC Verified: {user.isVerified ? '✅ Yes' : '❌ No'}</li>
            <li>Onboarded: {user.isOnboarded ? '✅ Yes' : '❌ No'}</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">
          {user.isSuspended ? (
            <button className="text-xs font-black uppercase tracking-wider px-4 py-2 rounded-none bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200 transition-colors" onClick={onActivate}>Activate Account</button>
          ) : (
            <button className='text-xs font-black uppercase tracking-wider px-4 py-2 rounded-none bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200 transition-colors' onClick={onSuspend}>Suspend Account</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetailModal