import Link from "next/link";
import {
  AppWindow,
  Bot,
  CalendarClock,
  FileText,
  Layers,
  Plug,
  Server,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { slices as allSlices } from "@/lib/content/slices";
import { isHidden } from "@/lib/content/hidden-slugs";
import { SLICE_CATEGORY_LABEL, SLICE_CATEGORY_ORDER } from "@/lib/content/taxonomy";
import { Badge } from "@/components/ui/badge";
import { CatalogCard } from "@/components/site/catalog/catalog-card";
import { RecentlyUpdatedBadge } from "@/components/site/recently-updated-badge";
import { type CatalogSearchItem } from "@/components/site/catalog/catalog-search";
import { CatalogHero } from "@/components/site/catalog/catalog-hero";
import { CatalogTabs } from "@/components/site/catalog/catalog-tabs";
import { IframeThumbnail } from "@/components/site/catalog/iframe-thumbnail";
import { MockThumbnail } from "@/components/site/catalog/mock-thumbnail";
import { UseWideLayout } from "@/components/site/use-wide-layout";
import { getLatestUpdate } from "@/lib/content/changelog-helpers";
import { FAMILY_LABEL, familyOfSlug } from "./family-map";

export const metadata = {
  title: "Slices — portable feature units",
  description: "Tier-3 portable vertical slices: lift one folder, drop it into any project.",
};

const CATEGORY_ICON: Record<string, LucideIcon> = {
  auth: ShieldCheck,
  integrations: Plug,
  ai: Bot,
  data: CalendarClock,
  content: FileText,
  ui: Layers,
  os: AppWindow,
  infra: Server,
};

function stripVersion(npmSpec: string): string {
  const at = npmSpec.lastIndexOf("@");
  return at > 0 ? npmSpec.slice(0, at) : npmSpec;
}

export default function SlicesPage() {
  const slices = allSlices.filter((s) => !isHidden(s.slug));

  const items: CatalogSearchItem[] = slices.map((s) => {
    const Icon = CATEGORY_ICON[s.category] ?? Layers;
    const accents = s.providers?.length
      ? s.providers
      : (s.npm ?? []).slice(0, 3).map((p) => stripVersion(p));
    return {
      key: s.slug,
      search: `${s.title} ${s.tagline ?? s.description} ${(s.tags ?? []).join(" ")}`.toLowerCase(),
      tags: s.tags,
      group: s.category,
      family: familyOfSlug(s.slug),
      sort: {
        title: s.title,
        updatedAt: getLatestUpdate(s.slug, "slice")?.date ?? 0,
      },
      node: (
        <CatalogCard
          href={`/slices/${s.slug}`}
          title={s.title}
          description={s.tagline ?? s.description}
          tags={s.tags}
          cornerBadge={<RecentlyUpdatedBadge slug={s.slug} kind="slice" variant="card" />}
          meta={
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[9px]">v{s.version}</Badge>
              {s.peers && s.peers.length > 0 && (
                <span className="text-[10px]">
                  peers: {s.peers.map((p) => p.slug).join(", ")}
                </span>
              )}
            </div>
          }
          thumbnail={
            s.previewPath ? (
              <IframeThumbnail
                src={s.previewPath}
                liveTitle={s.title}
                liveDefaultView={s.defaultView}
                liveDefaultZoom={s.defaultZoom}
              />
            ) : (
              <MockThumbnail
                kind="slice"
                category={s.category as string}
                icon={Icon}
                accents={accents}
              />
            )
          }
        />
      ),
    };
  });

  return (
    <div className="space-y-8">
      <UseWideLayout />
      <CatalogHero
        pill="Catalog"
        icon={Layers}
        title="Slices"
        subtitle={
          <>
            Tier-3 portable vertical slices. Each slice ships a frontend half +
            a Convex backend half. Lift one folder, drop it into any compatible
            project. See{" "}
            <Link href="/docs" className="underline hover:text-foreground">
              slice architecture
            </Link>{" "}
            for the full plan.
          </>
        }
        primaryCta={{ label: "Bundle builder", href: "/build" }}
        secondaryCta={{ label: "Grand Tour", href: "/tour" }}
        commands={[
          "npx rahman-resources add <slug>",
          "npx rahman-resources lift rahman:<slug>",
        ]}
      />

      <CatalogTabs
        items={items}
        allTags={null}
        placeholder="Cari slice…"
        groupOrder={[...SLICE_CATEGORY_ORDER]}
        groupLabel={SLICE_CATEGORY_LABEL}
        familyLabel={FAMILY_LABEL}
      />
    </div>
  );
}
