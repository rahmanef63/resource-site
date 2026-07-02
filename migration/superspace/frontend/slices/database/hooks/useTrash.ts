/**
 * Soft Delete / Trash Hook
 * Manages deleted rows and restore functionality
 */
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useCallback } from "react";
import { toast } from "@/hooks/use-toast";

export interface DeletedRow {
  _id: Id<"dbDeletedRows">;
  originalRowId: string;
  tableId: Id<"dbTables">;
  workspaceId: Id<"workspaces">;
  data: Record<string, unknown>;
  position: number;
  deletedById: Id<"users">;
  deletedAt: number;
  expiresAt: number;
  restoredAt?: number;
  restoredById?: Id<"users">;
  tableName?: string;
  deletedByName?: string;
  daysUntilPurge?: number;
}

export function useTrash(
  workspaceId: Id<"workspaces">,
  tableId?: Id<"dbTables">
) {
  const deletedRows = useQuery(
    api.features.database.softDelete.listDeletedRows,
    { workspaceId, tableId, limit: 100 }
  );

  const softDeleteMutation = useMutation(
    api.features.database.softDelete.softDeleteRow
  );
  const softDeleteBulkMutation = useMutation(
    api.features.database.softDelete.softDeleteRows
  );
  const restoreMutation = useMutation(
    api.features.database.softDelete.restoreRow
  );
  const restoreBulkMutation = useMutation(
    api.features.database.softDelete.restoreRows
  );
  const hardDeleteMutation = useMutation(
    api.features.database.softDelete.hardDeleteRow
  );
  const emptyTrashMutation = useMutation(
    api.features.database.softDelete.emptyTrash
  );

  const softDelete = useCallback(
    async (rowId: Id<"dbRows">, retentionDays?: number) => {
      try {
        const result = await softDeleteMutation({ rowId, retentionDays });
        toast({
          title: "Moved to trash",
          description: `Row moved to trash. Will be purged in ${retentionDays ?? 30} days.`,
        });
        return result;
      } catch (error) {
        toast({
          title: "Failed to delete",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        });
        throw error;
      }
    },
    [softDeleteMutation]
  );

  const softDeleteBulk = useCallback(
    async (rowIds: Id<"dbRows">[], retentionDays?: number) => {
      try {
        const result = await softDeleteBulkMutation({ rowIds, retentionDays });
        toast({
          title: "Moved to trash",
          description: `${result.deleted} row(s) moved to trash.`,
        });
        return result;
      } catch (error) {
        toast({
          title: "Failed to delete",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        });
        throw error;
      }
    },
    [softDeleteBulkMutation]
  );

  const restore = useCallback(
    async (deletedRowId: Id<"dbDeletedRows">) => {
      try {
        const result = await restoreMutation({ deletedRowId });
        toast({
          title: "Row restored",
          description: "Row has been restored successfully.",
        });
        return result;
      } catch (error) {
        toast({
          title: "Failed to restore",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        });
        throw error;
      }
    },
    [restoreMutation]
  );

  const restoreBulk = useCallback(
    async (deletedRowIds: Id<"dbDeletedRows">[]) => {
      try {
        const result = await restoreBulkMutation({ deletedRowIds });
        toast({
          title: "Rows restored",
          description: `${result.restored} row(s) restored successfully.`,
        });
        return result;
      } catch (error) {
        toast({
          title: "Failed to restore",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        });
        throw error;
      }
    },
    [restoreBulkMutation]
  );

  const hardDelete = useCallback(
    async (deletedRowId: Id<"dbDeletedRows">) => {
      try {
        await hardDeleteMutation({ deletedRowId });
        toast({
          title: "Permanently deleted",
          description: "Row has been permanently deleted.",
        });
      } catch (error) {
        toast({
          title: "Failed to delete",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        });
        throw error;
      }
    },
    [hardDeleteMutation]
  );

  const emptyTrash = useCallback(
    async (deleteAll = false) => {
      try {
        const result = await emptyTrashMutation({
          workspaceId,
          tableId,
          deleteAll,
        });
        toast({
          title: "Trash emptied",
          description: `${result.deleted} item(s) permanently deleted.`,
        });
        return result;
      } catch (error) {
        toast({
          title: "Failed to empty trash",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        });
        throw error;
      }
    },
    [emptyTrashMutation, workspaceId, tableId]
  );

  return {
    deletedRows: deletedRows ?? [],
    isLoading: deletedRows === undefined,
    trashCount: deletedRows?.length ?? 0,
    softDelete,
    softDeleteBulk,
    restore,
    restoreBulk,
    hardDelete,
    emptyTrash,
  };
}
