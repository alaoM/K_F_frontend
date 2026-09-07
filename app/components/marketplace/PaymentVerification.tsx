'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useCartStore } from '@/store/useCartStore'

type PaymentMethod = 'paystack' | 'flutterwave'

interface Props {
    gateway?: PaymentMethod
}

const PaymentVerificationModal = ({ gateway = 'paystack' }: Props) => {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const reference = searchParams.get('reference')
    const { clearCart } = useCartStore()

    type PaymentStatus = 'idle' | 'loading' | 'success' | 'error'
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle')
    const [errorMessage, setErrorMessage] = useState('')
    const [resolvedOrderId, setResolvedOrderId] = useState<string | null>(null)

    useEffect(() => {
        if (!reference) return

        const verifyPayment = async () => {
            setPaymentStatus('loading')
            try {
                const res = await fetch(
                    `/api/payments/verify?reference=${reference}&gateway=${gateway}`
                )
                const data = await res.json()

                if (data.success) {
                    setPaymentStatus('success')
                    setResolvedOrderId(data.orderId ?? null)
                    clearCart()
                    setTimeout(() => {
                        const params = new URLSearchParams(searchParams.toString())
                        params.delete('reference')
                        params.delete('gateway')
                        router.replace(`${pathname}?${params.toString()}`)
                    }, 3000)
                } else {
                    setPaymentStatus('error')
                    setErrorMessage(data.message || 'Payment could not be verified')
                }
            } catch {
                setPaymentStatus('error')
                setErrorMessage('Network error. Please check your orders page.')
            }
        }

        verifyPayment()
    }, [reference])

    if (!reference) return null

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-none p-8 max-w-sm w-full text-center space-y-4 shadow-2xl border border-gray-200">

                {paymentStatus === 'loading' && (
                    <>
                        <Loader2 className="animate-spin mx-auto text-[#111111]" size={40} />
                        <h2 className="text-lg font-black uppercase text-[#111111]">Verifying Payment...</h2>
                        <p className="text-xs text-gray-500">Please wait, do not close this window.</p>
                    </>
                )}

                {paymentStatus === 'success' && (
                    <>
                        <div className="w-16 h-16 bg-green-100 text-green-700 rounded-none flex items-center justify-center mx-auto text-2xl font-black">✓</div>
                        <h2 className="text-xl font-black uppercase text-[#111111]">Payment Successful!</h2>
                        <p className="text-xs text-gray-600">
                            {resolvedOrderId
                                ? `Order #${resolvedOrderId.slice(0, 8)} confirmed.`
                                : 'Your order has been confirmed.'}
                        </p>
                        <button
                            onClick={() => router.push('/account?tab=orders')}
                            className="w-full bg-[#111111] text-[#f6c947] hover:bg-[#f6c947] hover:text-[#111111] transition-colors py-3 rounded-none font-black uppercase tracking-widest text-xs mt-4"
                        >
                            View My Orders
                        </button>
                    </>
                )}

                {paymentStatus === 'error' && (
                    <>
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-none flex items-center justify-center mx-auto text-2xl font-black">✕</div>
                        <h2 className="text-xl font-black uppercase text-[#111111]">Verification Failed</h2>
                        <p className="text-xs text-gray-500">{errorMessage}</p>
                        <div className="flex flex-col gap-2 mt-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full border border-[#111111] text-[#111111] hover:bg-gray-100 py-3 rounded-none font-black uppercase tracking-widest text-xs"
                            >
                                Retry Verification
                            </button>
                            <button
                                onClick={() => router.push('/account?tab=orders')}
                                className="w-full bg-red-600 text-white hover:bg-red-700 py-3 rounded-none font-black uppercase tracking-widest text-xs"
                            >
                                Go to Orders
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default PaymentVerificationModal