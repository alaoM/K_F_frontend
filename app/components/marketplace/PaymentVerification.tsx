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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-8 max-w-sm w-full text-center space-y-4 shadow-2xl">

                {paymentStatus === 'loading' && (
                    <>
                        <Loader2 className="animate-spin mx-auto text-[#243e6b]" size={40} />
                        <h2 className="text-xl font-bold">Verifying Payment...</h2>
                        <p className="text-sm text-gray-500">Please wait, do not close this window.</p>
                    </>
                )}

                {paymentStatus === 'success' && (
                    <>
                        <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto text-3xl">✓</div>
                        <h2 className="text-2xl font-bold">Payment Successful!</h2>
                        <p className="text-sm text-gray-500">
                            {resolvedOrderId
                                ? `Order #${resolvedOrderId.slice(0, 8)} confirmed.`
                                : 'Your order has been confirmed.'}
                        </p>
                        <button
                            onClick={() => router.push('/account?tab=orders')}
                            className="w-full bg-[#243e6b] text-white py-3 rounded-lg font-bold mt-4"
                        >
                            View My Orders
                        </button>
                    </>
                )}

                {paymentStatus === 'error' && (
                    <>
                        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto text-3xl">✕</div>
                        <h2 className="text-xl font-bold">Verification Failed</h2>
                        <p className="text-sm text-gray-500">{errorMessage}</p>
                        <div className="flex flex-col gap-2 mt-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full border border-[#243e6b] text-[#243e6b] py-3 rounded-lg font-bold"
                            >
                                Retry Verification
                            </button>
                            <button
                                onClick={() => router.push('/account?tab=orders')}
                                className="w-full bg-red-500 text-white py-3 rounded-lg font-bold"
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