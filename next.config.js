/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  transpilePackages: ['keen-slider'],
  webpack: (config) => {
    config.module.rules.push({
      test: /\.css$/i,
      use: ["style-loader", "css-loader"],
    });
    return config;
  },
}

module.exports = nextConfig