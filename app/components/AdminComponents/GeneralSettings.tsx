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

type SellerForm = {
    businessName: string
    businessEmail: string
    businessPhoneNumber: string
    businessAddress: string
    businessCity: string
    businessState: string
    businessPostalCode: string
    bio?: string
    logo?: string
    banner?: string
}

const GeneralSettings = () => {
    const { user, refreshUserData } = useAuth()
    const fetcher = useApi()

    const [loadingProfile, setLoadingProfile] = useState(false)
    const [loadingSeller, setLoadingSeller] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

    const fileInputRef = React.useRef<HTMLInputElement>(null)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)
    const [bannerPreview, setBannerPreview] = useState<string | null>(null)

    const [uploadingLogo, setUploadingLogo] = useState(false)
    const [uploadingBanner, setUploadingBanner] = useState(false)

    const logoInputRef = React.useRef<HTMLInputElement>(null)
    const bannerInputRef = React.useRef<HTMLInputElement>(null)

    const profileForm = useForm<ProfileForm>()
    const sellerForm = useForm<SellerForm>()

    // ✅ Global Commission State for Admin
    const [globalCommission, setGlobalCommission] = useState<number>(5);
    const [loadingCommission, setLoadingCommission] = useState<boolean>(false);

    useEffect(() => {
        if (user?.role === 'admin') {
            fetcher('/api/system-settings')
                .then((data: any) => {
                    if (data && data.COMMISSION_PERCENT != null) {
                        const parsed = parseFloat(data.COMMISSION_PERCENT);
                        setGlobalCommission(parsed < 1 ? parsed * 100 : parsed);
                    }
                })
                .catch(() => {});
        }
    }, [user, fetcher]);

    const handleSaveCommission = async () => {
        setLoadingCommission(true);
        try {
            const decimalVal = globalCommission > 1 ? globalCommission / 100 : globalCommission;
            await fetcher('/api/system-settings', {
                method: 'POST',
                body: JSON.stringify({ COMMISSION_PERCENT: decimalVal }),
            });
            toast.success("Global Commission Rate updated successfully!");
        } catch {
            toast.error("Failed to update commission rate");
        } finally {
            setLoadingCommission(false);
        }
    };

    // ✅ Populate forms
    useEffect(() => {
        if (!user) return;

        profileForm.reset({
            fullName: user.fullName ?? '',
            email: user.email ?? '',
            phoneNumber: user.phoneNumber ?? '',
            address: user.address ?? '',
            userAvatar: user.userAvatar ?? '',
        });

        sellerForm.reset({
            businessName: user.sellerProfile?.businessName ?? '',
            businessEmail: user.sellerProfile?.businessEmail ?? '',
            businessPhoneNumber: user.sellerProfile?.businessPhoneNumber ?? '',
            businessAddress: user.sellerProfile?.businessAddress ?? '',
            businessCity: user.sellerProfile?.businessCity ?? '',
            businessState: user.sellerProfile?.businessState ?? '',
            businessPostalCode: user.sellerProfile?.businessPostalCode ?? '',
            bio: user.sellerProfile?.bio ?? '',
            logo: user.sellerProfile?.logo ?? '',
            banner: user.sellerProfile?.banner ?? '',
        });

        setLogoPreview(user.sellerProfile?.logo ?? null)
        setBannerPreview(user.sellerProfile?.banner ?? null)
    }, [user]);

    // ✅ PROFILE UPDATE
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

    // ✅ SELLER UPDATE / CREATE
    const updateSeller = async (data: SellerForm) => {
        setLoadingSeller(true);

        try {
            const payload = {
                businessName: data.businessName,
                businessEmail: data.businessEmail,
                businessPhoneNumber: data.businessPhoneNumber,
                businessAddress: data.businessAddress,
                businessCity: data.businessCity,
                businessState: data.businessState,
                businessPostalCode: data.businessPostalCode,
                bio: data.bio ?? '',
                logo: data.logo ?? '',
                banner: data.banner ?? '',
            };

           

            const endpoint = user?.hasCreatedStore
                ? '/api/sellers/store'
                : '/api/sellers/store';

            await fetcher(endpoint, {
                method: user?.hasCreatedStore ? 'PATCH' : 'POST',
                body: JSON.stringify(payload),
            });

            toast.success("Store updated");
            refreshUserData();
        } catch {
            toast.error("Failed to update store");
        } finally {
            setLoadingSeller(false);
        }
    };
    const uploadImage = async (
        file: File,
        setLoading: (v: boolean) => void
    ) => {
        setLoading(true)

        try {
            const fd = new FormData()
            fd.append('file', file)

            const res = await fetch('/api/upload/upload-single-image', {
                method: 'POST',
                body: fd,
            }).then(r => r.json())

            if (!res?.url) throw new Error()

            return res.url
        } catch {
            toast.error("Upload failed")
            return null
        } finally {
            setLoading(false)
        }
    }
 
    if (!user) return null;

    const avatarSrc = avatarPreview ?? user?.userAvatar ?? null;
    return (
        <div className="space-y-6">

            {/* ================= ADMIN GLOBAL COMMISSION SETTINGS ================= */}
            {user.role === 'admin' && (
                <div className="bg-white p-6 rounded-none border border-gray-300 shadow-sm space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
                        <div>
                            <h3 className="font-black uppercase tracking-tight text-[#111111] text-base">Global Platform Default Commission</h3>
                            <p className="text-xs text-gray-500 font-semibold mt-0.5 uppercase tracking-wider">
                                Set baseline commission percentage deducted from seller payouts when no specific category rate is defined.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleSaveCommission}
                            disabled={loadingCommission}
                            className="flex items-center gap-2 bg-[#f6c947] text-[#111111] border-2 border-[#f6c947] hover:bg-[#111111] hover:text-[#f6c947] hover:border-[#111111] text-xs font-black uppercase tracking-wider px-5 py-2.5 rounded-none transition-all shadow-sm disabled:opacity-50"
                        >
                            <Save size={14} />
                            {loadingCommission ? "Saving..." : "Save Commission"}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-[#111111] uppercase tracking-wider">Default Platform Commission Rate (%)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="100"
                                    value={globalCommission}
                                    onChange={(e) => setGlobalCommission(parseFloat(e.target.value) || 0)}
                                    className="w-full border border-gray-300 rounded-none px-4 py-2.5 text-sm font-black text-[#111111] bg-white focus:border-[#111111] outline-none"
                                />
                                <span className="absolute right-4 top-2.5 text-xs font-black text-gray-400">%</span>
                            </div>
                        </div>

                        <div className="p-3.5 bg-gray-50 rounded-none border border-gray-300 text-xs text-gray-700 space-y-1">
                            <p className="font-black flex items-center gap-1 text-[#111111] uppercase tracking-wider text-[11px]">
                                💡 Commission Resolution Hierarchy:
                            </p>
                            <p className="leading-relaxed text-gray-600 font-medium">
                                1. Category Specific Rate &rarr; 2. Parent Category Rate &rarr; 3. Global Default ({globalCommission}%).
                            </p>
                            <a href="/dashboard/admin/categories" className="font-black text-[#111111] hover:underline block pt-0.5 uppercase tracking-wider text-[11px]">
                                Configure Category Specific Rates &rarr;
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= PROFILE ================= */}
            <form onSubmit={profileForm.handleSubmit(updateProfile)} className="bg-white p-6 rounded-none border border-gray-300 shadow-sm space-y-6">

                <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                    <div>
                        <h3 className="font-black uppercase tracking-tight text-[#111111] text-base">Profile Settings</h3>
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-0.5">Manage your personal account credentials</p>
                    </div>

                    <button
                        type="submit"
                        disabled={loadingProfile}
                        className="flex items-center gap-2 bg-[#f6c947] text-[#111111] border-2 border-[#f6c947] hover:bg-[#111111] hover:text-[#f6c947] hover:border-[#111111] text-xs font-black uppercase tracking-wider px-5 py-2.5 rounded-none transition-all shadow-sm disabled:opacity-50"
                    >
                        <Save size={14} />
                        {loadingProfile ? "Saving..." : "Save Profile"}
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-none bg-gray-100 flex items-center justify-center border-2 border-gray-300 shadow-sm overflow-hidden relative">
                            {avatarSrc ? <Image unoptimized fill src={avatarSrc} className="object-cover" alt="Avatar" /> : <User size={48} className="text-gray-400" />}
                            {uploading && <div className="absolute inset-0 bg-white/70 flex items-center justify-center"><Loader2 className="animate-spin" /></div>}
                        </div>
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 bg-[#111111] text-[#f6c947] p-2.5 rounded-none shadow-md hover:scale-105 transition-all border border-[#f6c947]"><Camera size={16} /></button>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Full Name" register={profileForm.register("fullName")} />
                    <Input label="Email" register={profileForm.register("email")} />
                    <Input label="Phone" register={profileForm.register("phoneNumber")} />
                    <Input label="Address" register={profileForm.register("address")} />
                </div>

            </form>

            {/* ================= SELLER ================= */}
            <form onSubmit={sellerForm.handleSubmit(updateSeller)} className="bg-white p-6 rounded-none border border-gray-300 shadow-sm space-y-6">

                <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                    <div>
                        <h3 className="font-black uppercase tracking-tight text-[#111111] text-base">Store Profile</h3>
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-0.5">Customize your marketplace storefront appearance</p>
                    </div>

                    <button
                        type="submit"
                        disabled={loadingSeller}
                        className="flex items-center gap-2 bg-[#f6c947] text-[#111111] border-2 border-[#f6c947] hover:bg-[#111111] hover:text-[#f6c947] hover:border-[#111111] text-xs font-black uppercase tracking-wider px-5 py-2.5 rounded-none transition-all shadow-sm disabled:opacity-50"
                    >
                        <Save size={14} />
                        {loadingSeller ? "Saving..." : "Save Store"}
                    </button>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-wider text-[#111111]">Store Logo</label>

                        <div className="relative w-32 h-32 border border-gray-300 rounded-none bg-gray-50 overflow-hidden flex items-center justify-center">
                            {logoPreview ? (
                                <Image src={logoPreview} fill alt="Logo" className="object-cover" />
                            ) : (
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">No Logo</span>
                            )}

                            {uploadingLogo && (
                                <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                                    <Loader2 className="animate-spin" />
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => logoInputRef.current?.click()}
                            className="text-xs bg-[#111111] text-white hover:bg-[#f6c947] hover:text-[#111111] font-black uppercase tracking-wider px-3 py-1.5 rounded-none transition-colors"
                        >
                            Upload Logo
                        </button>

                        <input
                            type="file"
                            hidden
                            ref={logoInputRef}
                            onChange={async (e) => {
                                const file = e.target.files?.[0]
                                if (!file) return

                                const url = await uploadImage(file, setUploadingLogo)
                                if (!url) return

                                setLogoPreview(url)
                                sellerForm.setValue("logo", url)
                            }}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-wider text-[#111111]">Store Banner</label>

                        <div className="relative w-full h-32 border border-gray-300 rounded-none bg-gray-50 overflow-hidden flex items-center justify-center">
                            {bannerPreview ? (
                                <Image src={bannerPreview} fill alt="Banner" className="object-cover" />
                            ) : (
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">No Banner</span>
                            )}

                            {uploadingBanner && (
                                <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                                    <Loader2 className="animate-spin" />
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => bannerInputRef.current?.click()}
                            className="text-xs bg-[#111111] text-white hover:bg-[#f6c947] hover:text-[#111111] font-black uppercase tracking-wider px-3 py-1.5 rounded-none transition-colors"
                        >
                            Upload Banner
                        </button>

                        <input
                            type="file"
                            hidden
                            ref={bannerInputRef}
                            onChange={async (e) => {
                                const file = e.target.files?.[0]
                                if (!file) return

                                const url = await uploadImage(file, setUploadingBanner)
                                if (!url) return

                                setBannerPreview(url)
                                sellerForm.setValue("banner", url)
                            }}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Business Name" register={sellerForm.register("businessName")} />
                    <Input label="Business Email" register={sellerForm.register("businessEmail")} />
                    <Input label="Phone" register={sellerForm.register("businessPhoneNumber")} />
                    <Input label="Address" register={sellerForm.register("businessAddress")} />
                    <Input label="City" register={sellerForm.register("businessCity")} />
                    <Input label="State" register={sellerForm.register("businessState")} />
                    <Input label="Postal Code" register={sellerForm.register("businessPostalCode")} />
                </div>

            </form>

        </div>
    )
}

export default GeneralSettings

const Input = ({ label, register }: any) => (
    <div className="space-y-1.5">
        <label className="text-xs font-black uppercase tracking-wider text-[#111111]">{label}</label>
        <input
            {...register}
            className="w-full border border-gray-300 rounded-none px-4 py-2 text-xs font-semibold bg-white focus:border-[#111111] outline-none"
        />
    </div>
)