/** @type {import('next').NextConfig} */

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL ?? '';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';

let convexWs = '';
try {
  if (convexUrl) {
    const u = new URL(convexUrl);
    convexWs = `wss://${u.host}`;
  }
} catch { /* ignore */ }

const cspDirectives = [
  `script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://cdn.tailwindcss.com`,
  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
  `img-src 'self' data: blob: https:`,
  `font-src 'self' https://fonts.gstatic.com`,
  [
    `connect-src 'self'`,
    convexUrl,
    convexWs,
    `https://openrouter.ai`,
  ].filter(Boolean).join(' '),
  `frame-src 'self' https://challenges.cloudflare.com`,
  `worker-src 'self' blob:`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `upgrade-insecure-requests`,
];

const csp = cspDirectives.join('; ');

const nextConfig = {
  // Next 16 — Cache Components
  cacheComponents: true,

  // Multi-instance / si-coder dokploy: pin per deploy
  deploymentId: process.env.NEXT_DEPLOYMENT_ID,

  // Self-host docker output
  output: 'standalone',

  experimental: {
    serverActions: {
      allowedOrigins: siteUrl ? [new URL(siteUrl).host] : [],
      bodySizeLimit: '5mb',
    },
    optimizePackageImports: [
      'lucide-react',
      '@tabler/icons-react',
      'framer-motion',
      'recharts',
      '@radix-ui/react-accordion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-popover',
      '@radix-ui/react-context-menu',
      '@radix-ui/react-scroll-area',
      'date-fns',
      '@dnd-kit/core',
      '@dnd-kit/sortable',
      '@dnd-kit/utilities',
      'cmdk',
      'sonner',
      'convex',
      'convex/react',
    ],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
    ],
  },
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
          { key: 'Service-Worker-Allowed', value: '/' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
      {
        source: '/manifest.webmanifest',
        headers: [
          { key: 'Cache-Control', value: 'no-cache' },
          { key: 'Content-Type', value: 'application/manifest+json' },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
        ],
      },
    ];
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        stream: false,
        util: false,
        buffer: false,
      };
    }
    return config;
  },
};

export default nextConfig;
