import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'production.ruralindiaonline.org',
      },
      {
        protocol: 'https',
        hostname: 'merge.ruralindiaonline.org',
      },
      {
        protocol: 'https',
        hostname: 'ruralindiaonline.org',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
    ],
  },
};

export default nextConfig;
