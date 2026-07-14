import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '4001',
        pathname: '/uploads/**',
      },

    ],
  },
};

export default nextConfig;
