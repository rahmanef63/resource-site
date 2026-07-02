/**
 * Row Versioning Hook
 * Manages row version history and restore functionality
 */
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useCallback } from "react";
import { toast } from "@/hooks/use-toast";

export interface RowVersion {
  _id: Id<"dbRowVersions">;
  rowId: Id<"dbRows">;
  tableId: Id<"dbTables">;
  version: number;
  data: Record<string, unknown>;
  changedFields: string[];
  changedById: Id<"users">;
  changeType: "create" | "update" | "restore";
  note?: string;
  createdAt: number;
  changedByName?: string;
  changedByEmail?: string;
}

export interface RowHistoryEntry {
  _id: Id<"dbRowHistory">;
  rowId: Id<"dbRows">;
  fieldId: string;
  fieldName: string;
  previousValue?: unknown;
  newValue?: unknown;
  changedById: Id<"users">;
  changedAt: number;
  changedByName?: string;
}

export function useRowVersions(rowId: Id<"dbRows"> | undefined, limit = 50) {
  const versions = useQuery(
    api.features.database.rowVersioning.listVersions,
    rowId ? { rowId, limit } : "skip"
  );

  const restoreMutation = useMutation(
    api.features.database.rowVersioning.restoreVersion
  );

  const restoreToVersion = useCallback(
    async (version: number, note?: string) => {
      if (!rowId) return;

      try {
        const result = await restoreMutation({ rowId, version, note });
        toast({
          title: "Version restored",
          description: `Restored to version ${version}`,
        });
        return result;
      } catch (error) {
        toast({
          title: "Failed to restore version",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        });
        throw error;
      }
    },
    [restoreMutation, rowId]
  );

  return {
    versions: versions ?? [],
    isLoading: rowId !== undefined && versions === undefined,
    restoreToVersion,
  };
}

/**
 * Compare two versions of a row
 */
export function useVersionDiff(
  rowId: Id<"dbRows"> | undefined,
  versionA: number,
  versionB: number
) {
  const diff = useQuery(
    api.features.database.rowVersioning.compareVersions,
    rowId ? { rowId, versionA, versionB } : "skip"
  );

  return {
    diff: diff?.diff ?? [],
    allFields: diff?.allFields ?? [],
    versionA: diff?.versionA,
    versionB: diff?.versionB,
    isLoading: rowId !== undefined && diff === undefined,
  };
}

/**
 * Row field-level history
 */
export function useRowHistory(
  rowId: Id<"dbRows"> | undefined,
  options?: { limit?: number; fieldId?: string }
) {
  const history = useQuery(
    api.features.database.rowVersioning.getRowHistory,
    rowId
      ? { rowId, limit: options?.limit, fieldId: options?.fieldId }
      : "skip"
  );

  return {
    history: history ?? [],
    isLoading: rowId !== undefined && history === undefined,
  };
}

/**
 * Table-level history
 */
export function useTableHistory(
  tableId: Id<"dbTables"> | undefined,
  options?: { limit?: number; since?: number }
) {
  const history = useQuery(
    api.features.database.rowVersioning.getTableHistory,
    tableId
      ? { tableId, limit: options?.limit, since: options?.since }
      : "skip"
  );

  return {
    history: history ?? [],
    isLoading: tableId !== undefined && history === undefined,
  };
}
