import { Search, Globe, Share2 } from "lucide-react";
import {
  SlicePreviewLayout,
  PreviewSection,
  CodeBlock,
} from "@/components/slice-previews/preview-layout";

/** SEO meta preview — SERP + social card + generateMetadata output. Brand
 *  literals are neutral demo strings (the slice ships NO brand: persona +
 *  domain are consumer-injected). Responsive: cards stack on mobile. */
export default function Page() {
  return (
    <SlicePreviewLayout
      title="SEO — AI Metadata Generator"
      kind="full"
      description="generateMetadata helpers, sitemap, robots, OG image + the AI metadata generator. Persona + domain are consumer-injected — zero baked-in brand."
    >
      <PreviewSection title="Search + social" hint="how the generated metadata renders">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border bg-card p-4">
            <h3 className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Search className="size-3" /> Google SERP
            </h3>
            <div className="rounded-lg border bg-background p-3">
              <p className="truncate font-mono text-[11px] text-emerald-700 dark:text-emerald-400">
                https://yoursite.dev › blog › ship-the-mesh
              </p>
              <p className="mt-1 text-sm font-medium text-[#1a0dab] dark:text-[#8ab4f8] sm:text-base">
                Ship the slice mesh in one afternoon
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                From <strong>npm init</strong> to live Convex backend on Dokploy.
                Copy proven vertical slices, wire bindings, ship in hours.
              </p>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-4">
            <h3 className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Share2 className="size-3" /> Social card
            </h3>
            <div className="overflow-hidden rounded-lg border">
              <div className="relative h-28 bg-gradient-to-br from-violet-500/40 via-fuchsia-500/30 to-orange-500/30">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.3),transparent_60%)]" />
                <div className="absolute bottom-3 left-3 font-mono text-[10px] text-white/70">
                  yoursite.dev
                </div>
              </div>
              <div className="p-3">
                <p className="text-[11px] text-muted-foreground">yoursite.dev</p>
                <p className="mt-0.5 text-sm font-semibold">
                  Ship the slice mesh in one afternoon
                </p>
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                  Copy proven vertical slices, wire bindings, ship in hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </PreviewSection>

      <PreviewSection
        title="generateMetadata() output"
        hint="AI-generated, schema-validated, length-capped"
      >
        <div className="mb-3 flex items-center gap-2 text-[11px] text-muted-foreground">
          <Globe className="size-3" /> Next.js App Router metadata object
        </div>
        <CodeBlock>{`{
  title: "Ship the slice mesh in one afternoon",
  description: "From npm init to live Convex backend on Dokploy.",
  openGraph: {
    title: "Ship the slice mesh in one afternoon",
    description: "Copy proven vertical slices, wire bindings, ship in hours.",
    images: [{ url: "/og/ship-mesh.png", width: 1200, height: 630 }],
    type: "article",
  },
  twitter: { card: "summary_large_image", site: "@yoursite" },
  alternates: { canonical: "https://yoursite.dev/blog/ship-mesh" },
}`}</CodeBlock>
      </PreviewSection>
    </SlicePreviewLayout>
  );
}
