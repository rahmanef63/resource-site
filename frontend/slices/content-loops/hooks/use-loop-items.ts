"use client";
// useLoopItems — single-page fetch sugar over useLoopPagination (pagination
// 'none'). Use when you just want the items and don't need load-more.

import type { LoopEntitySource } from "../lib/types";
import { useLoopPagination, type LoopPaginationState } from "./use-loop-pagination";

export interface UseLoopItemsOptions {
  source: LoopEntitySource;
  filters?: Record<string, unknown>;
  orderBy?: string;
  direction?: "asc" | "desc";
  limit?: number;
}

export function useLoopItems(
  options: UseLoopItemsOptions,
): Pick<LoopPaginationState, "items" | "totalItems" | "loading" | "error"> {
  const { items, totalItems, loading, error } = useLoopPagination({
    ...options,
    pagination: "none",
  });
  return { items, totalItems, loading, error };
}
