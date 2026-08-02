import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, Link2, Sparkles, Layers, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShowcaseCard } from "@/components/site/catalog/showcase-card";
import { cn } from "@/lib/utils";

export type RelatedItem = {
  slug: string;
  title: string;
  description?: string;
  category?: string;
  /** Optional small badge label (e.g. peer range "^0.1", or "native"). */
  badge?: string;
  /** Optional rationale text rendered below the description. */
  reason?: string;
};

export type RelatedGroup = {
  id: string;
  label: string;
  hint?: string;
  icon: LucideIcon;
  items: RelatedItem[];
};

/**
 * "Related features" section. Renders up to 3 groups (peers / enhances /
 * siblings). Each item is a compact card with link → /slices/<slug>.
 *
 * Drops groups that have no items, so callers can pass the full set
 * without worrying about empties.
 */
export function RelatedFeatures({ groups }: { groups: RelatedGroup[] }) {
  const visible = groups.filter((g) => g.items.length > 0);
  if (visible.length === 0) return null;
  return (
    <ShowcaseCard icon={Link2} label="Related features" variant="static">
      <div className="space-y-6">
        {visible.map((g) => (
          <RelatedGroupBlock key={g.id} group={g} />
        ))}
      </div>
    </ShowcaseCard>
  );
}

function RelatedGroupBlock({ group }: { group: RelatedGroup }) {
  const Icon = group.icon;
  return (
    <section>
      <header className="mb-3 flex items-baseline justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon className="size-3.5 text-muted-foreground" />
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {group.label}
          </h3>
          <Badge variant="secondary" className="h-4 px-1.5 text-[9px] tabular-nums">
            {group.items.length}
          </Badge>
        </div>
        {group.hint && <p className="text-[10px] text-muted-foreground/80">{group.hint}</p>}
      </header>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {group.items.map((it) => (
          <RelatedItemCard key={it.slug} item={it} />
        ))}
      </div>
    </section>
  );
}

function RelatedItemCard({ item }: { item: RelatedItem }) {
  return (
    <Link
      href={`/slices/${item.slug}`}
      className={cn(
        "group/r block",
        "rounded-lg border border-border/60 bg-card transition",
        "hover:border-primary/40 hover:bg-accent hover:shadow-sm",
      )}
    >
      <Card className="border-0 bg-transparent p-3 shadow-none">
        <header className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold leading-snug">{item.title}</p>
            <p className="font-mono text-[10px] text-muted-foreground">{item.slug}</p>
          </div>
          <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground transition group-hover/r:text-foreground" />
        </header>
        {item.description && (
          <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
        )}
        {item.reason && (
          <p className="mt-1.5 line-clamp-2 text-[10px] italic text-muted-foreground/80">
            {item.reason}
          </p>
        )}
        <footer className="mt-2 flex flex-wrap items-center gap-1">
          {item.badge && (
            <Badge variant="outline" className="h-4 px-1.5 font-mono text-[9px]">
              {item.badge}
            </Badge>
          )}
          {item.category && (
            <Badge variant="secondary" className="h-4 px-1.5 text-[9px] capitalize">
              {item.category}
            </Badge>
          )}
        </footer>
      </Card>
    </Link>
  );
}

/** Pre-built lucide icons for the three canonical groups. Export so
 *  slice detail pages can compose `<RelatedFeatures>` directly. */
export const RELATED_ICONS = {
  peers: Link2,
  enhances: Sparkles,
  siblings: Layers,
} satisfies Record<string, LucideIcon>;
