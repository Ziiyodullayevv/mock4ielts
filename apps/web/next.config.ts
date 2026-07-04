import type { NextConfig } from 'next';

const isStaticExport = false;

const nextConfig: NextConfig = {
  reactStrictMode: false,
  trailingSlash: true,
  output: isStaticExport ? 'export' : 'standalone',
  env: {
    BUILD_STATIC_EXPORT: JSON.stringify(isStaticExport),
  },
  images: {
    deviceSizes: [640, 828, 1080, 1200, 1920, 2560],
    minimumCacheTTL: 2592000,
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.vidu.zone',
      },
      {
        protocol: 'https',
        hostname: '**.vidu.studio',
      },
    ],
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
