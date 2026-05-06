"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

export type DataBindingFeatureId = "database" | "docs";

export interface DataBinding {
  featureId: DataBindingFeatureId;
  /** For "database": the dbTables ID string. For "docs": "all". */
  resourceId: string;
}

export interface DataBindingResult {
  records: Record<string, unknown>[];
  meta: {
    featureId: string;
    resourceId: string;
    count: number;
  };
  isLoading: boolean;
}

/**
 * Fetch live data for a Studio block widget from the database or documents feature.
 * Returns `undefined` while loading, `null` when no binding is configured.
 */
export function useStudioDataBinding(
  workspaceId: Id<"workspaces"> | null | undefined,
  binding: DataBinding | null | undefined
): DataBindingResult | null {
  const result = useQuery(
    api.features.studio.queries.getStudioDataBinding,
    workspaceId && binding
      ? { workspaceId, featureId: binding.featureId, resourceId: binding.resourceId }
      : "skip"
  );

  if (!workspaceId || !binding) return null;

  return {
    records: result?.records ?? [],
    meta: result?.meta ?? { featureId: binding.featureId, resourceId: binding.resourceId, count: 0 },
    isLoading: result === undefined,
  };
}

/** List of block widget type names that support data binding. */
export const DATA_BINDABLE_BLOCK_TYPES = new Set([
  "tableBlock",
  "kanbanBlock",
  "listBlock",
  "statsBlock",
  "formBlock",
  "filterBlock",
]);
