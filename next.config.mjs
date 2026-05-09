/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
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
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async redirects() {
    return [
      // /features consolidated into /slices on 2026-05-09 (DRY cleanup).
      // Permanent — old links from PRs, docs, social posts must keep working.
      { source: "/features", destination: "/slices", permanent: true },
      { source: "/features/:slug", destination: "/slices/:slug", permanent: true },
    ];
  },
};
export default nextConfig;
