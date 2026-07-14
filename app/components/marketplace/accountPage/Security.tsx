"use client"
import { useAuth } from '@/context/AuthContext';
import { useApi } from '@/hooks/useApi';
import { CheckCircle2, Shield, Smartphone } from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'react-toastify';
import { TwoFactorModal } from '../../TwoFactorModal';

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

    /* ---------------- Toggle 2FA ---------------- */
    const handleToggle2FA = async () => {
        if (!is2FAEnabled) {
            // Turning it ON -> Open Setup Modal
            setIs2FAModalOpen(true);
        } else {
            // Turning it OFF -> Direct Confirmation
            if (confirm("Disabling 2FA will leave your account vulnerable. Proceed?")) {
                try {
                    await fetcher('/api/users/profile', {
                        method: 'PATCH',
                        body: JSON.stringify({ isTwoFactorEnabled: false })
                    });
                    setIs2FAEnabled(false);
                    toast.warn("2FA Disabled");

                } catch (e) { toast.error("Failed to disable 2FA"); }
            }
        }
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleChangePassword}  >
                <div className="bg-white p-6 rounded-xl border border-[#e2e2e2] shadow-sm space-y-6">
                    <h3 className="font-bold text-[#243e6b] border-b border-[#e2e2e2] pb-4">Change Password</h3>
                    <div className="space-y-4 max-w-md">
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-700">Current Password</label>
                            <input type="password" placeholder="••••••••"
                                value={pwd.currentPassword} onChange={(e) => setPwd({ ...pwd, currentPassword: e.target.value })}
                                className="w-full border border-[#e2e2e2] rounded-md px-4 py-2 outline-none focus:border-[#243e6b] transition-colors text-sm" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-700">New Password</label>
                            <input type="password" placeholder="••••••••"
                                value={pwd.newPassword} onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })} className="w-full border border-[#e2e2e2] rounded-md px-4 py-2 outline-none focus:border-[#243e6b] transition-colors text-sm" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-700">Confirm New Password</label>
                            <input type="password" placeholder="••••••••"


                                value={pwd.confirm} onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
                                className="w-full border border-[#e2e2e2] rounded-md px-4 py-2 outline-none focus:border-[#243e6b] transition-colors text-sm" />
                        </div>
                        <button disabled={loading} className="bg-[#243e6b] text-white text-xs font-bold px-6 py-2 rounded-md hover:bg-[#243e6b]/90 transition-all">
                            {
                                loading ? "Updating..." : "Update Password"
                            }
                        </button>
                    </div>
                </div>
            </form>

            <div className="bg-white p-6 rounded-xl border border-[#e2e2e2] shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-[#e2e2e2] pb-4">
                    <div className="flex items-center gap-2">
                        <Shield size={20} className="text-[#243e6b]" />
                        <h3 className="font-bold text-[#243e6b]">Two-Factor Authentication (2FA)</h3>
                    </div>
                    <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${is2FAEnabled
                            ? "text-emerald-600 bg-emerald-50"
                            : "text-rose-600 bg-rose-50"
                            }`}
                    >
                        {is2FAEnabled ? "ENABLED" : "DISABLED"}
                    </span>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-1 space-y-4">
                        <p className="text-sm text-gray-600">
                            Add an extra layer of security to your account by requiring more than just a password to log in.
                        </p>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="mt-1 text-emerald-600"><CheckCircle2 size={16} /></div>
                                <p className="text-xs text-gray-500">Protect your account from unauthorized access.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="mt-1 text-emerald-600"><CheckCircle2 size={16} /></div>
                                <p className="text-xs text-gray-500">Use Authenticator apps like Google or Authy.</p>
                            </div>
                        </div>
                        <button
                            onClick={handleToggle2FA}
                            className={`text-xs font-bold px-6 py-2.5 rounded-md transition-all shadow-sm ${is2FAEnabled
                                ? "bg-red-100 text-red-600 hover:bg-red-200"
                                : "bg-[#f6c947] text-[#243e6b] hover:bg-[#f6c947]/90"
                                }`}
                        >
                            {is2FAEnabled ? "Disable 2FA" : "Enable 2FA"}
                        </button>
                    </div>
                    <div className="w-32 h-32 bg-gray-50 border-2 border-dashed border-[#e2e2e2] rounded-lg flex items-center justify-center">
                        <Smartphone size={48} className="text-gray-300" />
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
        </div>
    )
}

export default Security