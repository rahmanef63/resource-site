"use client";
// useLoopPagination — resolves items from a LoopEntitySource with optional
// infinite "load more". Replaces Instatic's publish-time prefetch + the
// /_instatic/loop runtime endpoint with a plain client fetch over the injected
// source. 'none' = one page of `limit`; 'infinite' = accumulate `pageSize`
// chunks behind loadMore().

import { useCallback, useEffect, useRef, useState } from "react";
import type { LoopEntitySource, LoopItem } from "../lib/types";

export interface UseLoopPaginationOptions {
  source: LoopEntitySource;
  filters?: Record<string, unknown>;
  orderBy?: string;
  direction?: "asc" | "desc";
  pagination?: "none" | "infinite";
  /** Page cap for 'none'. */
  limit?: number;
  /** Chunk size for 'infinite'. */
  pageSize?: number;
}

export interface LoopPaginationState {
  items: LoopItem[];
  totalItems: number;
  hasMore: boolean;
  loading: boolean;
  error: Error | null;
  loadMore: () => void;
}

export function useLoopPagination(options: UseLoopPaginationOptions): LoopPaginationState {
  const {
    source,
    filters,
    orderBy,
    direction = "asc",
    pagination = "none",
    limit = 12,
    pageSize = 6,
  } = options;

  const [items, setItems] = useState<LoopItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const offsetRef = useRef(0);

  // Stabilize the filters object by value so the fetch identity only changes
  // when the actual filter values change (not on every parent render).
  const filtersKey = JSON.stringify(filters ?? {});

  const fetchPage = useCallback(
    async (offset: number, replace: boolean) => {
      setLoading(true);
      setError(null);
      try {
        const take = pagination === "infinite" ? pageSize : limit;
        const result = await source.fetch({
          filters: JSON.parse(filtersKey) as Record<string, unknown>,
          orderBy,
          direction,
          limit: take,
          offset,
        });
        setTotalItems(result.totalItems);
        setItems((prev) => (replace ? result.items : [...prev, ...result.items]));
        offsetRef.current = offset + result.items.length;
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    },
    [source, filtersKey, orderBy, direction, pagination, limit, pageSize],
  );

  useEffect(() => {
    offsetRef.current = 0;
    void fetchPage(0, true);
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (loading) return;
    void fetchPage(offsetRef.current, false);
  }, [loading, fetchPage]);

  const hasMore = items.length < totalItems;
  return { items, totalItems, hasMore, loading, error, loadMore };
}
