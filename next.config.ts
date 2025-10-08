import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',

  // Optimize for static generation
  images: {
    unoptimized: true,
  },

  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  generateBuildId: async () => {
    return process.env.SOURCE_COMMIT || Date.now().toString();
  },

  // Performance optimizations for landing page
  async headers() {
    return [
      {
        source: '/',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=86400',
          },
        ],
      },
      {
        // Cache static assets with long expiry but allow revalidation
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Don't cache HTML pages aggressively to prevent chunk mismatch
        source: '/((?!_next/static|favicon.ico).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, s-maxage=300, must-revalidate',
          },
        ],
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: '/ingest/static/:path*',
        destination: 'https://eu-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://eu.i.posthog.com/:path*',
      },
      {
        source: '/ingest/flags',
        destination: 'https://eu.i.posthog.com/flags',
      },
    ];
  },

  // Required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
