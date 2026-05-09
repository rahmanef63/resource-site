import { Globe } from "lucide-react";
import { layouts } from "@/lib/content/layouts";
import { CatalogCard } from "@/components/site/catalog/catalog-card";
import { CatalogSearch, type CatalogSearchItem } from "@/components/site/catalog/catalog-search";
import { IframeThumbnail } from "@/components/site/catalog/iframe-thumbnail";
import { MockThumbnail } from "@/components/site/catalog/mock-thumbnail";

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
          l.previewPath ? (
            <IframeThumbnail src={l.previewPath} />
          ) : (
            <MockThumbnail kind="dashboard" category="dashboard" label={l.slug} />
          )
        }
      />
    ),
  }));

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Catalog</p>
        <div className="mt-2 flex items-center gap-2">
          <Globe className="size-6 text-muted-foreground" />
          <h1 className="text-3xl font-bold tracking-tight">Website templates</h1>
        </div>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          {sources.length} full-app templates with public + admin surface, live cross-iframe sync,
          and slice structure.
        </p>
      </div>

      {sources.length === 0 ? (
        <div className="rounded-md border border-dashed bg-muted/10 p-10 text-center">
          <p className="text-sm text-muted-foreground">No website templates yet.</p>
        </div>
      ) : (
        <CatalogSearch items={items} allTags={topTags} placeholder="Cari template…" />
      )}
    </div>
  );
}
