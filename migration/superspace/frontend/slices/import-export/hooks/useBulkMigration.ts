"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/frontend/shared/foundation/utils/convex/any-api";
import type { Id } from "@convex/_generated/dataModel";
import type {
  WorkspaceMigrationManifest,
  MigrationValidationResult,
  BulkMigrationResult,
  MigrationOptions,
} from "../types";

/**
 * Hook for bulk workspace migration operations.
 * Wraps validateMigrationManifest, executeMigration, rollbackMigration.
 */
export function useBulkMigration() {
  const [isValidating, setIsValidating] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isRollingBack, setIsRollingBack] = useState(false);
  const [validationResult, setValidationResult] =
    useState<MigrationValidationResult | null>(null);
  const [executionResult, setExecutionResult] =
    useState<BulkMigrationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const executeMigrationMutation = useMutation(
    api.workspace.bulkMigration.executeMigration
  );
  const rollbackMigrationMutation = useMutation(
    api.workspace.bulkMigration.rollbackMigration
  );

  const recentMigrations = useQuery(
    api.workspace.bulkMigration.listMigrations,
    { limit: 10 }
  );

  /**
   * Validate a manifest JSON string without executing.
   * Uses client-side validation (mirrors server logic) for instant feedback.
   */
  const validateManifest = useCallback(
    async (manifestJson: string): Promise<MigrationValidationResult> => {
      setIsValidating(true);
      setError(null);
      try {
        let manifest: WorkspaceMigrationManifest;
        try {
          manifest = JSON.parse(manifestJson);
        } catch {
          const result: MigrationValidationResult = {
            valid: false,
            errors: ["Invalid JSON format"],
            warnings: [],
            preview: null,
          };
          setValidationResult(result);
          return result;
        }

        const errors: string[] = [];
        const warnings: string[] = [];

        if (manifest.version !== "2.0") {
          errors.push(
            `Unsupported version "${manifest.version}" — expected "2.0"`
          );
        }
        if (!manifest.meta?.name) errors.push("Missing meta.name");

        if (
          !Array.isArray(manifest.workspaces) ||
          manifest.workspaces.length === 0
        ) {
          errors.push("workspaces array is empty or missing");
        } else {
          const localIds = new Set<string>();
          const validTypes = [
            "organization",
            "institution",
            "group",
            "family",
            "personal",
          ];

          for (const entry of manifest.workspaces) {
            if (!entry.localId) {
              errors.push("A workspace entry is missing localId");
              continue;
            }
            if (localIds.has(entry.localId)) {
              errors.push(`Duplicate localId "${entry.localId}"`);
            }
            localIds.add(entry.localId);

            if (!entry.workspace?.name) {
              errors.push(`Workspace "${entry.localId}" missing workspace.name`);
            }
            if (
              entry.workspace?.type &&
              !validTypes.includes(entry.workspace.type)
            ) {
              errors.push(
                `Workspace "${entry.localId}" has invalid type "${entry.workspace.type}"`
              );
            }
            if (
              entry.parentLocalId &&
              !manifest.workspaces.some((e) => e.localId === entry.parentLocalId)
            ) {
              errors.push(
                `Workspace "${entry.localId}" references unknown parentLocalId "${entry.parentLocalId}"`
              );
            }
          }
        }

        // Build hierarchy preview
        const hierarchy =
          manifest.workspaces?.map((e) => ({
            localId: e.localId,
            name: e.workspace.name,
            type: e.workspace.type ?? "organization",
            parentLocalId: e.parentLocalId ?? null,
            rolesCount: e.roles?.filter((r) => !r.isSystemRole).length ?? 0,
            membersCount: e.members?.length ?? 0,
            featuresCount: e.enabledFeatures?.length ?? 0,
          })) ?? [];

        const result: MigrationValidationResult = {
          valid: errors.length === 0,
          errors,
          warnings,
          preview:
            errors.length === 0 || manifest.workspaces?.length > 0
              ? {
                  migrationName: manifest.meta?.name ?? "Untitled Migration",
                  totalWorkspaces: manifest.workspaces?.length ?? 0,
                  rootWorkspaces: manifest.workspaces?.filter(
                    (e) => !e.parentLocalId
                  ).length ?? 0,
                  totalRoles: manifest.workspaces?.reduce(
                    (acc, e) =>
                      acc +
                      (e.roles?.filter((r) => !r.isSystemRole).length ?? 0),
                    0
                  ) ?? 0,
                  totalMembers: manifest.workspaces?.reduce(
                    (acc, e) => acc + (e.members?.length ?? 0),
                    0
                  ) ?? 0,
                  hierarchy,
                }
              : null,
        };

        setValidationResult(result);
        return result;
      } finally {
        setIsValidating(false);
      }
    },
    []
  );

  const executeMigration = useCallback(
    async (
      manifestJson: string,
      options: MigrationOptions = {}
    ): Promise<BulkMigrationResult> => {
      setIsExecuting(true);
      setError(null);
      try {
        const result = await executeMigrationMutation({
          manifestJson,
          options: {
            autoResolveSlugConflicts: options.autoResolveSlugConflicts ?? true,
            importMembers: options.importMembers ?? false,
            dryRun: options.dryRun ?? false,
          },
        });
        const typed = result as BulkMigrationResult;
        setExecutionResult(typed);
        return typed;
      } catch (err) {
        const msg = (err as Error).message;
        setError(msg);
        throw err;
      } finally {
        setIsExecuting(false);
      }
    },
    [executeMigrationMutation]
  );

  const rollbackMigration = useCallback(
    async (migrationId: Id<"bulkMigrations">) => {
      setIsRollingBack(true);
      setError(null);
      try {
        return await rollbackMigrationMutation({ migrationId });
      } catch (err) {
        const msg = (err as Error).message;
        setError(msg);
        throw err;
      } finally {
        setIsRollingBack(false);
      }
    },
    [rollbackMigrationMutation]
  );

  const reset = useCallback(() => {
    setValidationResult(null);
    setExecutionResult(null);
    setError(null);
  }, []);

  return {
    // State
    isValidating,
    isExecuting,
    isRollingBack,
    validationResult,
    executionResult,
    error,
    recentMigrations: (recentMigrations as any[]) ?? [],

    // Actions
    validateManifest,
    executeMigration,
    rollbackMigration,
    reset,
  };
}
