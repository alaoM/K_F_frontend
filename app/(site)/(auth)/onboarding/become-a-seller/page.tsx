"use client";

export const dynamic = 'force-dynamic'

import React, { useState } from "react";
import {
  Store,
  TrendingUp,
  Wallet,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Image as ImageIcon,
  Loader2,
  Camera,
  Check,
  Upload
} from "lucide-react";
import { useAuth, UserRole } from "@/context/AuthContext";
import { PhoneNumberInput } from "@/app/components/PhoneNumberInput";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

interface SellerFormData {
  businessName: string;
  businessEmail: string;
  businessPhoneNumber: string;
  businessAddress: string;
  businessCity: string;
  businessState: string;
  businessPostalCode: string;
  bio: string;
  logo: string;
  primaryImage: string;
}

const INITIAL_DATA: SellerFormData = {
  businessName: "",
  businessEmail: "",
  businessPhoneNumber: "",
  businessAddress: "",
  businessCity: "",
  businessState: "",
  businessPostalCode: "",
  bio: "",
  logo: "",
  primaryImage: "",
};

export default function SellerOnboardingPage() {
  const { completeOnboarding, user, refreshToken } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<SellerFormData>(INITIAL_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const TOTAL_STEPS = 3;

  // --- HANDLERS ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'primaryImage') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'logo') setUploadingLogo(true);
    else setUploadingBanner(true);

    try {
      const data = new FormData();
      data.append('file', file);

      const res = await fetch('/api/upload/upload-single-image', {
        method: 'POST',
        body: data,
      });

      const result = await res.json();
      if (result.url) {
        setFormData(prev => ({ ...prev, [type]: result.url }));
        toast.success(`${type === 'logo' ? 'Logo' : 'Banner'} uploaded successfully`);
      } else {
        throw new Error("Upload failed");
      }
    } catch (err) {
      toast.error("Image upload failed. Please try again.");
    } finally {
      if (type === 'logo') setUploadingLogo(false);
      else setUploadingBanner(false);
    }
  };

  const updateFields = (fields: Partial<SellerFormData>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < TOTAL_STEPS) setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1️⃣ Check if we need to complete basic onboarding (User level)
      // If the user is already onboarded (e.g. as a buyer), we skip this step
      if (user && !user.isOnboarded) {
        const onboardingPayload = {
          address: formData.businessAddress,
          location: `${formData.businessCity}, ${formData.businessState} ${formData.businessPostalCode}`,
          phoneNumber: formData.businessPhoneNumber,
          role: "seller" as UserRole,
        };

        const onboardingSuccess = await completeOnboarding(onboardingPayload);
        if (!onboardingSuccess) {
          setIsSubmitting(false);
          return;
        }
      }

      // 2️⃣ Create seller profile (Business level)
      // Note: This endpoint also updates the user role to SELLER in the backend
      const res = await fetch("/api/sellers/store", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessName: formData.businessName,
          businessEmail: formData.businessEmail,
          businessPhoneNumber: formData.businessPhoneNumber,
          businessAddress: formData.businessAddress,
          businessCity: formData.businessCity,
          businessState: formData.businessState,
          businessPostalCode: formData.businessPostalCode,
          bio: formData.bio,
          logo: formData.logo,
          banner: formData.primaryImage,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // If they already have a store, just redirect them
        if (res.status === 400 && data.message?.includes("already exists")) {
          toast.info("You already have a store! Redirecting...");
          setIsSuccess(true);
          setTimeout(() => router.push("/dashboard/seller"), 1500);
          return;
        }
        throw new Error(data.message || "Failed to create seller profile");
      }

      // ✅ Success flow
      setIsSuccess(true);
      toast.success("Store setup complete!");
      await refreshToken();

      setTimeout(() => {
        router.push("/dashboard/seller");
      }, 2500);

    } catch (error: any) {
      console.error("Onboarding error:", error);
      toast.error(error.message || "Something went wrong during setup");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success Screen
  if (isSuccess) {
    return (
      <div className="my-5 bg-[#f9fafb] flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-none border border-gray-200 shadow-xl overflow-hidden text-center p-12 space-y-6">
          <div className="w-20 h-20 bg-green-100 text-green-700 rounded-none flex items-center justify-center mx-auto">
            <Check size={40} strokeWidth={3} />
          </div>
          <h1 className="text-2xl font-black uppercase text-[#111111]">Congratulations! 🎉</h1>
          <p className="text-gray-600 text-sm">
            Your store <span className="font-bold text-[#111111]">{formData.businessName}</span> has been created successfully.
          </p>
          <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
            <Loader2 className="animate-spin" size={16} />
            REDIRECTING TO DASHBOARD...
          </div>
        </div>
      </div>
    );
  }

  // Step 0: Welcome Screen
  if (step === 0) {
    return (
      <div className="my-5 bg-[#f9fafb] flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-none border border-gray-200 shadow-xl overflow-hidden">
          <div className="h-2 bg-[#111111]" />
          <div className="p-8 space-y-8">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-gray-100 rounded-none flex items-center justify-center mx-auto mb-2 text-[#111111]">
                <Store size={28} />
              </div>
              <h1 className="text-2xl font-black uppercase text-[#111111]">Become a Seller 🚀</h1>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Ready to start selling? Set up your seller profile in just a few steps and start reaching thousands of buyers.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {[
                { title: "Set Up Your Storefront", desc: "Create a unique profile with your business name, logo, and bio.", icon: Store },
                { title: "Reach More Buyers", desc: "List your fashion items and get discovered by our community.", icon: TrendingUp },
                { title: "Earn & Grow", desc: "Manage your inventory, process orders, and get paid securely.", icon: Wallet },
              ].map((benefit, idx) => (
                <div key={idx} className="p-4 rounded-none border border-gray-200 bg-gray-50 flex flex-col gap-2.5">
                  <div className="flex items-center justify-center w-9 h-9 rounded-none bg-[#111111] text-[#f6c947]">
                    <benefit.icon size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#111111] text-xs uppercase">{benefit.title}</h3>
                    <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep(1)}
              className="w-full py-3.5 flex items-center justify-center gap-2 rounded-none font-black text-xs uppercase tracking-widest bg-[#111111] hover:bg-[#f6c947] hover:text-[#111111] text-[#f6c947] shadow-md transition-all cursor-pointer"
            >
              START SELLER ONBOARDING
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Main Form Layout (Steps 1, 2, 3) ---
  return (
    <div className="bg-[#f9fafb] flex items-center justify-center p-4 my-5">
      <div className="max-w-2xl w-full bg-white rounded-none border border-gray-200 shadow-xl overflow-hidden">
        {/* Header & Progress Bar */}
        <div className="bg-[#111111] p-6 text-white space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black uppercase flex items-center gap-2">
              <Store size={22} className="text-[#f6c947]" />
              Store Setup
            </h2>
            <span className="text-xs font-bold text-gray-400 uppercase">Step {step} of {TOTAL_STEPS}</span>
          </div>
          {/* Progress Bar Track */}
          <div className="w-full bg-white/20 h-2 rounded-none overflow-hidden">
            <div
              className="bg-[#f6c947] h-full transition-all duration-300 ease-out"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={step === TOTAL_STEPS ? handleSubmit : handleNext} className="p-8">

          {/* STEP 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-6">
                <h3 className="text-lg font-black uppercase text-[#111111]">Basic Information</h3>
                <p className="text-xs text-gray-500">Let customers know who they are buying from.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Business Name <span className="text-red-500">*</span></label>
                  <input
                    required
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => updateFields({ businessName: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-none text-xs focus:border-[#111111] outline-none"
                    placeholder="E.g. Urban Threads"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Business Email <span className="text-red-500">*</span></label>
                    <input
                      required
                      type="email"
                      value={formData.businessEmail}
                      onChange={(e) => updateFields({ businessEmail: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-none text-xs focus:border-[#111111] outline-none"
                      placeholder="store@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
                    <PhoneNumberInput
                      value={formData.businessPhoneNumber}
                      onChange={(value) => updateFields({ businessPhoneNumber: value })}
                      defaultCountry="NG"
                    />

                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Location Details */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-6">
                <h3 className="text-lg font-black uppercase text-[#111111] flex items-center gap-2">
                  <MapPin size={20} />
                  Business Location
                </h3>
                <p className="text-xs text-gray-500">Where is your business operating from?</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Street Address <span className="text-red-500">*</span></label>
                  <input
                    required
                    type="text"
                    value={formData.businessAddress}
                    onChange={(e) => updateFields({ businessAddress: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-none text-xs focus:border-[#111111] outline-none"
                    placeholder="123 Fashion Street, Suite 100"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">City <span className="text-red-500">*</span></label>
                    <input
                      required
                      type="text"
                      value={formData.businessCity}
                      onChange={(e) => updateFields({ businessCity: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-none text-xs focus:border-[#111111] outline-none"
                      placeholder="New York"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">State <span className="text-red-500">*</span></label>
                    <input
                      required
                      type="text"
                      value={formData.businessState}
                      onChange={(e) => updateFields({ businessState: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-none text-xs focus:border-[#111111] outline-none"
                      placeholder="NY"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Postal / Zip Code <span className="text-red-500">*</span></label>
                  <input
                    required
                    type="text"
                    value={formData.businessPostalCode}
                    onChange={(e) => updateFields({ businessPostalCode: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-none text-xs focus:border-[#111111] outline-none"
                    placeholder="10001"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Store Profile & Images */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-6">
                <h3 className="text-lg font-black uppercase text-[#111111] flex items-center gap-2">
                  <ImageIcon size={20} />
                  Store Profile
                </h3>
                <p className="text-xs text-gray-500">Add visuals and a bio to stand out to buyers.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Bio (Min 10 characters)</label>
                  <textarea
                    minLength={10}
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => updateFields({ bio: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-none text-xs focus:border-[#111111] outline-none resize-none"
                    placeholder="Tell buyers about your brand, what you sell, and your unique style..."
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Logo Upload */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">Business Logo</label>
                    <div className="relative group cursor-pointer">
                      <div className="w-full h-32 border-2 border-dashed border-gray-200 rounded-none flex flex-col items-center justify-center bg-gray-50 group-hover:border-[#f6c947] transition-all overflow-hidden">
                        {formData.logo ? (
                          <img src={formData.logo} alt="Logo" className="w-full h-full object-contain" />
                        ) : (
                          <div className="text-center">
                            {uploadingLogo ? (
                              <Loader2 className="mx-auto animate-spin text-[#111111]" size={24} />
                            ) : (
                              <Camera className="mx-auto text-gray-400" size={24} />
                            )}
                            <span className="text-[10px] font-black text-gray-400 mt-2 uppercase tracking-widest block">Upload Logo</span>
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'logo')}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        disabled={uploadingLogo}
                      />
                    </div>
                  </div>

                  {/* Banner Upload */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">Store Banner</label>
                    <div className="relative group cursor-pointer">
                      <div className="w-full h-32 border-2 border-dashed border-gray-200 rounded-none flex flex-col items-center justify-center bg-gray-50 group-hover:border-[#f6c947] transition-all overflow-hidden">
                        {formData.primaryImage ? (
                          <img src={formData.primaryImage} alt="Banner" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center">
                            {uploadingBanner ? (
                              <Loader2 className="mx-auto animate-spin text-[#111111]" size={24} />
                            ) : (
                              <Upload className="mx-auto text-gray-400" size={24} />
                            )}
                            <span className="text-[10px] font-black text-gray-400 mt-2 uppercase tracking-widest block">Upload Banner</span>
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'primaryImage')}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        disabled={uploadingBanner}
                      />
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-gray-400 italic uppercase tracking-widest font-bold">
                  * High quality images help you sell faster!
                </p>
              </div>
            </div>
          )}

          {/* Form Navigation Buttons */}
          <div className="mt-8 flex items-center justify-between pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-2.5 rounded-none font-bold text-xs uppercase tracking-wider text-gray-600 hover:bg-gray-100 transition-all flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft size={16} />
              Back
            </button>

            <button
              type="submit"
              disabled={isSubmitting || uploadingLogo || uploadingBanner}
              className="px-8 py-3 rounded-none font-black text-xs uppercase tracking-widest bg-[#111111] hover:bg-[#f6c947] hover:text-[#111111] text-[#f6c947] shadow-md transition-all flex items-center gap-2 disabled:opacity-70 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  PROCESSING...
                </>
              ) : step === TOTAL_STEPS ? (
                <>
                  <CheckCircle2 size={16} />
                  COMPLETE SETUP
                </>
              ) : (
                <>
                  NEXT
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}