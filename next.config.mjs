// Build-time id baked into client bundle + served by /api/version so
// VersionWatcher can detect a redeploy and toast users to reload.
// Falls back to per-build timestamp when no env id is supplied.
const BUILD_ID =
  process.env.NEXT_PUBLIC_BUILD_ID ||
  process.env.NEXT_DEPLOYMENT_ID ||
  String(Date.now());

/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  // Docker-only: emit .next/standalone (server.js + traced files) so the
  // runtime image ships without the full node_modules tree. Gated behind an
  // env flag because `next start` (local prod run, e2e :3137) does not work
  // with output:"standalone".
  output: process.env.NEXT_OUTPUT_STANDALONE === "1" ? "standalone" : undefined,
  // Runtime fs reads that static tracing can't see (directory walks):
  // slice Code tabs (lib/slice-files.ts), layout pullPaths, /admin registry +
  // lineage. Paths absent from the docker context (.dockerignore) are no-ops.
  outputFileTracingIncludes: {
    "/**": [
      "frontend/slices/**",
      "app/preview/**",
      "components/templates/**",
      ".kitab/lineage/**",
      "packages/cli/lib/**",
      "packages/cli/package.json",
      "packages/mcp/package.json",
    ],
  },
  // Dev-only: without this, browsing the dev server via 127.0.0.1 (instead
  // of localhost) silently blocks /_next/* assets — the page renders but
  // never hydrates, so every click is dead. Cost us a real debugging hour.
  allowedDevOrigins: ["127.0.0.1"],
  // rahman-shared ships raw .ts in dist/src; tell Turbopack to transpile.
  // Required since notifications + future lifts rewrite @/shared/lib/utils
  // imports to rahman-shared/lib/utils.
  transpilePackages: ["rahman-shared"],
  // Pin a stable deploymentId so rolling deploys keep Server Action / RSC
  // payloads valid across instances. Override via NEXT_DEPLOYMENT_ID in CI.
  deploymentId: process.env.NEXT_DEPLOYMENT_ID || BUILD_ID,
  env: {
    NEXT_PUBLIC_BUILD_ID: BUILD_ID,
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@tabler/icons-react",
      "radix-ui",
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
      // Deliberately the enforceable-without-breakage subset: script-src is
      // omitted because GA4 ships inline snippets and there is no nonce
      // infrastructure; frame-ancestors 'self' still allows the site's own
      // self-iframed slice/layout previews while blocking clickjacking.
      {
        key: "Content-Security-Policy",
        value: "frame-ancestors 'self'; object-src 'none'; base-uri 'self'",
      },
    ];
    return [
      { source: "/(.*)", headers: base },
      {
        source: "/admin/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'",
          },
        ],
      },
      {
        source: "/api/admin/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'",
          },
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

      // AZ-wave (2026-05-19): /preview/<template>/admin → /preview/<template>/dashboard/admin
      // Dashboard becomes operator root; admin is now a sub-section
      // alongside workspace. See docs/architecture/dashboard-vision.md.
      // Permanent so any external link (docs, PR, shared URL) keeps working.
      { source: "/preview/:tpl/admin", destination: "/preview/:tpl/dashboard/admin", permanent: true },
      { source: "/preview/:tpl/admin/:path*", destination: "/preview/:tpl/dashboard/admin/:path*", permanent: true },

      // P5 (2026-06-19): retire /layouts + /templates catalogs and the old
      // /preview/<layout-slug> section/OS demos. lib/content/layouts.ts is now
      // empty; everything redirects into the Grand Tour. (Routes/dirs stay on
      // disk until P6 — these 308s intercept at the edge so the empty-array
      // renders are never reached.) DO NOT touch proxy.ts subdomain rewrites.
      // NOTE: the two /preview/:tpl/admin* rules above MUST stay listed BEFORE
      // the OS-prefix /preview/<os-slug>/:path* entries (first-match-wins).
      { source: "/layouts", destination: "/tour", permanent: true },
      { source: "/layouts/:slug*", destination: "/tour", permanent: true },
      { source: "/templates", destination: "/tour", permanent: true },
      { source: "/templates/:slug*", destination: "/tour", permanent: true },

      // OS website-templates (full-app demos) → Grand Tour
      { source: "/preview/personal-brand-os/:path*", destination: "/tour", permanent: true },
      { source: "/preview/agency-studio-os/:path*", destination: "/tour", permanent: true },
      { source: "/preview/notion-page-clone-os/:path*", destination: "/tour", permanent: true },
      { source: "/preview/saas-marketing-os/:path*", destination: "/tour", permanent: true },
      { source: "/preview/kreator-studio-os/:path*", destination: "/tour", permanent: true },
      { source: "/preview/konsultan-os/:path*", destination: "/tour", permanent: true },
      { source: "/preview/wirausaha-os/:path*", destination: "/tour", permanent: true },
      { source: "/preview/riset-kit/:path*", destination: "/tour", permanent: true },

      // Marketing section demos (hero / pricing / accordion / landing) → marketing act
      { source: "/preview/hero-centered", destination: "/tour/marketing", permanent: true },
      { source: "/preview/hero-split", destination: "/tour/marketing", permanent: true },
      { source: "/preview/hero-bento-bg", destination: "/tour/marketing", permanent: true },
      { source: "/preview/hero-video-loop", destination: "/tour/marketing", permanent: true },
      { source: "/preview/hero-animated-text", destination: "/tour/marketing", permanent: true },
      { source: "/preview/pricing-three", destination: "/tour/marketing", permanent: true },
      { source: "/preview/pricing-four", destination: "/tour/marketing", permanent: true },
      { source: "/preview/pricing-toggle", destination: "/tour/marketing", permanent: true },
      { source: "/preview/pricing-compare", destination: "/tour/marketing", permanent: true },
      { source: "/preview/pricing-slider", destination: "/tour/marketing", permanent: true },
      { source: "/preview/accordion-faq", destination: "/tour/marketing", permanent: true },
      { source: "/preview/accordion-grouped", destination: "/tour/marketing", permanent: true },
      { source: "/preview/accordion-sidebar", destination: "/tour/marketing", permanent: true },
      { source: "/preview/accordion-animated", destination: "/tour/marketing", permanent: true },
      { source: "/preview/accordion-multi", destination: "/tour/marketing", permanent: true },
      { source: "/preview/landing-hero-carousel", destination: "/tour/marketing", permanent: true },
      { source: "/preview/landing-asymmetric-masonry", destination: "/tour/marketing", permanent: true },
      { source: "/preview/landing-bento", destination: "/tour/marketing", permanent: true },
      { source: "/preview/landing-kinetic-text", destination: "/tour/marketing", permanent: true },

      // CMS blog demos → content act
      { source: "/preview/blog-grid", destination: "/tour/content", permanent: true },
      { source: "/preview/blog-list", destination: "/tour/content", permanent: true },
      { source: "/preview/blog-magazine", destination: "/tour/content", permanent: true },
      { source: "/preview/blog-masonry", destination: "/tour/content", permanent: true },
      { source: "/preview/blog-featured", destination: "/tour/content", permanent: true },

      // Dashboard + CMS-storefront demos → platform act
      { source: "/preview/dashboard-three-column", destination: "/tour/platform", permanent: true },
      { source: "/preview/dashboard-ide", destination: "/tour/platform", permanent: true },
      { source: "/preview/dashboard-mobile-dock", destination: "/tour/platform", permanent: true },
      { source: "/preview/cms-public-storefront", destination: "/tour/platform", permanent: true },
    ];
  },
};
export default nextConfig;
