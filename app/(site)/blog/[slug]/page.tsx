import type { Metadata } from 'next';
import BlogDetailClient from './BlogDetailClient';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://fkstores.com';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4001';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const res = await fetch(`${API_URL}/blog/slug/${slug}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error('Not found');
    const post = await res.json();

    const title = post?.title || 'Blog Post';
    const rawText = (post?.content || '').replace(/<[^>]*>/g, '');
    const description = rawText.substring(0, 155) || `Read ${title} on the fkstores fashion blog.`;
    const image = post?.featuredImage || '/logo.png';
    const author = post?.author?.fullName || 'fkstores';
    const publishedTime = post?.createdAt || new Date().toISOString();

    return {
      title,
      description,
      alternates: { canonical: `/blog/${slug}` },
      openGraph: {
        title: `${title} | fkstores Blog`,
        description,
        url: `${SITE_URL}/blog/${slug}`,
        type: 'article',
        publishedTime,
        authors: [author],
        images: [{ url: image, width: 1200, height: 630, alt: title }],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title} | fkstores Blog`,
        description,
        images: [image],
      },
    };
  } catch {
    return {
      title: 'Blog Post | fkstores',
      description: 'Read the latest fashion insights on the fkstores blog.',
    };
  }
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;

  // Fetch post server-side for Article JSON-LD
  let articleJsonLd: object | null = null;
  try {
    const res = await fetch(`${API_URL}/blog/slug/${slug}`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const post = await res.json();
      if (post?.title) {
        articleJsonLd = {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: post.title,
          description: (post.content || '').replace(/<[^>]*>/g, '').substring(0, 155),
          image: post.featuredImage || `${SITE_URL}/logo.png`,
          datePublished: post.createdAt,
          dateModified: post.updatedAt || post.createdAt,
          author: {
            '@type': 'Person',
            name: post.author?.fullName || 'fkstores',
          },
          publisher: {
            '@type': 'Organization',
            name: 'fkstores',
            logo: {
              '@type': 'ImageObject',
              url: `${SITE_URL}/logo.png`,
            },
          },
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${SITE_URL}/blog/${slug}`,
          },
          keywords: (post.tags || []).join(', '),
        };
      }
    }
  } catch {
    // JSON-LD is optional
  }

  return (
    <>
      {articleJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        />
      )}
      <BlogDetailClient />
    </>
  );
}
