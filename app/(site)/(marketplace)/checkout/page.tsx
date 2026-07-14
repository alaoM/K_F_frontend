import CheckoutPage from '@/app/components/marketplace/Checkout'
import React, { Suspense } from 'react'

export const dynamic = 'force-dynamic'

const Page = () => {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin" /></div>}>
      <CheckoutPage />
    </Suspense>
  )
}

export default Page