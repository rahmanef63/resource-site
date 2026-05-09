import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { layouts } from "@/lib/content/layouts";
import { CatalogCard } from "@/components/site/catalog/catalog-card";
import { CatalogSearch, type CatalogSearchItem } from "@/components/site/catalog/catalog-search";
import { IframeThumbnail } from "@/components/site/catalog/iframe-thumbnail";
import { MockThumbnail } from "@/components/site/catalog/mock-thumbnail";

const CATEGORY_LABEL: Record<string, string> = {
  marketing: "Marketing",
  dashboard: "Dashboard",
  cms: "CMS",
};

const GROUP_ORDER = ["marketing", "dashboard", "cms"];

export const metadata = { title: "Layouts" };

export default function LayoutsPage() {
  const sources = layouts.filter((l) => l.category !== "website-template");

  const tagFreq = new Map<string, number>();
  for (const t of sources) for (const tag of t.tags ?? []) tagFreq.set(tag, (tagFreq.get(tag) ?? 0) + 1);
  const topTags = [...tagFreq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 14).map(([t]) => t);

  const items: CatalogSearchItem[] = sources.map((l) => ({
    key: l.slug,
    search: `${l.title} ${l.description} ${(l.tags ?? []).join(" ")}`.toLowerCase(),
    tags: l.tags,
    group: l.category,
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
            <MockThumbnail
              kind={
                l.category === "marketing"
                  ? "marketing"
                  : l.category === "cms"
                    ? "cms"
                    : "dashboard"
              }
              category={l.category as string}
              label={l.slug}
            />
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
          <LayoutGrid className="size-6 text-muted-foreground" />
          <h1 className="text-3xl font-bold tracking-tight">Layouts</h1>
        </div>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          {sources.length} cookbook layouts — marketing, dashboard, and CMS shapes. For full apps,
          see{" "}
          <Link href="/templates" className="underline hover:text-foreground">
            website templates
          </Link>
          .
        </p>
      </div>

      <CatalogSearch
        items={items}
        allTags={topTags}
        placeholder="Cari layout…"
        groupOrder={GROUP_ORDER}
        groupLabel={CATEGORY_LABEL}
      />
    </div>
  );
}
