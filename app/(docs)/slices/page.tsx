import Link from "next/link";
import {
  Bot,
  CalendarClock,
  CreditCard,
  Database,
  FileText,
  Layers,
  Mail,
  Radio,
  Search as SearchIcon,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { slices as allSlices } from "@/lib/content/slices";
import { isHidden } from "@/lib/content/hidden-slugs";
import { Badge } from "@/components/ui/badge";
import { CatalogCard } from "@/components/site/catalog/catalog-card";
import { RecentlyUpdatedBadge } from "@/components/site/recently-updated-badge";
import { type CatalogSearchItem } from "@/components/site/catalog/catalog-search";
import { CatalogHero } from "@/components/site/catalog/catalog-hero";
import { CatalogTabs } from "@/components/site/catalog/catalog-tabs";
import { IframeThumbnail } from "@/components/site/catalog/iframe-thumbnail";
import { MockThumbnail } from "@/components/site/catalog/mock-thumbnail";
import { UseWideLayout } from "@/components/site/use-wide-layout";
import { FAMILY_LABEL, familyOfSlug } from "./family-map";

export const metadata = {
  title: "Slices — portable feature units",
  description: "Tier-3 portable vertical slices: lift one folder, drop it into any project.",
};

const CATEGORY_ORDER = [
  "auth", "payment", "ai", "email", "data", "search", "realtime", "content", "storage", "ui", "infra",
];

const CATEGORY_LABEL: Record<string, string> = {
  auth: "Auth",
  payment: "Payment",
  ai: "AI",
  email: "Email",
  data: "Data",
  search: "Search",
  realtime: "Realtime",
  content: "Content",
  storage: "Storage",
  ui: "UI",
  infra: "Infra",
};

const CATEGORY_ICON: Record<string, LucideIcon> = {
  auth: ShieldCheck,
  payment: CreditCard,
  ai: Bot,
  email: Mail,
  data: CalendarClock,
  search: SearchIcon,
  realtime: Radio,
  content: FileText,
  storage: Database,
};

function stripVersion(npmSpec: string): string {
  const at = npmSpec.lastIndexOf("@");
  return at > 0 ? npmSpec.slice(0, at) : npmSpec;
}

export default function SlicesPage() {
  const slices = allSlices.filter((s) => !isHidden(s.slug));
  const tagFreq = new Map<string, number>();
  for (const s of slices) for (const t of s.tags ?? []) tagFreq.set(t, (tagFreq.get(t) ?? 0) + 1);
  const topTags = [...tagFreq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 14).map(([t]) => t);

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
        secondaryCta={{ label: "Templates", href: "/templates" }}
        commands={[
          "npx rahman-resources add <slug>",
          "npx rahman-resources lift rahman:<slug>",
        ]}
      />

      <CatalogTabs
        items={items}
        allTags={topTags}
        placeholder="Cari slice…"
        groupOrder={CATEGORY_ORDER}
        groupLabel={CATEGORY_LABEL}
        familyLabel={FAMILY_LABEL}
      />
    </div>
  );
}
