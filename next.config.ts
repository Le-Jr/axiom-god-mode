import type { NextConfig } from 'next';

// cacheComponents is intentionally off: it keeps hidden routes alive via <Activity>,
// which would keep the WebGL game route mounted after leaving it (ADR-015).
const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

export default nextConfig;
