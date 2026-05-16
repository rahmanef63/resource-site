import { Search, Globe, Share2 } from "lucide-react";

export default function Page() {
  return (
    <main className="min-h-screen bg-background p-8">
      <header className="mb-6">
        <h1 className="text-xl font-bold">SEO meta</h1>
        <p className="text-xs text-muted-foreground">generateMetadata helpers, sitemap, robots, OG image. Audit-bp gated.</p>
      </header>
      <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border/60 bg-card p-5">
          <h2 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Search className="size-3" /> Google SERP
          </h2>
          <div className="rounded-lg border border-border/40 bg-background p-4">
            <p className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400">https://kitab.dev › slices › ship-the-mesh</p>
            <p className="mt-1 text-base font-medium text-[#1a0dab] dark:text-[#8ab4f8]">Ship the slice mesh in one afternoon — Kitab</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">From <strong>npm init</strong> to live Convex backend on Dokploy. Copy proven vertical slices, wire bindings, and ship in hours. Audit-gated, type-safe, real-time.</p>
          </div>
        </section>
        <section className="rounded-2xl border border-border/60 bg-card p-5">
          <h2 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Share2 className="size-3" /> Share2 card
          </h2>
          <div className="overflow-hidden rounded-lg border border-border/40">
            <div className="relative h-32 bg-gradient-to-br from-violet-500/40 via-fuchsia-500/30 to-orange-500/30">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.3),transparent_60%)]" />
              <div className="absolute bottom-3 left-3 font-mono text-[10px] text-white/70">kitab.dev</div>
            </div>
            <div className="p-3">
              <p className="text-[11px] text-muted-foreground">kitab.dev</p>
              <p className="mt-0.5 text-sm font-semibold">Ship the slice mesh in one afternoon</p>
              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">Copy proven vertical slices, wire bindings, ship in hours.</p>
            </div>
          </div>
        </section>
        <section className="rounded-2xl border border-border/60 bg-card p-5 lg:col-span-2">
          <h2 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Globe className="size-3" /> generateMetadata output
          </h2>
          <pre className="overflow-x-auto rounded-md bg-muted/50 p-3 text-[11px] leading-relaxed">
{`{
  title: "Ship the slice mesh in one afternoon — Kitab",
  description: "From npm init to live Convex backend on Dokploy.",
  openGraph: {
    title: "Ship the slice mesh in one afternoon",
    description: "Copy proven vertical slices, wire bindings, ship in hours.",
    images: [{ url: "/og/ship-mesh.png", width: 1200, height: 630 }],
    type: "article",
  },
  twitter: { card: "summary_large_image", site: "@kitab_dev" },
  alternates: { canonical: "https://kitab.dev/blog/ship-mesh" },
}`}
          </pre>
        </section>
      </div>
    </main>
  );
}
