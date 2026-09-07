"use client";

export const dynamic = 'force-dynamic'

import React, { Suspense, useEffect, useState } from "react";
import { ShieldCheck, XCircle, Loader2 } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Link from "next/link";

type FormData = {
  email: string;
};

const EmailVerificationContent: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>();
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

   const verifyEmail = async () => {
  if (!token) {
    setStatus("error");
    setMessage("Invalid or missing verification token.");
    return;
  }

  try {
    const res = await fetch(`/api/auth/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    const data = await res.json();  

    if (!res.ok) {
      throw new Error(data?.message || "Verification failed");
    }

    setStatus("success");
    setMessage(data?.message || "Your email has been successfully verified.");

    // Redirect after short delay
    setTimeout(() => router.push("/login"), 2500);

  } catch (err: any) {
    console.error("Verification error:", err);
    setStatus("error");

    // Set message from error or fallback
    setMessage(err?.message || "An error occurred during verification.");
  }
};

    verifyEmail();
  }, [token, router]);


  const resendVerification = async () => {
    if (!token) return;

    setResending(true);

    try {
      const res = await fetch("/api/auth/resend-verification-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      if (!res.ok) throw new Error("Failed to resend email");

      setMessage("A new verification email has been sent.");
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setResending(false);
    }
  };



  return (
    <div className="fixed inset-0 bg-[#f9fafb] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-none border border-gray-200 shadow-xl overflow-hidden">

        <div className="h-2 bg-[#111111]" />

        <div className="p-8 text-center space-y-6">
          {status === "loading" && (
            <>
              <Loader2 className="mx-auto animate-spin text-[#111111]" size={40} />
              <h2 className="text-lg font-black uppercase text-[#111111]">Verifying Email...</h2>
              <p className="text-xs text-gray-500">
                Please wait while we confirm your email address.
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-none flex items-center justify-center text-green-700">
                <ShieldCheck size={32} />
              </div>
              <h2 className="text-xl font-black uppercase text-[#111111]">Verification Successful</h2>
              <p className="text-xs text-gray-500">{message}</p>

              <button
                onClick={() => router.push("/login")}
                className="mt-4 w-full bg-[#111111] hover:bg-[#f6c947] hover:text-[#111111] text-[#f6c947] font-black text-xs uppercase tracking-widest py-3.5 rounded-none transition-colors cursor-pointer"
              >
                Go to Login
              </button>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-none flex items-center justify-center text-red-600">
                <XCircle size={32} />
              </div>

              <h2 className="text-xl font-black uppercase text-red-600">
                Verification Failed
              </h2>

              <p className="text-xs text-gray-500">{message}</p>
              <div className="flex gap-2 justify-between pt-2">
                <Link href="/signup" className="flex-1 bg-[#111111] text-[#f6c947] hover:bg-black font-black text-xs uppercase tracking-wider rounded-none py-2.5 px-4 text-center">
                  Register
                </Link>
                <button className="flex-1 bg-red-600 text-white hover:bg-red-700 font-bold text-xs uppercase tracking-wider rounded-none py-2.5 px-4 text-center cursor-pointer" onClick={resendVerification}>
                  Resend Email
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default function EmailVerification() {
  return (
    <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center"><div className="w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin" /></div>}>
      <EmailVerificationContent />
    </Suspense>
  )
}