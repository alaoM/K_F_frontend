'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCartStore } from '@/store/useCartStore'
import Image from 'next/image'
import { formatCurrency } from '@/helpers/functions'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'react-toastify'
import { Loader2 } from 'lucide-react' 
import PaymentVerificationModal from './PaymentVerification'

export type PaymentMethod = 'paystack' | 'flutterwave'

const GATEWAY_OPTIONS: {
  value: PaymentMethod
  label: string
  description: string
  isDefault?: boolean
}[] = [
  {
    value: 'paystack',
    label: 'Paystack',
    description: 'Cards, bank transfer, USSD',
    isDefault: true,
  },
  {
    value: 'flutterwave',
    label: 'Flutterwave',
    description: 'Cards, mobile money, bank',
  },
]

export default function CheckoutPage() {
  const router = useRouter()
 
  const searchParams = useSearchParams()
 
  const { items, getTotalPrice, removeItem, clearCart } = useCartStore()
  const { user, isLoading: isAuthLoading } = useAuth()
  const reference = searchParams.get('reference')

  const [note, setNote] = useState('')
  const [shippingAddress, setShippingAddress] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null)

  // ✅ Gateway selection state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('paystack')

  const subtotal = getTotalPrice()

  useEffect(() => {
    if (!isAuthLoading && !user) {
      toast.error('Please log in to checkout')
      router.push('/login?redirect=/checkout')
    }
  }, [user, isAuthLoading, router])

  useEffect(() => {
    if (user?.address && !shippingAddress) {
      setShippingAddress(user.address)
    }
  }, [user])

  if (isAuthLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-[#243e6b]" size={40} />
      </div>
    )
  }

  const handlePlaceOrder = async () => {
    if (!shippingAddress.trim()) {
      toast.error('Shipping address is required')
      return
    }
    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    setIsSubmitting(true)

    const payload = {
      items: items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      })),
      shippingAddress,
      noteToSeller: note,
      paymentMethod, // ✅ Now included
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.message || 'Something went wrong')
      if (!data.order?.id) throw new Error('Invalid order response')

      // ✅ Set order ID immediately so modal has it when reference appears
      setPlacedOrderId(data.order.id)

      if (!data.authorization_url) {
        clearCart()
        toast.success('Order placed successfully')
        router.push('/account?tab=orders')
        return
      }

      // ✅ Route to the correct gateway handler
      if (paymentMethod === 'flutterwave') {
        // Flutterwave uses a full redirect — no inline popup
        // The redirect_url we set on the backend will bring them back
        window.location.href = data.authorization_url
      } else {
        window.location.href = data.authorization_url
        // Paystack uses inline popup
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to place order')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT: Checkout Form */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
          <h2 className="text-xl font-bold text-[#243e6b]">Order details</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Shipping Address <span className="text-red-500">*</span>
              </label>
              <textarea
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Enter your full delivery address"
                className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#243e6b] focus:border-transparent outline-none resize-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Note to seller (Optional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Any special instructions for delivery?"
                className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#243e6b] focus:border-transparent outline-none resize-none transition-all"
              />
            </div>

            {/* ✅ Gateway Selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Payment method
              </label>
              <div className="flex flex-col gap-3">
                {GATEWAY_OPTIONS.map((gw) => (
                  <button
                    key={gw.value}
                    type="button"
                    onClick={() => setPaymentMethod(gw.value)}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
                      paymentMethod === gw.value
                        ? 'border-[#243e6b] bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    {/* Radio indicator */}
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        paymentMethod === gw.value
                          ? 'border-[#243e6b] bg-[#243e6b]'
                          : 'border-gray-300'
                      }`}
                    >
                      {paymentMethod === gw.value && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>

                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">{gw.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{gw.description}</p>
                    </div>

                    {gw.isDefault && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-md font-medium">
                        Default
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Order Summary */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6 h-fit">
          <h2 className="text-lg font-bold text-[#243e6b]">
            Order Summary ({items.length})
          </h2>

          <div className="max-h-80 overflow-y-auto pr-2">
            {items.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">Your cart is empty</p>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 border-b border-gray-100 pb-4 mb-4 last:mb-0 last:border-0 last:pb-0"
                >
                  <div className="w-16 h-16 relative border rounded-md overflow-hidden bg-gray-50 shrink-0">
                    <Image src={item.primaryImage} alt={item.title} fill className="object-cover" />
                  </div>
                  <div className="text-sm flex-1 flex flex-col justify-between">
                    <div>
                      <p className="font-semibold line-clamp-1">{item.title}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{item.businessName}</p>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <p className="font-medium text-[#243e6b]">
                        {item.quantity} × {formatCurrency(item.price)}
                      </p>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="space-y-3 text-sm bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="text-green-600 font-semibold">Calculated at payment</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-3 mt-3">
              <span>Total</span>
              <span className="text-[#243e6b]">{formatCurrency(subtotal)}</span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={items.length === 0 || isSubmitting}
            className="w-full bg-[#f6c947] text-[#243e6b] py-3.5 rounded-lg font-extrabold shadow-md hover:bg-[#f6c947]/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                PROCESSING...
              </>
            ) : (
              `PAY WITH ${paymentMethod.toUpperCase()}`
            )}
          </button>
        </div>
      </div>

      {/* ✅ Pass gateway to modal so it verifies with the right gateway */}
      {reference && (
    <PaymentVerificationModal
        gateway={searchParams.get('gateway') as PaymentMethod ?? 'paystack'}
    />
)}

    </div>
  )
}