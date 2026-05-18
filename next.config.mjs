/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  // Pin a stable deploymentId so rolling deploys keep Server Action / RSC
  // payloads valid across instances. Override via NEXT_DEPLOYMENT_ID in CI.
  deploymentId: process.env.NEXT_DEPLOYMENT_ID,
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@tabler/icons-react",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-tabs",
      "@radix-ui/react-tooltip",
      "@radix-ui/react-scroll-area",
      "cmdk",
      "sonner",
    ],
    serverActions: {
      allowedOrigins: [
        "resource.rahmanef.com",
        "localhost:3000",
      ],
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async headers() {
    const base = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
    ];
    return [
      { source: "/(.*)", headers: base },
      {
        source: "/admin/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        source: "/api/admin/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // /features consolidated into /slices on 2026-05-09 (DRY cleanup).
      // Permanent — old links from PRs, docs, social posts must keep working.
      { source: "/features", destination: "/slices", permanent: true },
      { source: "/features/:slug", destination: "/slices/:slug", permanent: true },

      // /recipes migrated to /slices on 2026-05-12 (Phase 3 of REFACTOR-PLAN.md).
      // Notion sub-features (block-editor, page-tree-sidebar, ...) — lived inside
      // the notion slice, not portable standalone. Drop to /slices.
      // Promoted recipes get direct slug mapping (rbac-roles, admin-panel, ...).
      // Overlap recipes (command-palette → command-menu, doku-payment) get the
      // canonical slice slug.
      { source: "/recipes", destination: "/slices", permanent: true },
      { source: "/recipes/command-palette", destination: "/slices/command-menu", permanent: true },
      { source: "/recipes/doku-payment", destination: "/slices/doku-payment", permanent: true },
      { source: "/recipes/rbac-roles", destination: "/slices/rbac-roles", permanent: true },
      { source: "/recipes/admin-panel", destination: "/slices/admin-panel", permanent: true },
      { source: "/recipes/event-tracking", destination: "/slices/event-tracking", permanent: true },
      { source: "/recipes/theme-preset-switcher", destination: "/slices/theme-preset-switcher", permanent: true },
      { source: "/recipes/icon-picker", destination: "/slices/icon-picker", permanent: true },
      { source: "/recipes/contact-form-resend", destination: "/slices/contact-form-resend", permanent: true },
      // Notion sub-features → catalog
      { source: "/recipes/block-editor", destination: "/slices", permanent: true },
      { source: "/recipes/page-tree-sidebar", destination: "/slices", permanent: true },
      { source: "/recipes/multi-block-selection", destination: "/slices", permanent: true },
      { source: "/recipes/database-views", destination: "/slices", permanent: true },
      { source: "/recipes/comments-threaded", destination: "/slices", permanent: true },
    ];
  },
};
export default nextConfig;
