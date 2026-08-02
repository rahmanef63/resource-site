"use client";

// Catalog page search + tag filter. Items carry a pre-rendered `node` so
// server pages can build cards (RSC-safe) and pass them down — render-prop
// functions can't cross the server→client boundary.

import * as React from "react";
import { Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type CatalogSearchItem = {
  key: string;
  /** Pre-joined haystack: title + description + tags. Lowercased server-side or here. */
  search: string;
  tags?: string[];
  /** Group bucket (e.g. category) — used when groupOrder is provided. */
  group?: string;
  /** Optional family bucket — used for second-level sub-grouping inside each
   *  category. Resolved server-side (function props don't cross the
   *  server→client boundary). */
  family?: string | null;
  /** Optional server-precomputed sort keys. When any item carries `sort`,
   *  CatalogTabs renders a Sort control; absent → no sort UI (back-compat). */
  sort?: { title?: string; updatedAt?: number };
  node: React.ReactNode;
};

export function CatalogSearch({
  items,
  allTags,
  placeholder = "Search…",
  groupOrder,
  groupLabel,
  gridClassName = "grid gap-5 sm:grid-cols-2 lg:grid-cols-3",
}: {
  items: CatalogSearchItem[];
  /** Optional flat tag list to render as filter chips. Pass `null` to hide chips. */
  allTags: string[] | null;
  placeholder?: string;
  /** When set, render items grouped by `item.group` in this order. */
  groupOrder?: string[];
  groupLabel?: Record<string, string>;
  gridClassName?: string;
}) {
  const [q, setQ] = React.useState("");
  const [activeTags, setActiveTags] = React.useState<Set<string>>(new Set());

  const filtered = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter((it) => {
      if (needle && !it.search.includes(needle)) return false;
      if (activeTags.size > 0) {
        const tagsSet = new Set(it.tags ?? []);
        for (const t of activeTags) if (!tagsSet.has(t)) return false;
      }
      return true;
    });
  }, [items, q, activeTags]);

  function toggleTag(t: string) {
    setActiveTags((s) => {
      const next = new Set(s);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={placeholder}
            className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-9 text-sm outline-none transition placeholder:text-muted-foreground focus:border-foreground"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              aria-label="Clear"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-accent/40 hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          {filtered.length === items.length
            ? `${items.length} item${items.length > 1 ? "s" : ""}`
            : `${filtered.length} of ${items.length}`}
        </div>
      </div>

      {allTags && allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {allTags.map((t) => {
            const on = activeTags.has(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() => toggleTag(t)}
                aria-pressed={on}
                className={cn("transition", on ? "" : "opacity-70 hover:opacity-100")}
              >
                <Badge
                  variant={on ? "default" : "outline"}
                  className="cursor-pointer rounded-full text-[10px]"
                >
                  {t}
                  {on && <X className="ml-0.5 size-2.5" />}
                </Badge>
              </button>
            );
          })}
          {activeTags.size > 0 && (
            <button
              type="button"
              onClick={() => setActiveTags(new Set())}
              className="text-[10px] text-muted-foreground hover:text-foreground"
            >
              clear
            </button>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-md border border-dashed bg-muted/10 p-10 text-center text-sm text-muted-foreground">
          No matches. Try a different search or clear filters.
        </div>
      ) : groupOrder && groupOrder.length > 0 ? (
        <div className="space-y-10">
          {groupOrder.map((g) => {
            const inGroup = filtered.filter((it) => it.group === g);
            if (inGroup.length === 0) return null;
            return (
              <section key={g}>
                <h2 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {groupLabel?.[g] ?? g}
                  <span className="font-normal text-muted-foreground/60">({inGroup.length})</span>
                </h2>
                <div className={gridClassName}>
                  {inGroup.map((it) => (
                    <React.Fragment key={it.key}>{it.node}</React.Fragment>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className={gridClassName}>
          {filtered.map((it) => (
            <React.Fragment key={it.key}>{it.node}</React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
