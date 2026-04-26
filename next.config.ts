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
