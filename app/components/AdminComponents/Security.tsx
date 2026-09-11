"use client"
import { useAuth } from '@/context/AuthContext';
import { useApi } from '@/hooks/useApi';
import { CheckCircle2, Shield, Smartphone, Eye, EyeOff } from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'react-toastify';
import { TwoFactorModal } from '../TwoFactorModal';
import ConfirmModal from '../ConfirmModal';

const Security = () => {
    const {user, logout} = useAuth();
    const [loading, setLoading] = useState(false);
     
    const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '', confirm: '' });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
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
            // Turning it ON -> Open Setup Modal
            setIs2FAModalOpen(true);
        } else {
            // Turning it OFF -> Open Confirm Modal
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
                <div className="bg-white p-6 rounded-none border border-gray-300 shadow-sm space-y-6">
                    <div className="border-b border-gray-200 pb-4">
                        <h3 className="font-black uppercase tracking-tight text-[#111111] text-base">Change Password</h3>
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-0.5">Ensure your account uses a strong, unique password</p>
                    </div>

                    <div className="space-y-4 max-w-md">
                        <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase tracking-wider text-[#111111]">Current Password</label>
                            <div className="relative">
                                <input type={showCurrentPassword ? "text" : "password"} placeholder="••••••••"
                                    value={pwd.currentPassword} onChange={(e) => setPwd({ ...pwd, currentPassword: e.target.value })}
                                    className="w-full border border-gray-300 rounded-none px-4 py-2.5 pr-11 outline-none focus:border-[#111111] transition-colors text-xs font-semibold bg-white" />
                                <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#111111] transition-colors p-1 cursor-pointer">
                                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase tracking-wider text-[#111111]">New Password</label>
                            <div className="relative">
                                <input type={showNewPassword ? "text" : "password"} placeholder="••••••••"
                                    value={pwd.newPassword} onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })} className="w-full border border-gray-300 rounded-none px-4 py-2.5 pr-11 outline-none focus:border-[#111111] transition-colors text-xs font-semibold bg-white" />
                                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#111111] transition-colors p-1 cursor-pointer">
                                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase tracking-wider text-[#111111]">Confirm New Password</label>
                            <div className="relative">
                                <input type={showConfirm ? "text" : "password"} placeholder="••••••••"
                                    value={pwd.confirm} onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
                                    className="w-full border border-gray-300 rounded-none px-4 py-2.5 pr-11 outline-none focus:border-[#111111] transition-colors text-xs font-semibold bg-white" />
                                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#111111] transition-colors p-1 cursor-pointer">
                                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        <button disabled={loading} className="bg-[#f6c947] text-[#111111] border-2 border-[#f6c947] hover:bg-[#111111] hover:text-[#f6c947] hover:border-[#111111] text-xs font-black uppercase tracking-wider px-6 py-2.5 rounded-none transition-all shadow-sm disabled:opacity-50 cursor-pointer">
                            {
                                loading ? "Updating..." : "Update Password"
                            }
                        </button>
                    </div>
                </div>
            </form>

            <div className="bg-white p-6 rounded-none border border-gray-300 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                    <div className="flex items-center gap-2">
                        <Shield size={20} className="text-[#111111]" />
                        <h3 className="font-black uppercase tracking-tight text-[#111111] text-base">Two-Factor Authentication (2FA)</h3>
                    </div>
                    <span
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-none uppercase tracking-wider border ${is2FAEnabled
                            ? "text-emerald-800 bg-emerald-100 border-emerald-300"
                            : "text-rose-800 bg-rose-100 border-rose-300"
                            }`}
                    >
                        {is2FAEnabled ? "ENABLED" : "DISABLED"}
                    </span>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
                    <div className="flex-1 space-y-4">
                        <p className="text-xs text-gray-600 font-medium">
                            Add an extra layer of security to your account by requiring a time-based verification code in addition to your password.
                        </p>
                        <div className="space-y-2">
                            <div className="flex items-start gap-2.5">
                                <div className="mt-0.5 text-emerald-700"><CheckCircle2 size={15} /></div>
                                <p className="text-xs text-gray-600 font-semibold">Protect your account from unauthorized access.</p>
                            </div>
                            <div className="flex items-start gap-2.5">
                                <div className="mt-0.5 text-emerald-700"><CheckCircle2 size={15} /></div>
                                <p className="text-xs text-gray-600 font-semibold">Use Authenticator apps like Google Authenticator or Authy.</p>
                            </div>
                        </div>
                        <button
                            onClick={handleToggle2FA}
                            className={`text-xs font-black uppercase tracking-wider px-6 py-2.5 rounded-none transition-all shadow-sm cursor-pointer ${is2FAEnabled
                                ? "bg-rose-100 text-rose-700 border border-rose-300 hover:bg-rose-200"
                                : "bg-[#f6c947] text-[#111111] border-2 border-[#f6c947] hover:bg-[#111111] hover:text-[#f6c947] hover:border-[#111111]"
                                }`}
                        >
                            {is2FAEnabled ? "Disable 2FA" : "Enable 2FA"}
                        </button>
                    </div>
                    <div className="w-28 h-28 bg-gray-50 border-2 border-dashed border-gray-300 rounded-none flex items-center justify-center shrink-0">
                        <Smartphone size={40} className="text-gray-400" />
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