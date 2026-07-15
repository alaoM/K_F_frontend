import type { Metadata } from 'next';
import ShopsClient from '../ShopsClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Verified Brands & Sellers',
  description:
    'Discover hundreds of verified fashion brands and sellers on fkstores. Browse unique digital storefronts, premium collections, and find the perfect brand for your style.',
  alternates: { canonical: '/shops' },
  openGraph: {
    title: 'Verified Brands & Sellers | fkstores',
    description:
      'Explore verified seller storefronts across Nigeria. Quality brands, premium collections, secure shopping.',
    url: '/shops',
  },
};

export default function ShopsPage() {
  return <ShopsClient />;
}
