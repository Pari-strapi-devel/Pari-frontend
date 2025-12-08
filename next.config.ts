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
  transpilePackages: [
    '@radix-ui/react-checkbox',
    '@radix-ui/react-collapsible',
    '@radix-ui/react-dialog',
    '@radix-ui/react-dropdown-menu',
    '@radix-ui/react-icons',
    '@radix-ui/react-label',
    '@radix-ui/react-navigation-menu',
    '@radix-ui/react-select',
    '@radix-ui/react-slot',
  ],
  // Turbopack configuration (Next.js 16 default)
  turbopack: {
    root: process.cwd(),
    resolveAlias: {
      '@radix-ui/react-checkbox': '@radix-ui/react-checkbox',
      '@radix-ui/react-collapsible': '@radix-ui/react-collapsible',
      '@radix-ui/react-dialog': '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu': '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-icons': '@radix-ui/react-icons',
      '@radix-ui/react-label': '@radix-ui/react-label',
      '@radix-ui/react-navigation-menu': '@radix-ui/react-navigation-menu',
      '@radix-ui/react-select': '@radix-ui/react-select',
      '@radix-ui/react-slot': '@radix-ui/react-slot',
    },
  },
  // Webpack configuration (fallback for when using --webpack flag)
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@radix-ui/react-checkbox': require.resolve('@radix-ui/react-checkbox'),
      '@radix-ui/react-collapsible': require.resolve('@radix-ui/react-collapsible'),
      '@radix-ui/react-dialog': require.resolve('@radix-ui/react-dialog'),
      '@radix-ui/react-dropdown-menu': require.resolve('@radix-ui/react-dropdown-menu'),
      '@radix-ui/react-icons': require.resolve('@radix-ui/react-icons'),
      '@radix-ui/react-label': require.resolve('@radix-ui/react-label'),
      '@radix-ui/react-navigation-menu': require.resolve('@radix-ui/react-navigation-menu'),
      '@radix-ui/react-select': require.resolve('@radix-ui/react-select'),
      '@radix-ui/react-slot': require.resolve('@radix-ui/react-slot'),
    };
    return config;
  },
};

export default nextConfig;
