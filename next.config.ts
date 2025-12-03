import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'beta4.ruralindiaonline.org',
      },
      {
        protocol: 'https',
        hostname: 'beta.ruralindiaonline.org',
      },
      {
        protocol: 'https',
        hostname: 'dev.ruralindiaonline.org',
      },
      {
        protocol: 'https',
        hostname: 'merge.ruralindiaonline.org',
      },
      {
        protocol: 'https',
        hostname: 'ruralindiaonline.org',
      },
    ],
  },
};

export default nextConfig;
