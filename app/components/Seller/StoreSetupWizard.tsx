'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Store, Camera, Layout, CheckCircle, ArrowRight, Loader2, Globe } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useApi } from '@/hooks/useApi';
import { toast } from 'react-toastify';
import Image from 'next/image';

interface StoreSetupForm {
  businessName: string;
  businessEmail: string;
  businessPhoneNumber: string;
  businessAddress: string;
  businessCity: string;
  businessState: string;
  businessPostalCode: string;
  bio: string;
  logo: string;
  banner: string;
}

const StoreSetupWizard = () => {
  const { user, refreshUserData } = useAuth();
  const fetcher = useApi();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<StoreSetupForm>();

  const logo = watch('logo');
  const banner = watch('banner');

  const uploadImage = async (file: File, type: 'logo' | 'banner') => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload/upload-single-image', {
        method: 'POST',
        body: fd
      }).then(r => r.json());

      if (res?.url) {
        setValue(type, res.url);
        toast.success(`${type} uploaded`);
      }
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: StoreSetupForm) => {
    setLoading(true);
    try {
      await fetcher('/api/sellers/store', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      toast.success('Your brand is now live!');
      refreshUserData();
      setStep(3); // Success step
    } catch (err: any) {
      toast.error(err.message || 'Failed to setup store');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {/* STEPS INDICATOR */}
      <div className="flex items-center justify-center gap-4 mb-12">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
              step === s ? 'bg-[#243e6b] text-white scale-110 shadow-lg' : 
              step > s ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400'
            }`}>
              {step > s ? <CheckCircle size={20} /> : s}
            </div>
            {s < 3 && <div className={`w-12 h-1 bg-gray-200 rounded-full ${step > s ? 'bg-emerald-500' : ''}`} />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
        {step === 1 && (
          <div className="p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-blue-50 text-[#243e6b] rounded-3xl">
                <Store size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-[#243e6b]">Brand Identity</h2>
                <p className="text-gray-500">Tell us about your digital shop.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">Business Name</label>
                  <input 
                    {...register('businessName', { required: true })} 
                    placeholder="e.g. Urban Vogue"
                    className="w-full h-14 px-6 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-100 transition-all font-bold text-[#243e6b]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">Business Email</label>
                  <input 
                    {...register('businessEmail', { required: true })} 
                    placeholder="contact@yourbrand.com"
                    className="w-full h-14 px-6 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-100 transition-all font-bold text-[#243e6b]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Store Bio</label>
                <textarea 
                  {...register('bio')} 
                  rows={4}
                  placeholder="What makes your brand special?"
                  className="w-full p-6 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium text-gray-600 resize-none"
                />
              </div>

              <div className="flex justify-end">
                <button 
                  onClick={() => setStep(2)}
                  className="flex items-center gap-3 px-10 py-4 bg-[#243e6b] text-white font-black rounded-2xl hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/20"
                >
                  Next Step
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-amber-50 text-amber-600 rounded-3xl">
                <Layout size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-[#243e6b]">Visual Branding</h2>
                <p className="text-gray-500">Upload your logo and shop banner.</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* LOGO */}
                <div className="space-y-4">
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400">Store Logo</p>
                  <div className="relative group w-40 h-40 mx-auto md:mx-0">
                    <div className="w-full h-full rounded-[2rem] bg-gray-100 flex items-center justify-center overflow-hidden border-4 border-dashed border-gray-200 group-hover:border-blue-400 transition-all relative">
                      {logo ? (
                        <Image src={logo} alt="logo" fill className="object-cover" />
                      ) : (
                        <Camera size={40} className="text-gray-300" />
                      )}
                      {uploading && <div className="absolute inset-0 bg-white/60 flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>}
                    </div>
                    <button 
                      type="button"
                      onClick={() => document.getElementById('logo-input')?.click()}
                      className="absolute -bottom-4 -right-4 p-4 bg-white text-[#243e6b] rounded-2xl shadow-xl hover:scale-110 transition-all border border-gray-100"
                    >
                      <Camera size={20} />
                    </button>
                    <input id="logo-input" type="file" hidden onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], 'logo')} />
                  </div>
                </div>

                {/* BANNER */}
                <div className="space-y-4 flex-1">
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400">Shop Banner</p>
                  <div className="relative group w-full h-40">
                    <div className="w-full h-full rounded-[2rem] bg-gray-100 flex items-center justify-center overflow-hidden border-4 border-dashed border-gray-200 group-hover:border-blue-400 transition-all relative">
                      {banner ? (
                        <Image src={banner} alt="banner" fill className="object-cover" />
                      ) : (
                        <Layout size={40} className="text-gray-300" />
                      )}
                    </div>
                    <button 
                      type="button"
                      onClick={() => document.getElementById('banner-input')?.click()}
                      className="absolute -bottom-4 -right-4 p-4 bg-white text-[#243e6b] rounded-2xl shadow-xl hover:scale-110 transition-all border border-gray-100"
                    >
                      <Camera size={20} />
                    </button>
                    <input id="banner-input" type="file" hidden onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], 'banner')} />
                  </div>
                </div>
              </div>

              {/* CONTACT INFO HIDDEN BUT REQUIRED */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 opacity-50">
                 <input {...register('businessCity')} placeholder="City" className="h-12 px-4 rounded-xl bg-gray-50 outline-none" />
                 <input {...register('businessState')} placeholder="State" className="h-12 px-4 rounded-xl bg-gray-50 outline-none" />
                 <input {...register('businessPostalCode')} placeholder="Postal" className="h-12 px-4 rounded-xl bg-gray-50 outline-none" />
                 <input {...register('businessPhoneNumber')} placeholder="Phone" className="h-12 px-4 rounded-xl bg-gray-50 outline-none" />
              </div>

              <div className="flex justify-between items-center pt-8">
                <button onClick={() => setStep(1)} className="text-gray-400 font-bold hover:text-[#243e6b]">Back</button>
                <button 
                  onClick={handleSubmit(onSubmit)}
                  disabled={loading}
                  className="flex items-center gap-3 px-10 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-900/20"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Globe size={20} />}
                  Launch My Shop
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="p-16 text-center animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle size={48} />
            </div>
            <h2 className="text-3xl font-black text-[#243e6b] mb-4 text-center">Your Mall Space is Ready!</h2>
            <p className="text-gray-500 mb-10 max-w-sm mx-auto">
              Congratulations! Your digital brand has been successfully created. You can now start adding products to your storefront.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
               <button 
                onClick={() => window.location.reload()}
                className="px-10 py-4 bg-[#243e6b] text-white font-black rounded-2xl shadow-xl shadow-blue-900/20"
               >
                 Go to Dashboard
               </button>
               <button 
                onClick={() => window.location.href = '/shops'}
                className="px-10 py-4 bg-gray-100 text-[#243e6b] font-black rounded-2xl"
               >
                 View Brand Directory
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreSetupWizard;
