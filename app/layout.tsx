import type { Metadata } from "next";
import { Playfair_Display, Poppins } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fkstores.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "fkstores — Nigeria's Fashion Marketplace",
    template: "%s | fkstores",
  },
  description:
    "Discover thousands of verified fashion brands and sellers on fkstores — Nigeria's premium online fashion marketplace. Shop clothing, accessories, and more with secure escrow payments.",
  keywords: [
    "fashion marketplace",
    "buy clothes online Nigeria",
    "Nigerian fashion",
    "online shopping Nigeria",
    "fkstores",
    "verified sellers",
    "clothing store",
    "accessories Nigeria",
  ],
  authors: [{ name: "fkstores" }],
  creator: "fkstores",
  publisher: "fkstores",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: SITE_URL,
    siteName: "fkstores",
    title: "fkstores — Nigeria's Fashion Marketplace",
    description:
      "Discover thousands of verified fashion brands and sellers. Shop clothing, accessories, and more with secure escrow payments.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "fkstores — Nigeria's Fashion Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "fkstores — Nigeria's Fashion Marketplace",
    description:
      "Discover thousands of verified fashion brands and sellers on fkstores.",
    images: ["/logo.png"],
    creator: "@fkstores",
  },
};

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: [
    "400",
    "500",
    "600",
    "700",
    "800",
    "900",
    "400",
    "500",
    "600",
    "700",
    "800",
    "900",
  ],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${playfair.variable} antialiased`}
      >

        {children}
         <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            limit={1}
          />
      </body>
    </html>
  );
}
