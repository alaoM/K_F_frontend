import type { Metadata } from 'next';
import BlogListClient from './BlogListClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Fashion Blog & Style Guides',
  description:
    'Explore the fkstores blog for the latest fashion trends, style guides, sustainability insights, and industry news. Stay ahead of the curve with expert fashion advice.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Fashion Blog & Style Guides | fkstores',
    description:
      'Discover fashion trends, style tips, and sustainable fashion insights on the fkstores blog.',
    url: '/blog',
    type: 'website',
  },
};

export default function BlogListPage() {
  return <BlogListClient />;
}
