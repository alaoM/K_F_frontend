import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://fkstores.com';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4001';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // ── Static routes ──────────────────────────────────────────────────────────
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/collections`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/shops`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  // ── Dynamic: Products ──────────────────────────────────────────────────────
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_URL}/products?limit=500`, {
      next: { revalidate: 86400 },
    });
    if (res.ok) {
      const json = await res.json();
      const products: { id: string; updatedAt?: string }[] = Array.isArray(json)
        ? json
        : json.data || json.products || [];

      productRoutes = products.map((p) => ({
        url: `${SITE_URL}/products/${p.id}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
    }
  } catch {
    // Silently skip if API unreachable during build
  }

  // ── Dynamic: Blog posts ────────────────────────────────────────────────────
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_URL}/blog?limit=500`, {
      next: { revalidate: 86400 },
    });
    if (res.ok) {
      const json = await res.json();
      const posts: { slug: string; updatedAt?: string; createdAt?: string }[] =
        Array.isArray(json) ? json : json.data || [];

      blogRoutes = posts.map((p) => ({
        url: `${SITE_URL}/blog/${p.slug}`,
        lastModified: p.updatedAt
          ? new Date(p.updatedAt)
          : p.createdAt
          ? new Date(p.createdAt)
          : now,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }));
    }
  } catch {
    // Silently skip
  }

  // ── Dynamic: Seller storefronts ────────────────────────────────────────────
  let storeRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_URL}/sellers?limit=500`, {
      next: { revalidate: 86400 },
    });
    if (res.ok) {
      const json = await res.json();
      const sellers: { id: string; updatedAt?: string }[] = Array.isArray(json)
        ? json
        : json.data || [];

      storeRoutes = sellers.map((s) => ({
        url: `${SITE_URL}/store/${s.id}`,
        lastModified: s.updatedAt ? new Date(s.updatedAt) : now,
        changeFrequency: 'weekly' as const,
        priority: 0.65,
      }));
    }
  } catch {
    // Silently skip
  }

  return [...staticRoutes, ...productRoutes, ...blogRoutes, ...storeRoutes];
}
