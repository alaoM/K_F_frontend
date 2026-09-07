"use client"
import { useAuth } from '@/context/AuthContext';
import { useApi } from '@/hooks/useApi';
import { CheckCircle2, Shield, Smartphone } from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'react-toastify';
import { TwoFactorModal } from '../../TwoFactorModal';
import ConfirmModal from '../../ConfirmModal';

const Security = () => {
    const {user, logout} = useAuth();
    const [loading, setLoading] = useState(false);
     
    const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '', confirm: '' });
    const fetcher = useApi()

    const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
    const [is2FAEnabled, setIs2FAEnabled] = useState(user?.isTwoFactorEnabled);

    /* ---------------- Password Change ---------------- */
    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pwd.newPassword !== pwd.confirm) return toast.error("New passwords do not match");

        setLoading(true);
        try {
            await fetcher('/api/users/change-password', {
                method: 'PATCH',
                body: JSON.stringify({ currentPassword: pwd.currentPassword, newPassword: pwd.newPassword })
            });

            toast.success("Password changed");
            setPwd({ currentPassword: '', newPassword: '', confirm: '' });
            logout();
        } catch (e: any) { toast.error(e.message); }
        finally { setLoading(false); }
    };

    const [showDisable2FAConfirm, setShowDisable2FAConfirm] = useState(false);

    /* ---------------- Toggle 2FA ---------------- */
    const handleToggle2FA = async () => {
        if (!is2FAEnabled) {
            setIs2FAModalOpen(true);
        } else {
            setShowDisable2FAConfirm(true);
        }
    };

    const confirmDisable2FA = async () => {
        try {
            await fetcher('/api/users/profile', {
                method: 'PATCH',
                body: JSON.stringify({ isTwoFactorEnabled: false })
            });
            setIs2FAEnabled(false);
            toast.warn("2FA Disabled");
        } catch { toast.error("Failed to disable 2FA"); }
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleChangePassword}>
                <div className="bg-white p-6 rounded-none border border-gray-200 shadow-xs space-y-6">
                    <h3 className="font-black text-xs uppercase tracking-wider text-[#111111] border-b border-gray-200 pb-4">Change Password</h3>
                    <div className="space-y-4 max-w-md">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-700">Current Password</label>
                            <input type="password" placeholder="••••••••"
                                value={pwd.currentPassword} onChange={(e) => setPwd({ ...pwd, currentPassword: e.target.value })}
                                className="w-full border border-gray-300 rounded-none px-3.5 py-2.5 outline-none focus:border-[#111111] transition-colors text-xs" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-700">New Password</label>
                            <input type="password" placeholder="••••••••"
                                value={pwd.newPassword} onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })} className="w-full border border-gray-300 rounded-none px-3.5 py-2.5 outline-none focus:border-[#111111] transition-colors text-xs" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-700">Confirm New Password</label>
                            <input type="password" placeholder="••••••••"
                                value={pwd.confirm} onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
                                className="w-full border border-gray-300 rounded-none px-3.5 py-2.5 outline-none focus:border-[#111111] transition-colors text-xs" />
                        </div>
                        <button disabled={loading} className="bg-[#111111] hover:bg-[#f6c947] hover:text-[#111111] text-white text-xs font-black uppercase tracking-wider px-6 py-2.5 rounded-none transition-colors cursor-pointer disabled:opacity-50">
                            {loading ? "Updating..." : "Update Password"}
                        </button>
                    </div>
                </div>
            </form>

            <div className="bg-white p-6 rounded-none border border-gray-200 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                    <div className="flex items-center gap-2">
                        <Shield size={18} className="text-[#111111]" />
                        <h3 className="font-black text-xs uppercase tracking-wider text-[#111111]">Two-Factor Authentication (2FA)</h3>
                    </div>
                    <span
                        className={`text-[9px] font-black px-2 py-0.5 rounded-none uppercase ${is2FAEnabled
                            ? "text-emerald-800 bg-emerald-100"
                            : "text-rose-800 bg-rose-100"
                            }`}
                    >
                        {is2FAEnabled ? "ENABLED" : "DISABLED"}
                    </span>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-1 space-y-4">
                        <p className="text-xs text-gray-600">
                            Add an extra layer of security to your account by requiring more than just a password to log in.
                        </p>
                        <div className="space-y-2">
                            <div className="flex items-start gap-2">
                                <div className="mt-0.5 text-emerald-600"><CheckCircle2 size={14} /></div>
                                <p className="text-xs text-gray-500">Protect your account from unauthorized access.</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="mt-0.5 text-emerald-600"><CheckCircle2 size={14} /></div>
                                <p className="text-xs text-gray-500">Use Authenticator apps like Google or Authy.</p>
                            </div>
                        </div>
                        <button
                            onClick={handleToggle2FA}
                            className={`text-xs font-black uppercase tracking-wider px-6 py-2.5 rounded-none transition-all shadow-xs cursor-pointer ${is2FAEnabled
                                ? "bg-red-50 text-red-700 hover:bg-red-100"
                                : "bg-[#111111] text-[#f6c947] hover:bg-[#f6c947] hover:text-[#111111]"
                                }`}
                        >
                            {is2FAEnabled ? "Disable 2FA" : "Enable 2FA"}
                        </button>
                    </div>
                    <div className="w-28 h-28 bg-gray-50 border-2 border-dashed border-gray-200 rounded-none flex items-center justify-center">
                        <Smartphone size={40} className="text-gray-300" />
                    </div>
                </div>
            </div>
            {is2FAModalOpen && (
                <TwoFactorModal
                    isOpen={is2FAModalOpen}
                    onClose={() => setIs2FAModalOpen(false)}
                    onSuccess={() => {
                        setIs2FAEnabled(true);
                        setIs2FAModalOpen(false);
                    }}
                />
            )}

            <ConfirmModal
                isOpen={showDisable2FAConfirm}
                onClose={() => setShowDisable2FAConfirm(false)}
                onConfirm={confirmDisable2FA}
                title="Disable Two-Factor Authentication"
                message="Disabling 2FA will remove the extra security layer from your account and leave it vulnerable to unauthorized access. Are you sure you want to proceed?"
                confirmText="Disable 2FA"
                variant="warning"
            />
        </div>
    )
}

export default Security