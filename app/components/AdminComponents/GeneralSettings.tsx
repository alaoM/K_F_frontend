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

            {/* ================= PROFILE ================= */}
            <form onSubmit={profileForm.handleSubmit(updateProfile)} className="bg-white p-6 rounded-xl space-y-6">

                <div className="flex justify-between border-b pb-4">
                    <h3 className="font-bold">Profile</h3>


                    <button
                        type="submit"
                        disabled={loadingProfile}
                        className="flex items-center gap-2 bg-[#243e6b] text-white text-xs font-bold px-4 py-2 rounded-md"
                    >
                        <Save size={14} />
                        {loadingProfile ? "Saving..." : "Save"}
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <div className="w-36 h-36 rounded-2xl flex items-center justify-center border-4 border-white shadow-2xl overflow-hidden relative">
                            {avatarSrc ? <Image unoptimized fill src={avatarSrc} className="object-cover" alt="Avatar" /> : <User size={50} />}
                            {uploading && <div className="absolute inset-0 bg-white/70 flex items-center justify-center"><Loader2 className="animate-spin" /></div>}
                        </div>
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 bg-gray-900 text-white p-3 rounded-2xl shadow-xl hover:scale-110 transition-all border-2 border-white"><Camera size={18} /></button>
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
                {/* Avatar */}


                <Input label="Full Name" register={profileForm.register("fullName")} />
                <Input label="Email" register={profileForm.register("email")} />
                <Input label="Phone" register={profileForm.register("phoneNumber")} />
                <Input label="Address" register={profileForm.register("address")} />

            </form>

            {/* ================= SELLER ================= */}
            <form onSubmit={sellerForm.handleSubmit(updateSeller)} className="bg-white p-6 rounded-xl space-y-6">




                <div className="flex justify-between border-b pb-4">
                    <h3 className="font-bold">Store</h3>

                    <button
                        type="submit"
                        disabled={loadingSeller}
                        className="flex items-center gap-2 bg-[#243e6b] text-white text-xs font-bold px-4 py-2 rounded-md"
                    >
                        <Save size={14} />
                        {loadingSeller ? "Saving..." : "Save Store"}
                    </button>

                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold">Store Logo</label>

                    <div className="relative w-32 h-32 border rounded-xl overflow-hidden flex items-center justify-center">
                        {logoPreview ? (
                            <Image src={logoPreview} fill alt="Logo" className="object-cover" />
                        ) : (
                            <span>No Logo</span>
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
                        className="text-xs bg-black text-white px-3 py-1 rounded"
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
                    <label className="text-sm font-bold">Store Banner</label>

                    <div className="relative w-full h-40 border rounded-xl overflow-hidden flex items-center justify-center">
                        {bannerPreview ? (
                            <Image src={bannerPreview} fill alt="Banner" className="object-cover" />
                        ) : (
                            <span>No Banner</span>
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
                        className="text-xs bg-black text-white px-3 py-1 rounded"
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

                <Input label="Business Name" register={sellerForm.register("businessName")} />
                <Input label="Business Email" register={sellerForm.register("businessEmail")} />
                <Input label="Phone" register={sellerForm.register("businessPhoneNumber")} />
                <Input label="Address" register={sellerForm.register("businessAddress")} />
                <Input label="City" register={sellerForm.register("businessCity")} />
                <Input label="State" register={sellerForm.register("businessState")} />
                <Input label="Postal Code" register={sellerForm.register("businessPostalCode")} />

            </form>

        </div>
    )
}

export default GeneralSettings

const Input = ({ label, register }: any) => (
    <div className="space-y-1.5">
        <label className="text-sm font-bold text-gray-700">{label}</label>
        <input
            {...register}
            className="w-full border rounded-md px-4 py-2 text-sm"
        />
    </div>
)