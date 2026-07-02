/**
 * Relations Hook
 * Manages two-way and many-to-many relations
 */
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useCallback, useMemo } from "react";
import { toast } from "@/hooks/use-toast";

export type RelationType = "oneToOne" | "oneToMany" | "manyToOne" | "manyToMany";
export type DeleteBehavior = "setNull" | "cascade" | "restrict";

export interface RelationConfig {
  _id: Id<"dbRelationConfigs">;
  sourceFieldId: Id<"dbFields">;
  sourceTableId: Id<"dbTables">;
  targetTableId: Id<"dbTables">;
  relationType: RelationType;
  isTwoWay: boolean;
  inverseFieldId?: Id<"dbFields">;
  inverseFieldName?: string;
  junctionTableId?: Id<"dbTables">;
  onDelete: DeleteBehavior;
  createdAt: number;
  updatedAt: number;
}

export interface LinkedRow {
  junctionId: Id<"dbRelationJunctions">;
  linkedRowId: Id<"dbRows">;
  linkedRow: {
    _id: Id<"dbRows">;
    data: Record<string, unknown>;
    [key: string]: unknown;
  } | null;
  metadata?: Record<string, unknown>;
  direction: "outgoing" | "incoming";
  createdAt: number;
}

/**
 * Get relation config for a field
 */
export function useRelationConfig(fieldId: Id<"dbFields"> | undefined) {
  const config = useQuery(
    api.features.database.relations.getRelationConfig,
    fieldId ? { fieldId } : "skip"
  );

  return {
    config: config as RelationConfig | null,
    isLoading: fieldId !== undefined && config === undefined,
    isTwoWay: config?.isTwoWay ?? false,
    isManyToMany: config?.relationType === "manyToMany",
  };
}

/**
 * List all relation configs for a table
 */
export function useTableRelations(
  tableId: Id<"dbTables"> | undefined,
  direction?: "source" | "target"
) {
  const configs = useQuery(
    api.features.database.relations.listRelationConfigs,
    tableId ? { tableId, direction } : "skip"
  );

  // Separate by direction
  const { outgoing, incoming } = useMemo(() => {
    if (!configs) return { outgoing: [], incoming: [] };
    return {
      outgoing: configs.filter(
        (c) => c.sourceTableId === tableId
      ) as RelationConfig[],
      incoming: configs.filter(
        (c) => c.targetTableId === tableId
      ) as RelationConfig[],
    };
  }, [configs, tableId]);

  return {
    relations: (configs ?? []) as RelationConfig[],
    outgoing,
    incoming,
    isLoading: tableId !== undefined && configs === undefined,
  };
}

/**
 * Manage relation configuration
 */
export function useRelationManager() {
  const createMutation = useMutation(
    api.features.database.relations.createRelationConfig
  );
  const updateMutation = useMutation(
    api.features.database.relations.updateRelationConfig
  );
  const deleteMutation = useMutation(
    api.features.database.relations.deleteRelationConfig
  );

  const createRelation = useCallback(
    async (args: {
      sourceFieldId: Id<"dbFields">;
      sourceTableId: Id<"dbTables">;
      targetTableId: Id<"dbTables">;
      relationType: RelationType;
      isTwoWay: boolean;
      inverseFieldName?: string;
      onDelete: DeleteBehavior;
    }) => {
      try {
        const result = await createMutation(args);
        toast({
          title: "Relation created",
          description: args.isTwoWay
            ? "Two-way relation configured successfully"
            : "Relation configured successfully",
        });
        return result;
      } catch (error) {
        toast({
          title: "Failed to create relation",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        });
        throw error;
      }
    },
    [createMutation]
  );

  const updateRelation = useCallback(
    async (
      configId: Id<"dbRelationConfigs">,
      updates: {
        inverseFieldName?: string;
        onDelete?: DeleteBehavior;
      }
    ) => {
      try {
        await updateMutation({ configId, ...updates });
        toast({ title: "Relation updated" });
      } catch (error) {
        toast({
          title: "Failed to update relation",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        });
        throw error;
      }
    },
    [updateMutation]
  );

  const deleteRelation = useCallback(
    async (
      configId: Id<"dbRelationConfigs">,
      options?: {
        deleteInverseField?: boolean;
        deleteJunctionTable?: boolean;
      }
    ) => {
      try {
        await deleteMutation({ configId, ...options });
        toast({ title: "Relation deleted" });
      } catch (error) {
        toast({
          title: "Failed to delete relation",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        });
        throw error;
      }
    },
    [deleteMutation]
  );

  return {
    createRelation,
    updateRelation,
    deleteRelation,
  };
}

/**
 * Get linked rows for a specific row
 */
export function useLinkedRows(
  rowId: Id<"dbRows"> | undefined,
  options?: {
    relationConfigId?: Id<"dbRelationConfigs">;
    direction?: "source" | "target";
  }
) {
  const linkedRows = useQuery(
    api.features.database.relations.getLinkedRows,
    rowId
      ? {
          rowId,
          relationConfigId: options?.relationConfigId,
          direction: options?.direction,
        }
      : "skip"
  );

  return {
    linkedRows: (linkedRows ?? []) as LinkedRow[],
    isLoading: rowId !== undefined && linkedRows === undefined,
    count: linkedRows?.length ?? 0,
  };
}

/**
 * Link/unlink rows (for M2M relations)
 */
export function useRowLinker(relationConfigId: Id<"dbRelationConfigs">) {
  const linkMutation = useMutation(api.features.database.relations.linkRows);
  const unlinkMutation = useMutation(api.features.database.relations.unlinkRows);

  const linkRows = useCallback(
    async (
      sourceRowId: Id<"dbRows">,
      targetRowId: Id<"dbRows">,
      metadata?: Record<string, unknown>
    ) => {
      try {
        const id = await linkMutation({
          relationConfigId,
          sourceRowId,
          targetRowId,
          metadata,
        });
        toast({ title: "Rows linked" });
        return id;
      } catch (error) {
        toast({
          title: "Failed to link rows",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        });
        throw error;
      }
    },
    [linkMutation, relationConfigId]
  );

  const unlinkRows = useCallback(
    async (sourceRowId: Id<"dbRows">, targetRowId: Id<"dbRows">) => {
      try {
        await unlinkMutation({ sourceRowId, targetRowId });
        toast({ title: "Rows unlinked" });
      } catch (error) {
        toast({
          title: "Failed to unlink rows",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        });
        throw error;
      }
    },
    [unlinkMutation]
  );

  return {
    linkRows,
    unlinkRows,
  };
}
