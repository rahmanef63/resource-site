"use client";

import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { CatalogSearchItem } from "./catalog-search";
import {
  CatalogGrid, CatalogGroupedGrid,
  SearchRow, TagRow,
} from "./catalog-tabs-parts";
import { SortSelect, sortItems, type SortMode } from "./catalog-sort";

/**
 * Tab-first catalog navigation. Mirrors shadcn/ui's /charts page nav:
 *
 *   [ All | Area | Bar | Line | Pie | ... ]   <- horizontal tabs (line variant)
 *
 * "All" preserves the prior stacked-by-group layout (so users still get the
 * at-a-glance overview); per-category tabs render a flat filtered grid.
 *
 * When `groupOrder` is absent or empty the component falls back to a single
 * flat grid with no tab bar — same UX as `<CatalogSearch>` without grouping.
 */
export function CatalogTabs({
  items,
  allTags,
  groupOrder,
  groupLabel,
  familyLabel,
  placeholder = "Search…",
  gridClassName = "grid gap-5 sm:grid-cols-2 lg:grid-cols-3",
}: {
  items: CatalogSearchItem[];
  /** Optional flat tag list to render as filter chips. Pass `null` to hide. */
  allTags: string[] | null;
  /** Order of group/category tabs. Empty/undefined → no tab bar. */
  groupOrder?: string[];
  groupLabel?: Record<string, string>;
  /** Optional labels for families baked into `item.family` by the server. */
  familyLabel?: Record<string, string>;
  placeholder?: string;
  gridClassName?: string;
}) {
  const [q, setQ] = React.useState("");
  const [activeTags, setActiveTags] = React.useState<Set<string>>(new Set());
  const [tab, setTab] = React.useState<string>("all");
  const [sortMode, setSortMode] = React.useState<SortMode>("featured");

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

  const hasSort = React.useMemo(() => items.some((it) => it.sort), [items]);
  const sorted = React.useMemo(() => sortItems(filtered, sortMode), [filtered, sortMode]);

  function toggleTag(t: string) {
    setActiveTags((s) => {
      const next = new Set(s);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  }

  const hasTabs = !!groupOrder && groupOrder.length > 0;
  const activeGroupOrder = hasTabs
    ? groupOrder!.filter((g) => filtered.some((it) => it.group === g))
    : [];

  const searchRow = (
    <SearchRow
      q={q}
      setQ={setQ}
      placeholder={placeholder}
      filteredLen={filtered.length}
      totalLen={items.length}
      trailing={hasSort ? <SortSelect value={sortMode} onChange={setSortMode} /> : undefined}
    />
  );

  const tagRow = allTags && allTags.length > 0 && (
    <TagRow
      allTags={allTags}
      activeTags={activeTags}
      toggleTag={toggleTag}
      clearAll={() => setActiveTags(new Set())}
    />
  );

  if (filtered.length === 0) {
    return (
      <div className="space-y-4">
        {searchRow}
        {tagRow}
        <div className="rounded-md border border-dashed bg-muted/10 p-10 text-center text-sm text-muted-foreground">
          No matches. Try a different search or clear filters.
        </div>
      </div>
    );
  }

  const hasFamilies = items.some((it) => it.family);
  // Family sub-grouping re-buckets the list; when the user picks an explicit
  // sort, render flat so the chosen order is honored end-to-end.
  const grouped = hasFamilies && sortMode === "featured";
  const renderGrid = (list: CatalogSearchItem[]) =>
    grouped ? (
      <CatalogGroupedGrid
        items={list}
        familyLabel={familyLabel}
        gridClassName={gridClassName}
      />
    ) : (
      <CatalogGrid items={list} gridClassName={gridClassName} />
    );

  if (!hasTabs) {
    return (
      <div className="space-y-4">
        {searchRow}
        {tagRow}
        {renderGrid(sorted)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {searchRow}
      {tagRow}
      <Tabs value={tab} onValueChange={setTab} className="gap-4">
        <div className="overflow-x-auto">
          <TabsList variant="line" className="h-9">
            <TabsTrigger value="all">
              All{" "}
              <span className="ml-1 text-[10px] text-muted-foreground">
                ({filtered.length})
              </span>
            </TabsTrigger>
            {activeGroupOrder.map((g) => {
              const count = filtered.filter((it) => it.group === g).length;
              return (
                <TabsTrigger key={g} value={g}>
                  {groupLabel?.[g] ?? g}
                  <span className="ml-1 text-[10px] text-muted-foreground">
                    ({count})
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        <TabsContent value="all" className="space-y-10">
          {activeGroupOrder.map((g) => {
            const inGroup = sorted.filter((it) => it.group === g);
            if (inGroup.length === 0) return null;
            return (
              <section key={g}>
                <h2 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {groupLabel?.[g] ?? g}
                  <span className="font-normal text-muted-foreground/60">
                    ({inGroup.length})
                  </span>
                </h2>
                {renderGrid(inGroup)}
              </section>
            );
          })}
        </TabsContent>

        {activeGroupOrder.map((g) => {
          const inGroup = sorted.filter((it) => it.group === g);
          return (
            <TabsContent key={g} value={g}>
              {renderGrid(inGroup)}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
