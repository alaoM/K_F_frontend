import type { Metadata } from "next";
import HomepageClient from "./HomepageClient";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fkstores.com";

export const metadata: Metadata = {
  title: "Shop Fashion Online — Clothing, Accessories & More",
  description:
    "Shop the latest fashion trends on fkstores. Browse thousands of verified sellers offering clothing, shoes, bags, and accessories. Secure escrow payments, fast delivery across Nigeria.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "fkstores — Nigeria's #1 Fashion Marketplace",
    description:
      "Shop the latest fashion trends from verified sellers. Secure escrow payments, free shipping on orders over ₦50k.",
    url: SITE_URL,
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "fkstores — Nigeria's Fashion Marketplace",
      },
    ],
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "fkstores",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  sameAs: [],
  description:
    "Nigeria's premium online fashion marketplace connecting buyers with verified sellers.",
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "fkstores",
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/collections?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <HomepageClient />
    </>
  );
}
