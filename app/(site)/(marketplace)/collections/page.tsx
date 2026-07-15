import type { Metadata } from 'next'
import Collections from '@/app/components/marketplace/Collections'
import React, { Suspense } from 'react'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Browse All Collections',
  description:
    'Explore our full range of fashion collections on fkstores. Filter by category, price, and brand to find exactly what you\'re looking for — clothing, shoes, bags, and accessories from verified sellers.',
  alternates: { canonical: '/collections' },
  openGraph: {
    title: 'Browse All Collections | fkstores',
    description:
      'Filter and shop thousands of fashion products from verified sellers across Nigeria.',
    url: '/collections',
  },
}

const Page = () => {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin" /></div>}>
      <Collections />
    </Suspense>
  )
}

export default Page