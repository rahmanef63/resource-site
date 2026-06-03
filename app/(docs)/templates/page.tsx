import { Globe } from "lucide-react";
import { layouts } from "@/lib/content/layouts";
import { CatalogCard } from "@/components/site/catalog/catalog-card";
import { type CatalogSearchItem } from "@/components/site/catalog/catalog-search";
import { CatalogHero } from "@/components/site/catalog/catalog-hero";
import { CatalogTabs } from "@/components/site/catalog/catalog-tabs";
import { getExternalDemoUrl } from "@/lib/content/template-subdomains";
import { PosterThumbnail } from "@/components/site/catalog/poster-thumbnail";
import { UseWideLayout } from "@/components/site/use-wide-layout";

export const metadata = {
  title: "Website Templates",
  description: "Full-app templates with public + admin surfaces.",
};

export default function TemplatesPage() {
  const sources = layouts.filter((l) => l.category === "website-template");

  const tagFreq = new Map<string, number>();
  for (const t of sources) for (const tag of t.tags ?? []) tagFreq.set(tag, (tagFreq.get(tag) ?? 0) + 1);
  const topTags = [...tagFreq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([t]) => t);

  const items: CatalogSearchItem[] = sources.map((l) => ({
    key: l.slug,
    search: `${l.title} ${l.description} ${(l.tags ?? []).join(" ")}`.toLowerCase(),
    tags: l.tags,
    node: (
      <CatalogCard
        href={`/layouts/${l.slug}`}
        title={l.title}
        description={l.description}
        tags={l.tags}
        meta={<span className="font-mono">{l.source}</span>}
        thumbnail={
          <PosterThumbnail
            slug={l.slug}
            title={l.title}
            demoUrl={getExternalDemoUrl(l.slug)}
            previewPath={l.previewPath}
            defaultView={l.defaultView}
            defaultZoom={l.defaultZoom}
          />
        }
      />
    ),
  }));

  return (
    <div className="space-y-8">
      <UseWideLayout />
      <CatalogHero
        pill="Catalog"
        icon={Globe}
        title="Website templates"
        subtitle={`${sources.length} full-app templates with public + admin surface, live cross-iframe sync, and slice structure.`}
        primaryCta={{ label: "Bundle builder", href: "/build" }}
        secondaryCta={{ label: "Slices", href: "/slices" }}
      />

      {sources.length === 0 ? (
        <div className="rounded-md border border-dashed bg-muted/10 p-10 text-center">
          <p className="text-sm text-muted-foreground">No website templates yet.</p>
        </div>
      ) : (
        <CatalogTabs items={items} allTags={topTags} placeholder="Cari template…" />
      )}
    </div>
  );
}
