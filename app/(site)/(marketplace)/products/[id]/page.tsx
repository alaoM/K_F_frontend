import type { Metadata } from 'next';
import ProductDetailClient from './ProductDetailClient';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://fkstores.com';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4001';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const res = await fetch(`${API_URL}/products/${id}`, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error('Not found');
    const json = await res.json();
    const product = json.data;

    const title = product?.title || 'Product';
    const description = product?.description
      ? product.description.substring(0, 155)
      : `Shop ${title} on fkstores. Secure escrow payment and fast delivery across Nigeria.`;
    const image = product?.primaryImage || '/logo.png';
    const price = product?.price ? `₦${Number(product.price).toLocaleString()}` : '';
    const seller = product?.seller?.businessName || 'fkstores';

    return {
      title,
      description,
      alternates: { canonical: `/products/${id}` },
      openGraph: {
        title: `${title} | fkstores`,
        description,
        url: `${SITE_URL}/products/${id}`,
        images: [{ url: image, width: 800, height: 800, alt: title }],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title} | fkstores`,
        description,
        images: [image],
      },
    };
  } catch {
    return {
      title: 'Product | fkstores',
      description: 'Shop fashion products from verified sellers on fkstores.',
    };
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;

  // Fetch product server-side for JSON-LD structured data
  let productJsonLd: object | null = null;
  try {
    const res = await fetch(`${API_URL}/products/${id}`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const json = await res.json();
      const p = json.data;
      if (p) {
        productJsonLd = {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: p.title,
          description: p.description,
          image: [p.primaryImage, ...(p.otherImages || [])].filter(Boolean),
          brand: {
            '@type': 'Brand',
            name: p.seller?.businessName || 'fkstores',
          },
          offers: {
            '@type': 'Offer',
            url: `${SITE_URL}/products/${id}`,
            priceCurrency: 'NGN',
            price: p.price,
            availability:
              p.stock > 0
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            seller: {
              '@type': 'Organization',
              name: p.seller?.businessName || 'fkstores',
            },
          },
          aggregateRating: p.reviewCount > 0
            ? {
                '@type': 'AggregateRating',
                ratingValue: p.averageRating,
                reviewCount: p.reviewCount,
              }
            : undefined,
        };
      }
    }
  } catch {
    // JSON-LD is optional — silently skip if fetch fails
  }

  return (
    <>
      {productJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      )}
      <ProductDetailClient />
    </>
  );
}
