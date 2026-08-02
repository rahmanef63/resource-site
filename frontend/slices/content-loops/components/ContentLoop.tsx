"use client";
// <ContentLoop> — the repeater. Resolves items from a source (passed inline or
// by registered id), then renders one variant per item, round-robining items
// across variants (item i → variants[i % n]). This is Instatic's renderLoop
// round-robin minus the HTML-string emit + entryStack plumbing: variants are
// React components, bindings are props.

import { createElement, type ElementType, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { loopSourceRegistry } from "../lib/registry";
import type { LoopEntitySource, LoopItem } from "../lib/types";
import { useLoopPagination } from "../hooks/use-loop-pagination";

export interface LoopVariantProps {
  item: LoopItem;
  index: number;
}

/** A variant is a component rendered once per matched item. */
export type LoopVariant = (props: LoopVariantProps) => ReactNode;

export interface ContentLoopProps {
  /** Pass a source directly… */
  source?: LoopEntitySource;
  /** …or look one up in the registry by namespaced id. */
  sourceId?: string;
  filters?: Record<string, unknown>;
  orderBy?: string;
  direction?: "asc" | "desc";
  /** 'none' renders up to `limit`; 'infinite' adds a Load more button. */
  pagination?: "none" | "infinite";
  limit?: number;
  pageSize?: number;
  /** One component per variant; items round-robin across them. */
  variants: LoopVariant[];
  /** Wrapper element + class. Default <div>. Use it for the grid/list layout. */
  as?: ElementType;
  className?: string;
  loadMoreLabel?: string;
  /** Shown while the first page loads. */
  loading?: ReactNode;
  /** Shown when the source returns nothing. */
  empty?: ReactNode;
}

export function ContentLoop({
  source,
  sourceId,
  filters,
  orderBy,
  direction = "asc",
  pagination = "none",
  limit = 12,
  pageSize = 6,
  variants,
  as = "div",
  className,
  loadMoreLabel = "Load more",
  loading,
  empty,
}: ContentLoopProps) {
  if (variants.length === 0) {
    throw new Error("[content-loops] <ContentLoop> needs at least one variant.");
  }
  const resolved = source ?? (sourceId ? loopSourceRegistry.getOrThrow(sourceId) : null);
  if (!resolved) {
    throw new Error("[content-loops] <ContentLoop> needs a `source` or a registered `sourceId`.");
  }

  const { items, hasMore, loading: isLoading, error, loadMore } = useLoopPagination({
    source: resolved,
    filters,
    orderBy,
    direction,
    pagination,
    limit,
    pageSize,
  });

  if (error) {
    return (
      <div role="alert" className="text-sm text-destructive">
        {error.message}
      </div>
    );
  }

  if (isLoading && items.length === 0) {
    return (
      <>{loading ?? <div role="status" className="text-sm text-muted-foreground">Loading…</div>}</>
    );
  }

  if (items.length === 0) {
    return <>{empty ?? <div className="text-sm text-muted-foreground">No items.</div>}</>;
  }

  const children = items.map((item, index) => {
    const Variant = variants[index % variants.length];
    return <Variant key={item.id} item={item} index={index} />;
  });

  return (
    <>
      {createElement(as, { className }, children)}
      {pagination === "infinite" && hasMore && (
        <div className="mt-6 flex justify-center">
          <Button variant="outline" onClick={loadMore} disabled={isLoading}>
            {isLoading ? "Loading…" : loadMoreLabel}
          </Button>
        </div>
      )}
    </>
  );
}
