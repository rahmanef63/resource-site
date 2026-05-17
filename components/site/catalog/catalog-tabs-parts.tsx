"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CatalogSearchItem } from "./catalog-search";

export function SearchRow({
  q,
  setQ,
  placeholder,
  filteredLen,
  totalLen,
}: {
  q: string;
  setQ: (v: string) => void;
  placeholder: string;
  filteredLen: number;
  totalLen: number;
}) {
  return (
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
        {filteredLen === totalLen
          ? `${totalLen} item${totalLen > 1 ? "s" : ""}`
          : `${filteredLen} of ${totalLen}`}
      </div>
    </div>
  );
}

export function TagRow({
  allTags,
  activeTags,
  toggleTag,
  clearAll,
}: {
  allTags: string[];
  activeTags: Set<string>;
  toggleTag: (t: string) => void;
  clearAll: () => void;
}) {
  return (
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
          onClick={clearAll}
          className="text-[10px] text-muted-foreground hover:text-foreground"
        >
          clear
        </button>
      )}
    </div>
  );
}

export function CatalogGrid({
  items,
  gridClassName,
}: {
  items: CatalogSearchItem[];
  gridClassName: string;
}) {
  return (
    <div className={gridClassName}>
      {items.map((it) => (
        <React.Fragment key={it.key}>{it.node}</React.Fragment>
      ))}
    </div>
  );
}
