import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.r2.dev" },
      { protocol: "https", hostname: "pub-*.r2.dev" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  // Allow large file uploads for STL files
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
};

export default nextConfig;
