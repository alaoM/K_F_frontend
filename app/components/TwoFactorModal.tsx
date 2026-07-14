'use client';

import React, { useState, useEffect } from 'react';
 
 
import {
    Loader2,
    Copy, Check, Key,
    
} from 'lucide-react';
import QRCode from 'qrcode';
import { toast } from 'react-toastify';
import { useApi } from '@/hooks/useApi';
import Image from 'next/image';
import { Modal } from './Modal';

interface TwoFactorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const TwoFactorModal = ({ isOpen, onClose, onSuccess }: TwoFactorModalProps) => {
    const fetcher = useApi();
    const [step, setStep] = useState<'loading' | 'scan' | 'verify'>('loading');
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [setupData, setSetupData] = useState<any>(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isOpen) initiateSetup();
    }, [isOpen]);

    const initiateSetup = async () => {
        setStep('loading');
        try {
            const { data } = await fetcher('/api/auth/2FA/setup', { method: 'POST' });
            setSetupData(data);

            const qrImage = await QRCode.toDataURL(data.otpauthUrl);
            setQrCodeUrl(qrImage);
            setStep('scan');
        } catch (e) {
            toast.error("Failed to initialize 2FA");
            onClose();
        }
    };

    const copySecret = () => {
        if (setupData?.secret) {
            navigator.clipboard.writeText(setupData.secret);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);

        }
    };

    const handleVerify = async () => {
        if (verificationCode.length !== 6) {
            return toast.error("Enter 6 digits");
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/2FA/confirm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code: verificationCode }),
            });

            const data = await res.json();


            if (!res.ok) {
                throw new Error(data?.message || "Verification failed");
            }

            toast.success("2FA successfully enabled!");
            onSuccess();

        } catch (e: any) {
            console.error("2FA error:", e);
            toast.error(e?.message || "Invalid or expired code");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title='Security Authentication'>
            <div className="p-2 pb-6">
                {step === 'loading' ? (
                    <div className="flex flex-col items-center py-12 gap-4">
                        <Loader2 className="animate-spin text-emerald-600" size={40} />
                    </div>
                ) : step === 'scan' ? (
                    <div className="space-y-6 animate-in fade-in zoom-in duration-500">
                        <div className="text-center space-y-2 mb-4">

                            <p className="text-xs text-gray-500">Scan the QR code with Google Authenticator or Authy.</p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-[2.5rem] flex flex-col items-center border border-gray-100 shadow-inner relative">
                            {qrCodeUrl && <Image width={150} height={150} src={qrCodeUrl} className="rounded-2xl shadow-2xl border-8 border-white" alt="QR" />}

                            <div className="mt-8 w-full space-y-3">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Manual Entry Key</p>
                                <div className="flex items-center gap-2 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                                    <Key size={16} className="text-emerald-500 shrink-0" />
                                    <code className="flex-1 text-xs font-mono font-bold text-gray-600 truncate">{setupData?.secret}</code>
                                    <button onClick={copySecret} className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
                                        {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} className="text-gray-400" />}
                                    </button>
                                </div>
                            </div>
                        </div>
<div className='flex justify-end'>
                        <button  onClick={() => setStep('verify')} className="px-5 py-3 bg-[#f6c947] rounded-xl font-black  tracking-widest text-xs shadow-lg shadow-emerald-100">
                            I have linked my device
                        </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                        <div className="text-center space-y-2 mb-4">

                            <p className="text-xs text-gray-500">Enter the 6-digit code displayed in your app.</p>
                        </div>

                        <div className="space-y-4 flex justify-center items-center">
                            <input
                                placeholder="000 000"
                                maxLength={6}
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                className="flex item-center justify-center p-2  rounded-md text-center text-3xl font-black tracking-[0.5em]    bg-gray-50 border-none"
                            />

                        </div>

                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setStep('scan')} className="px-5 py-3 bg-[#30302f] rounded-xl 
                            text-white  text-xs  ">Back</button>
                            <button
                                disabled={loading || verificationCode.length !== 6}
                                onClick={handleVerify}
                                className="px-5 py-3 bg-[#f6c947] rounded-xl font-black  tracking-widest text-xs shadow-lg shadow-emerald-100"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : "Verify & Enable"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};