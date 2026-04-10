import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Cloudflare R2 (file storage)
      { protocol: "https", hostname: "*.r2.dev" },
      { protocol: "https", hostname: "pub-*.r2.dev" },
      // Unsplash (placeholder photos)
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      // Wikimedia (reference images)
      { protocol: "https", hostname: "upload.wikimedia.org" },
      // MakerWorld 3D print renders
      { protocol: "https", hostname: "makerworld.bblmake.com" },
      { protocol: "https", hostname: "makerworld.com" },
      // Thingiverse 3D print renders
      { protocol: "https", hostname: "cdn.thingiverse.com" },
      // Supabase Storage (customer photo uploads)
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
  // Allow large file uploads for STL files, photos, and App Router POST bodies
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
    /** Helps avoid plain-text proxy errors when multipart uploads exceed the default ~10MB. */
    proxyClientMaxBodySize: "100mb",
  },
};

export default nextConfig;
