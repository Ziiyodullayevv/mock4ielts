import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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
};

export default nextConfig;
