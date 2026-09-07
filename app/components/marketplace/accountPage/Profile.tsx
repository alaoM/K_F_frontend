'use client'

import { Camera, Loader2, Save, User } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/context/AuthContext'
import { useApi } from '@/hooks/useApi'
import { toast } from 'react-toastify'
import Image from 'next/image'

type ProfileForm = {
    fullName: string
    email: string
    phoneNumber: number
    address: string
    userAvatar: string
}

const GeneralSettings = ({ user }: { user: any }) => {
    const { refreshUserData } = useAuth()
    const fetcher = useApi()

    const [loadingProfile, setLoadingProfile] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const profileForm = useForm<ProfileForm>()

    // Populate forms
    useEffect(() => {
        if (!user) return;

        profileForm.reset({
            fullName: user.fullName ?? '',
            email: user.email ?? '',
            phoneNumber: user.phoneNumber ?? '',
            address: user.address ?? '',
            userAvatar: user.userAvatar ?? '',
        });
    }, [user]);

    // PROFILE UPDATE
    const updateProfile = async (data: ProfileForm) => {
        setLoadingProfile(true);

        try {
            const payload = {
                fullName: data.fullName,
                email: data.email,
                phoneNumber: data.phoneNumber,
                address: data.address,
                userAvatar: data.userAvatar,
            };

            await fetcher('/api/users/profile', {
                method: 'PATCH',
                body: JSON.stringify(payload),
            });

            toast.success("Profile updated");
            refreshUserData();
        } catch {
            toast.error("Failed to update profile");
        } finally {
            setLoadingProfile(false);
        }
    };

    const avatarSrc = avatarPreview ?? user?.userAvatar ?? null;
    return (
        <div className="space-y-6">

            {/* ================= PROFILE ================= */}
            <form onSubmit={profileForm.handleSubmit(updateProfile)} className="bg-white p-6 rounded-none space-y-6">

                <div className="flex justify-between border-b border-gray-200 pb-4">
                    <h3 className="font-black text-xs uppercase tracking-wider text-[#111111]">Profile Details</h3>

                    <button
                        type="submit"
                        disabled={loadingProfile}
                        className="flex items-center gap-2 bg-[#111111] hover:bg-[#f6c947] hover:text-[#111111] text-white text-xs font-black uppercase tracking-wider px-5 py-2.5 rounded-none transition-colors cursor-pointer"
                    >
                        <Save size={14} />
                        {loadingProfile ? "Saving..." : "Save Changes"}
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <div className="w-28 h-28 rounded-none border-2 border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden relative">
                            {avatarSrc ? <Image unoptimized fill src={avatarSrc} className="object-cover" alt="Avatar" /> : <User size={40} className="text-gray-400" />}
                            {uploading && <div className="absolute inset-0 bg-white/70 flex items-center justify-center"><Loader2 className="animate-spin" /></div>}
                        </div>
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute -bottom-1 -right-1 bg-[#111111] text-[#f6c947] p-2 rounded-none shadow-md hover:bg-black transition-all cursor-pointer"><Camera size={14} /></button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            hidden
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;

                                try {
                                    setUploading(true);

                                    const fd = new FormData();
                                    fd.append('file', file);

                                    const res = await fetch('/api/upload/upload-single-image', {
                                        method: 'POST',
                                        body: fd
                                    }).then(r => r.json());

                                    if (!res?.url) throw new Error();

                                    setAvatarPreview(res.url);
                                    profileForm.setValue('userAvatar', res.url);

                                } catch {
                                    toast.error("Upload failed");
                                } finally {
                                    setUploading(false);
                                }
                            }}
                        />
                    </div>
                </div>

                <Input label="Full Name" register={profileForm.register("fullName")} />
                <Input label="Email" register={profileForm.register("email")} />
                <Input label="Phone" register={profileForm.register("phoneNumber")} />
                <Input label="Address" register={profileForm.register("address")} />

            </form>
        </div>
    )
}

export default GeneralSettings

const Input = ({ label, register }: any) => (
    <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-gray-700">{label}</label>
        <input
            {...register}
            className="w-full border border-gray-300 rounded-none px-3.5 py-2.5 text-xs outline-none focus:border-[#111111]"
        />
    </div>
)