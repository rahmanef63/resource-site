import { FeatureGridSection } from "@/features/feature-grid";
import { PageHeader } from "@/components/site/page-header";
import { stack } from "@/lib/content/sections";

export const metadata = { title: "Stack" };

const detail: Record<string, string> = {
  "Next.js 16": "App Router + Cache Components. proxy.ts boundary. cacheComponents flag enabled.",
  "React 19": "use(promise), ref-as-prop, taint APIs, Suspense streaming.",
  "TypeScript 5.6": "Strict mode. v.id() over v.string() for IDs. as const on literal arrays.",
  "Tailwind CSS 4": "OKLch theme system. CSS-first config via @theme inline. Runtime preset switching.",
  "shadcn/ui": "All components compose from shadcn primitives. ResponsiveDialog, DateField, FileUpload primitives.",
  "Convex (self-hosted)": "Postgres-backed in prod. S3 buckets for storage. Self-hosted via docker-compose alongside Next.",
  "@convex-dev/auth": "Password + GitHub + Google providers. ConvexAuthNextjsProvider. getAuthUserId() server-side.",
  Dokploy: "Self-hosted PaaS. si-coder skill automates deploy. Hostinger DNS auto-wired if token present.",
  "Radix UI": "Headless primitives under shadcn. Accessibility first.",
  "Lucide Icons": "+ @tabler/icons-react for variety. tree-shaken via optimizePackageImports.",
};

/**
 * Dogfood — `/stack` consumes the canonical `feature-grid` slice (cards
 * layout, 2 cols) instead of a bespoke Card grid. Same primitive every
 * template ships via `npx rr add feature-grid`.
 */
export default function StackPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Get Started"
        title="Stack"
        description="Everything you'd pick if you were starting today."
      />

      <FeatureGridSection
        className="!px-0 !py-10"
        columns={2}
        items={stack.map((s) => ({
          id: s.name,
          title: s.name,
          body: detail[s.name] ?? "—",
          link: { label: "Docs ↗", href: s.url },
        }))}
      />
    </div>
  );
}
