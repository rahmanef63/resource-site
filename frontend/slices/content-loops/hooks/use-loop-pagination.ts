"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import {
  createLoopPaginationController,
  type LoopPaginationOptions,
  type LoopPaginationSnapshot,
} from "../lib/pagination";

export interface UseLoopPaginationOptions extends LoopPaginationOptions {}

export interface LoopPaginationState extends LoopPaginationSnapshot {
  loadMore: () => void;
}

/** React adapter over the canonical framework-neutral pagination controller. */
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
  const filtersKey = JSON.stringify(filters ?? {});

  const controller = useMemo(
    () =>
      createLoopPaginationController({
        source,
        filters: JSON.parse(filtersKey) as Record<string, unknown>,
        orderBy,
        direction,
        pagination,
        limit,
        pageSize,
      }),
    [source, filtersKey, orderBy, direction, pagination, limit, pageSize],
  );

  useEffect(() => {
    void controller.refresh();
    return () => controller.dispose();
  }, [controller]);

  const snapshot = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot,
  );

  return {
    ...snapshot,
    loadMore: () => void controller.loadMore(),
  };
}
