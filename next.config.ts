import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Disable features that don't work with static export
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
