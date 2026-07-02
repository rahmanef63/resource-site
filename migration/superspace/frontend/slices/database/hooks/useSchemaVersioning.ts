/**
 * useSchemaVersioning Hook
 * Features #101, #102 - Schema version control and migrations
 */

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useCallback } from "react";

export interface MigrationStep {
  type:
    | "rename_field"
    | "change_type"
    | "merge_fields"
    | "split_field"
    | "compute_values"
    | "delete_field";
  config: any;
}

export interface UseSchemaVersioningOptions {
  tableId: Id<"dbTables">;
}

export function useSchemaVersioning(options: UseSchemaVersioningOptions) {
  const { tableId } = options;

  // Queries
  const versions = useQuery(
    api.features.database.schemaVersioning.getVersions,
    { tableId }
  );

  const latestVersion = useQuery(
    api.features.database.schemaVersioning.getLatestVersion,
    { tableId }
  );

  const migrations = useQuery(
    api.features.database.schemaVersioning.getMigrations,
    { tableId }
  );

  const pendingMigrations = useQuery(
    api.features.database.schemaVersioning.getPendingMigrations,
    { tableId }
  );

  // Mutations
  const createVersionMutation = useMutation(
    api.features.database.schemaVersioning.createVersion
  );
  const createMigrationMutation = useMutation(
    api.features.database.schemaVersioning.createMigration
  );
  const executeMigrationMutation = useMutation(
    api.features.database.schemaVersioning.executeMigration
  );
  const rollbackMigrationMutation = useMutation(
    api.features.database.schemaVersioning.rollbackMigration
  );
  const restoreVersionMutation = useMutation(
    api.features.database.schemaVersioning.restoreVersion
  );

  // Create a new schema version snapshot
  const createVersion = useCallback(
    async (data: {
      changeType:
        | "field_added"
        | "field_removed"
        | "field_modified"
        | "field_reordered"
        | "table_created"
        | "batch_changes";
      changes?: Array<{
        fieldId?: string;
        action: string;
        before?: any;
        after?: any;
      }>;
      comment?: string;
    }) => {
      return await createVersionMutation({
        tableId,
        ...data,
      });
    },
    [tableId, createVersionMutation]
  );

  // Create a migration
  const createMigration = useCallback(
    async (data: {
      fromVersion: number;
      toVersion: number;
      migrationSteps?: MigrationStep[];
      migrationScript?: string;
      isReversible?: boolean;
      rollbackScript?: string;
    }) => {
      return await createMigrationMutation({
        tableId,
        ...data,
      });
    },
    [tableId, createMigrationMutation]
  );

  // Execute a migration
  const executeMigration = useCallback(
    async (migrationId: Id<"dbSchemaMigrations">) => {
      return await executeMigrationMutation({ migrationId });
    },
    [executeMigrationMutation]
  );

  // Rollback a migration
  const rollbackMigration = useCallback(
    async (migrationId: Id<"dbSchemaMigrations">) => {
      return await rollbackMigrationMutation({ migrationId });
    },
    [rollbackMigrationMutation]
  );

  // Restore to a previous version
  const restoreVersion = useCallback(
    async (versionId: Id<"dbSchemaVersions">) => {
      return await restoreVersionMutation({
        tableId,
        versionId,
      });
    },
    [tableId, restoreVersionMutation]
  );

  return {
    // Data
    versions: versions ?? [],
    latestVersion,
    currentVersion: latestVersion?.version ?? 0,
    migrations: migrations ?? [],
    pendingMigrations: pendingMigrations ?? [],
    isLoading: versions === undefined,

    // Actions
    createVersion,
    createMigration,
    executeMigration,
    rollbackMigration,
    restoreVersion,

    // Helpers
    hasPendingMigrations: (pendingMigrations?.length ?? 0) > 0,
  };
}

export function useSchemaVersionComparison(
  versionId1: Id<"dbSchemaVersions"> | null,
  versionId2: Id<"dbSchemaVersions"> | null
) {
  const comparison = useQuery(
    api.features.database.schemaVersioning.compareVersions,
    versionId1 && versionId2 ? { versionId1, versionId2 } : "skip"
  );

  return {
    comparison,
    isLoading: versionId1 !== null && versionId2 !== null && comparison === undefined,
  };
}

export function useSchemaVersion(versionId: Id<"dbSchemaVersions"> | null) {
  const version = useQuery(
    api.features.database.schemaVersioning.getVersion,
    versionId ? { versionId } : "skip"
  );

  return {
    version,
    isLoading: versionId !== null && version === undefined,
  };
}
