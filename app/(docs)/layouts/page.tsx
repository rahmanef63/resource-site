import { LayoutGrid } from "lucide-react";
import { layouts } from "@/lib/content/layouts";
import { CatalogCard } from "@/components/site/catalog/catalog-card";
import { type CatalogSearchItem } from "@/components/site/catalog/catalog-search";
import { CatalogHero } from "@/components/site/catalog/catalog-hero";
import { CatalogTabs } from "@/components/site/catalog/catalog-tabs";
import { IframeThumbnail } from "@/components/site/catalog/iframe-thumbnail";
import { MockThumbnail } from "@/components/site/catalog/mock-thumbnail";
import { UseWideLayout } from "@/components/site/use-wide-layout";

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
            <IframeThumbnail
              src={l.previewPath}
              liveTitle={l.title}
              liveDefaultView={l.defaultView}
              liveDefaultZoom={l.defaultZoom}
            />
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
      <UseWideLayout />
      <CatalogHero
        pill="Catalog"
        icon={LayoutGrid}
        title="Layouts"
        subtitle={`${sources.length} cookbook layouts — marketing, dashboard, and CMS shapes. For full apps, see website templates.`}
        primaryCta={{ label: "Website templates", href: "/templates" }}
        secondaryCta={{ label: "Slices", href: "/slices" }}
      />

      <CatalogTabs
        items={items}
        allTags={topTags}
        placeholder="Cari layout…"
        groupOrder={GROUP_ORDER}
        groupLabel={CATEGORY_LABEL}
      />
    </div>
  );
}
