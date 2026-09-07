'use client'

import { Loader2, Lock } from "lucide-react"
import React, { useRef } from "react"

interface OTPInputProps {
    length?: number
    value: string
    onChange: (value: string) => void
    onSubmit: (code: string) => void
    loading?: boolean
    setShowMfaModal: (show: boolean) => void
    setOtp: (otp: string) => void
}

const OTPInput: React.FC<OTPInputProps> = ({
    setShowMfaModal,
    length = 6,
    value,
    onChange,
    onSubmit,
    setOtp,
    loading = false
}) => {

    const inputsRef = useRef<(HTMLInputElement | null)[]>([])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const digit = e.target.value.replace(/\D/g, "")
        if (!digit) return

        const otp = value.split("")
        otp[index] = digit

        const newValue = otp.join("").slice(0, length)
        onChange(newValue)

        // Auto move
        if (index < length - 1) {
            inputsRef.current[index + 1]?.focus()
        }

        // ✅ Auto submit when complete
        if (newValue.length === length) {
            onSubmit(newValue)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace") {
            const otp = value.split("")

            if (otp[index]) {
                otp[index] = ""
                onChange(otp.join(""))
            } else if (index > 0) {
                inputsRef.current[index - 1]?.focus()
            }
        }

        if (e.key === "ArrowLeft" && index > 0) {
            inputsRef.current[index - 1]?.focus()
        }

        if (e.key === "ArrowRight" && index < length - 1) {
            inputsRef.current[index + 1]?.focus()
        }
    }

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault()

        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length)
        if (!pasted) return

        onChange(pasted)

        pasted.split("").forEach((digit, i) => {
            if (inputsRef.current[i]) {
                inputsRef.current[i]!.value = digit
            }
        })

        if (pasted.length === length) {
            onSubmit(pasted)
        }
    }

    return (
        <div className="mt-3 flex flex-col gap-4 border border-[#e2e2e2] rounded-none p-6 w-full max-w-md mx-auto bg-white">

            <div className="text-center space-y-2">
                <div className="w-16 h-16 flex items-center justify-center mx-auto">
                    <Lock size={32} />
                </div>

                <h3 className="font-bold text-lg">Two-Factor Authentication</h3>

                <p className="text-xs text-gray-400">
                    Enter the 6-digit code from your authenticator app
                </p>
            </div>

            <div className="flex gap-2 justify-between">
                {Array.from({ length }).map((_, index) => (
                    <input
                        key={index}
                        ref={(el) => { inputsRef.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={value[index] || ""}
                        onChange={(e) => handleChange(e, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        onPaste={handlePaste}
                        className="w-12 h-12 text-center border border-gray-300 rounded-none text-lg font-bold focus:outline-none focus:border-[#111111]"
                    />
                ))}
            </div>

            <button
                onClick={() => {
                    setShowMfaModal(false);
                    setOtp('');
                }}
                className="text-xs text-gray-400 underline mt-2"
            >
                Back to login
            </button>
            <button
                onClick={() => onSubmit(value)}
                disabled={loading || value.length !== length}
                className="bg-[#111111] hover:bg-[#f6c947] hover:text-[#111111] text-[#f6c947] font-black uppercase text-xs tracking-widest py-3 rounded-none flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
            >
                {loading && <Loader2 className="animate-spin" size={16} />}
                Verify Code
            </button>

        </div>
    )
}

export default OTPInput