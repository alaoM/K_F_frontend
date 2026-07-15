import type { Metadata } from 'next';
import StorefrontClient from './StorefrontClient';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://fkstores.com';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4001';

interface Props {
  params: Promise<{ storeId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { storeId } = await params;

  try {
    const res = await fetch(`${API_URL}/sellers/${storeId}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error('Not found');
    const json = await res.json();
    const store = json.data;

    const name = store?.businessName || 'Store';
    const description = store?.bio
      ? store.bio.substring(0, 155)
      : `Browse products from ${name} on fkstores. Verified seller with secure escrow payments.`;
    const image = store?.banner || store?.logo || '/logo.png';

    return {
      title: `${name} — Official Store`,
      description,
      alternates: { canonical: `/store/${storeId}` },
      openGraph: {
        title: `${name} | fkstores`,
        description,
        url: `${SITE_URL}/store/${storeId}`,
        images: [{ url: image, width: 1200, height: 400, alt: `${name} banner` }],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${name} | fkstores`,
        description,
        images: [image],
      },
    };
  } catch {
    return {
      title: 'Seller Store | fkstores',
      description: 'Browse products from verified sellers on fkstores.',
    };
  }
}

export default async function StorefrontPage({ params }: Props) {
  const { storeId } = await params;

  // Fetch store server-side for JSON-LD
  let storeJsonLd: object | null = null;
  try {
    const res = await fetch(`${API_URL}/sellers/${storeId}`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const json = await res.json();
      const s = json.data;
      if (s) {
        storeJsonLd = {
          '@context': 'https://schema.org',
          '@type': 'Store',
          name: s.businessName,
          description: s.bio,
          image: s.banner || s.logo,
          url: `${SITE_URL}/store/${storeId}`,
          address: {
            '@type': 'PostalAddress',
            addressLocality: s.businessCity,
            addressRegion: s.businessState,
            addressCountry: 'NG',
          },
          aggregateRating: s.rating
            ? { '@type': 'AggregateRating', ratingValue: s.rating, bestRating: '5' }
            : undefined,
        };
      }
    }
  } catch {
    // JSON-LD is optional
  }

  return (
    <>
      {storeJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(storeJsonLd) }}
        />
      )}
      <StorefrontClient />
    </>
  );
}