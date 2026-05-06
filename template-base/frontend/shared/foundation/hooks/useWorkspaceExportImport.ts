"use client";

import { useState, useCallback, useRef } from "react";
import { useMutation } from "convex/react";
import { anyApi } from "convex/server";
import type { Id } from "@/convex/_generated/dataModel";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface WorkspaceExportOptions {
  includeMembers?: boolean;
  includeCustomRolesOnly?: boolean;
}

export interface WorkspaceImportOptions {
  overrideName?: string;
  overrideSlug?: string;
  importMembers?: boolean;
  parentWorkspaceId?: Id<"workspaces">;
}

export interface ImportValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  /**
   * Manifest version detected. "1.0" = single workspace export; "2.0" = multi-workspace
   * migration manifest (dispatched to bulkMigration.executeMigration on import).
   */
  version: "1.0" | "2.0" | null;
  preview: {
    workspaceName: string;
    workspaceType: string;
    rolesCount: number;
    membersCount: number;
    enabledFeaturesCount: number;
    /** v2.0 only — number of workspaces in the manifest */
    workspacesCount?: number;
    /** v2.0 only — manifest meta.name */
    manifestName?: string;
  } | null;
}

export interface ImportSummary {
  workspaceId: Id<"workspaces">;
  rolesCreated: number;
  membersImported: number;
  membersFailed: number;
  /** v2.0 only — total workspaces processed */
  totalWorkspaces?: number;
  /** v2.0 only — successfully created workspaces */
  createdWorkspaces?: number;
  /** v2.0 only — failed workspaces */
  failedWorkspaces?: number;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Shared hook for workspace export/import operations.
 * Used by WorkspaceDialogs, OnboardingFlow, WorkspaceStore, and WorkspaceSwitcher.
 */
export function useWorkspaceExportImport(workspaceId?: Id<"workspaces"> | null) {
  const [isExporting, setIsExporting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [validationResult, setValidationResult] = useState<ImportValidationResult | null>(null);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // anyApi escape hatch — same pattern as RobustOnboardingFlow.tsx. Using the generated
  // api type through useMutation triggers TS2589 (excessively deep type instantiation)
  // once multiple mutations are registered in this hook.
  const exportMutation = useMutation(anyApi.workspace.exportImport.exportWorkspace);
  const importMutation = useMutation(anyApi.workspace.exportImport.importWorkspace);
  const bulkMigrationMutation = useMutation(anyApi.workspace.bulkMigration.executeMigration);

  // ── Export ────────────────────────────────────────────────────────────────

  /**
   * Export current workspace as JSON and trigger browser download.
   */
  const exportWorkspace = useCallback(
    async (options: WorkspaceExportOptions = {}) => {
      if (!workspaceId) return;
      setIsExporting(true);
      setError(null);
      try {
        const data = await exportMutation({
          workspaceId,
          includeMembers: options.includeMembers ?? false,
          includeCustomRolesOnly: options.includeCustomRolesOnly ?? false,
        });

        // Trigger file download
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${(data as any).workspace?.slug ?? "workspace"}-export-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        return data;
      } catch (err) {
        setError((err as Error).message);
        throw err;
      } finally {
        setIsExporting(false);
      }
    },
    [workspaceId, exportMutation]
  );

  // ── File reading ──────────────────────────────────────────────────────────

  /**
   * Read a File object and store its JSON content.
   * Returns the JSON string on success.
   */
  const readFile = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setFileContent(text);
        setFileName(file.name);
        setValidationResult(null);
        setImportSummary(null);
        setError(null);
        resolve(text);
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  }, []);

  // ── Client-side Validate ──────────────────────────────────────────────────

  /**
   * Client-side validation of import JSON (no server round-trip needed).
   * Supports v1.0 WorkspaceExportData (single workspace) and v2.0 WorkspaceMigrationManifest
   * (multi-workspace with parent-child hierarchy).
   */
  const validateImportJson = useCallback((json: string): ImportValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const validTypes = ["organization", "institution", "group", "family", "personal"];

    let data: any;
    try {
      data = JSON.parse(json);
    } catch {
      return {
        valid: false,
        errors: ["Invalid JSON format"],
        warnings: [],
        version: null,
        preview: null,
      };
    }

    // ── v2.0 manifest (multi-workspace) ────────────────────────────────────
    if (data?.version === "2.0") {
      if (!data.meta?.name) errors.push("Missing meta.name");

      if (!Array.isArray(data.workspaces) || data.workspaces.length === 0) {
        errors.push("workspaces array is empty or missing");
      } else {
        const localIds = new Set<string>();
        for (const entry of data.workspaces) {
          if (!entry.localId) {
            errors.push("Workspace entry missing localId");
            continue;
          }
          if (localIds.has(entry.localId)) {
            errors.push(`Duplicate localId "${entry.localId}"`);
          }
          localIds.add(entry.localId);

          if (!entry.workspace?.name) {
            errors.push(`Workspace "${entry.localId}" missing name`);
          }
          if (!entry.workspace?.type) {
            errors.push(`Workspace "${entry.localId}" missing type`);
          } else if (!validTypes.includes(entry.workspace.type)) {
            errors.push(
              `Workspace "${entry.localId}" has invalid type: ${entry.workspace.type}`
            );
          }
        }

        for (const entry of data.workspaces) {
          if (entry.parentLocalId && !localIds.has(entry.parentLocalId)) {
            errors.push(
              `Workspace "${entry.localId}" references unknown parentLocalId "${entry.parentLocalId}"`
            );
          }
        }
      }

      const firstWorkspace = data.workspaces?.[0]?.workspace;
      const result: ImportValidationResult = {
        valid: errors.length === 0,
        errors,
        warnings,
        version: "2.0",
        preview: data.meta?.name
          ? {
              workspaceName: firstWorkspace?.name ?? data.meta.name,
              workspaceType: firstWorkspace?.type ?? "",
              rolesCount: data.workspaces?.[0]?.roles?.length ?? 0,
              membersCount: data.workspaces?.[0]?.members?.length ?? 0,
              enabledFeaturesCount:
                data.workspaces?.[0]?.enabledFeatures?.length ?? 0,
              workspacesCount: Array.isArray(data.workspaces)
                ? data.workspaces.length
                : 0,
              manifestName: data.meta.name,
            }
          : null,
      };
      setValidationResult(result);
      return result;
    }

    // ── v1.0 export (single workspace) ─────────────────────────────────────
    if (!data.version) errors.push("Missing version field");
    if (!data.workspace?.name) errors.push("Missing workspace name");
    if (!data.workspace?.type) {
      errors.push("Missing workspace type");
    } else if (!validTypes.includes(data.workspace.type)) {
      errors.push(`Invalid workspace type: ${data.workspace.type}`);
    }

    if (Array.isArray(data.roles)) {
      for (const role of data.roles) {
        if (!role.name || !role.slug) errors.push("Role missing name or slug");
        if (!Array.isArray(role.permissions))
          warnings.push(`Role "${role.name}" has no permissions array`);
      }
    }

    if (Array.isArray(data.members)) {
      for (const member of data.members) {
        if (!member.email) warnings.push("Member missing email");
        if (!member.roleSlug) warnings.push(`Member "${member.email}" missing roleSlug`);
      }
    }

    const result: ImportValidationResult = {
      valid: errors.length === 0,
      errors,
      warnings,
      version: data.version === "1.0" ? "1.0" : null,
      preview: data.workspace?.name
        ? {
            workspaceName: data.workspace.name,
            workspaceType: data.workspace.type ?? "",
            rolesCount: data.roles?.length ?? 0,
            membersCount: data.members?.length ?? 0,
            enabledFeaturesCount: data.enabledFeatures?.length ?? 0,
          }
        : null,
    };

    setValidationResult(result);
    return result;
  }, []);

  const validateFile = useCallback(
    async (file: File): Promise<ImportValidationResult> => {
      setIsValidating(true);
      try {
        const json = await readFile(file);
        return validateImportJson(json);
      } finally {
        setIsValidating(false);
      }
    },
    [readFile, validateImportJson]
  );

  // ── Import ─────────────────────────────────────────────────────────────────

  /**
   * Import workspace(s) from currently loaded fileContent.
   * Dispatches based on detected manifest version:
   *   v1.0 → exportImport.importWorkspace (single workspace)
   *   v2.0 → bulkMigration.executeMigration (multi-workspace hierarchy)
   */
  const importWorkspace = useCallback(
    async (options: WorkspaceImportOptions = {}): Promise<ImportSummary> => {
      if (!fileContent) throw new Error("No file loaded");
      setIsImporting(true);
      setError(null);
      try {
        let detectedVersion: "1.0" | "2.0" | null = null;
        try {
          const parsed = JSON.parse(fileContent);
          if (parsed?.version === "2.0") detectedVersion = "2.0";
          else if (parsed?.version === "1.0") detectedVersion = "1.0";
        } catch {
          // fall through — importMutation will surface the parse error
        }

        if (detectedVersion === "2.0") {
          const bulkResult = (await bulkMigrationMutation({
            manifestJson: fileContent,
            options: {
              importMembers: options.importMembers ?? false,
              autoResolveSlugConflicts: true,
            },
          })) as {
            migrationId: string;
            status: string;
            totalWorkspaces: number;
            createdWorkspaces: number;
            failedWorkspaces: number;
            results: Array<{
              localId: string;
              workspaceId?: Id<"workspaces">;
              name: string;
              status: string;
              error?: string;
            }>;
          };

          const firstCreated = bulkResult.results.find((r) => r.workspaceId)?.workspaceId;
          if (!firstCreated) {
            throw new Error(
              bulkResult.results[0]?.error ?? "Bulk migration created no workspaces"
            );
          }

          const summary: ImportSummary = {
            workspaceId: firstCreated,
            rolesCreated: 0,
            membersImported: 0,
            membersFailed: 0,
            totalWorkspaces: bulkResult.totalWorkspaces,
            createdWorkspaces: bulkResult.createdWorkspaces,
            failedWorkspaces: bulkResult.failedWorkspaces,
          };
          setImportSummary(summary);
          return summary;
        }

        const result = (await importMutation({
          importData: fileContent,
          overrideName: options.overrideName,
          overrideSlug: options.overrideSlug,
          importMembers: options.importMembers ?? false,
          parentWorkspaceId: options.parentWorkspaceId,
        })) as {
          workspaceId: Id<"workspaces">;
          summary: {
            rolesCreated: number;
            membersImported: number;
            membersFailed: number;
          };
        };

        const summary: ImportSummary = {
          workspaceId: result.workspaceId,
          rolesCreated: result.summary.rolesCreated,
          membersImported: result.summary.membersImported,
          membersFailed: result.summary.membersFailed,
        };
        setImportSummary(summary);
        return summary;
      } catch (err) {
        setError((err as Error).message);
        throw err;
      } finally {
        setIsImporting(false);
      }
    },
    [fileContent, importMutation, bulkMigrationMutation]
  );

  const reset = useCallback(() => {
    setFileContent(null);
    setFileName(null);
    setValidationResult(null);
    setImportSummary(null);
    setError(null);
  }, []);

  return {
    // State
    isExporting,
    isValidating,
    isImporting,
    validationResult,
    importSummary,
    error,
    fileContent,
    fileName,
    fileInputRef,

    // Actions
    exportWorkspace,
    readFile,
    validateFile,
    validateImportJson,
    importWorkspace,
    reset,
  };
}
