import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      new URL("https://e05rkwfvbuc2xu4f.public.blob.vercel-storage.com/*"),
    ],
  },
};

export default nextConfig;
