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
import { slices } from "@/lib/content/slices";
import { Badge } from "@/components/ui/badge";
import { CatalogCard } from "@/components/site/catalog/catalog-card";
import { CatalogSearch, type CatalogSearchItem } from "@/components/site/catalog/catalog-search";
import { MockThumbnail } from "@/components/site/catalog/mock-thumbnail";

export const metadata = {
  title: "Slices — portable feature units",
  description: "Tier-3 portable vertical slices: lift one folder, drop it into any project.",
};

const CATEGORY_ORDER = [
  "auth", "payment", "ai", "email", "data", "search", "realtime", "content", "storage", "ui", "infra",
];

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
      search: `${s.title} ${s.description} ${(s.tags ?? []).join(" ")}`.toLowerCase(),
      tags: s.tags,
      group: s.category,
      node: (
        <CatalogCard
          href={`/slices/${s.slug}`}
          title={s.title}
          description={s.description}
          tags={s.tags}
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
            <MockThumbnail
              kind="slice"
              category={s.category as string}
              icon={Icon}
              accents={accents}
            />
          }
        />
      ),
    };
  });

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Catalog</p>
        <div className="mt-2 flex items-center gap-2">
          <Layers className="size-6 text-muted-foreground" />
          <h1 className="text-3xl font-bold tracking-tight">Feature slices</h1>
        </div>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Tier-3 portable vertical slices. Each slice ships a frontend half (
          <code className="rounded bg-muted px-1 py-0.5 text-xs">frontend/slices/&lt;slug&gt;/</code>) +
          a Convex backend half (
          <code className="rounded bg-muted px-1 py-0.5 text-xs">convex/features/&lt;slug&gt;/</code>).
          Lift one folder, drop it into any compatible project. See{" "}
          <Link href="/docs" className="underline">slice architecture</Link> for the full plan.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <code className="rounded bg-muted px-2 py-1 text-xs">npx rahman-resources add &lt;slug&gt;</code>
          <code className="rounded bg-muted px-2 py-1 text-xs">npx rahman-resources lift rahman:&lt;slug&gt;</code>
        </div>
      </div>

      <CatalogSearch
        items={items}
        allTags={topTags}
        placeholder="Cari slice…"
        groupOrder={CATEGORY_ORDER}
      />
    </div>
  );
}
