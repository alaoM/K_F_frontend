import Collections from '@/app/components/marketplace/Collections'
import React, { Suspense } from 'react'

export const dynamic = 'force-dynamic'

const Page = () => {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin" /></div>}>
      <Collections />
    </Suspense>
  )
}

export default Page