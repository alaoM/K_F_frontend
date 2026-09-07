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
                        <Loader2 className="animate-spin text-[#111111]" size={40} />
                    </div>
                ) : step === 'scan' ? (
                    <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                        <div className="text-center space-y-1 mb-4">
                            <p className="text-xs text-gray-500">Scan the QR code with Google Authenticator or Authy.</p>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-none flex flex-col items-center border border-gray-200 relative">
                            {qrCodeUrl && <Image width={150} height={150} src={qrCodeUrl} className="rounded-none shadow-md border-4 border-white" alt="QR" />}

                            <div className="mt-6 w-full space-y-2">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Manual Entry Key</p>
                                <div className="flex items-center gap-2 bg-white p-2.5 rounded-none border border-gray-200">
                                    <Key size={14} className="text-[#111111] shrink-0" />
                                    <code className="flex-1 text-xs font-mono font-bold text-gray-700 truncate">{setupData?.secret}</code>
                                    <button onClick={copySecret} className="p-1.5 hover:bg-gray-100 rounded-none transition-colors cursor-pointer">
                                        {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} className="text-gray-400" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className='flex justify-end'>
                            <button onClick={() => setStep('verify')} className="px-5 py-2.5 bg-[#111111] hover:bg-[#f6c947] hover:text-[#111111] text-[#f6c947] rounded-none font-black uppercase tracking-widest text-xs transition-colors cursor-pointer">
                                I have linked my device
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        <div className="text-center space-y-1 mb-4">
                            <p className="text-xs text-gray-500">Enter the 6-digit code displayed in your app.</p>
                        </div>

                        <div className="space-y-4 flex justify-center items-center">
                            <input
                                placeholder="000 000"
                                maxLength={6}
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                className="flex items-center justify-center p-2 rounded-none text-center text-3xl font-black tracking-[0.5em] bg-gray-50 border border-gray-300 outline-none focus:border-[#111111]"
                            />
                        </div>

                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setStep('scan')} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-none text-[#111111] font-bold text-xs uppercase tracking-wider cursor-pointer">
                                Back
                            </button>
                            <button
                                disabled={loading || verificationCode.length !== 6}
                                onClick={handleVerify}
                                className="px-5 py-2 bg-[#111111] hover:bg-[#f6c947] hover:text-[#111111] text-[#f6c947] rounded-none font-black uppercase tracking-widest text-xs transition-colors cursor-pointer disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin" size={14} /> : "Verify & Enable"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};