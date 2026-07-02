/**
 * Saved Views Hook
 * Manages user-specific saved view configurations
 */
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useCallback, useMemo } from "react";
import { toast } from "@/hooks/use-toast";

export interface SavedViewSettings {
  filters: Array<{
    fieldId: string;
    operator: string;
    value?: unknown;
  }>;
  sorts: Array<{
    fieldId: string;
    direction: "asc" | "desc";
  }>;
  visibleFields: string[];
  groupBy?: string;
  fieldWidths?: Record<string, number>;
}

export interface SavedView {
  _id: Id<"dbSavedViews">;
  viewId: Id<"dbViews">;
  userId: Id<"users">;
  workspaceId: Id<"workspaces">;
  name: string;
  description?: string;
  settings: SavedViewSettings;
  isDefault?: boolean;
  createdAt: number;
  updatedAt: number;
}

export function useSavedViews(workspaceId: Id<"workspaces">, viewId?: Id<"dbViews">) {
  const savedViews = useQuery(
    api.features.database.savedViews.listSavedViews,
    { workspaceId, viewId }
  );

  const createMutation = useMutation(api.features.database.savedViews.createSavedView);
  const updateMutation = useMutation(api.features.database.savedViews.updateSavedView);
  const deleteMutation = useMutation(api.features.database.savedViews.deleteSavedView);
  const shareMutation = useMutation(api.features.database.savedViews.shareView);
  const revokeMutation = useMutation(api.features.database.savedViews.revokeShare);

  const createSavedView = useCallback(
    async (args: {
      viewId: Id<"dbViews">;
      name: string;
      description?: string;
      settings: SavedViewSettings;
      isDefault?: boolean;
    }) => {
      try {
        const id = await createMutation({
          viewId: args.viewId,
          workspaceId,
          name: args.name,
          description: args.description,
          settings: args.settings,
          isDefault: args.isDefault,
        });
        toast({ title: "View saved", description: `"${args.name}" saved successfully` });
        return id;
      } catch (error) {
        toast({
          title: "Failed to save view",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        });
        throw error;
      }
    },
    [createMutation, workspaceId]
  );

  const updateSavedView = useCallback(
    async (
      savedViewId: Id<"dbSavedViews">,
      updates: {
        name?: string;
        description?: string;
        settings?: SavedViewSettings;
        isDefault?: boolean;
      }
    ) => {
      try {
        await updateMutation({ savedViewId, ...updates });
        toast({ title: "View updated" });
      } catch (error) {
        toast({
          title: "Failed to update view",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        });
        throw error;
      }
    },
    [updateMutation]
  );

  const deleteSavedView = useCallback(
    async (savedViewId: Id<"dbSavedViews">) => {
      try {
        await deleteMutation({ savedViewId });
        toast({ title: "View deleted" });
      } catch (error) {
        toast({
          title: "Failed to delete view",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        });
        throw error;
      }
    },
    [deleteMutation]
  );

  const shareView = useCallback(
    async (args: {
      savedViewId: Id<"dbSavedViews">;
      shareType: "workspace" | "users" | "link";
      sharedWithUserIds?: Id<"users">[];
      permission: "view" | "edit";
      expiresAt?: number;
    }) => {
      try {
        const result = await shareMutation(args);
        toast({ title: "View shared" });
        return result;
      } catch (error) {
        toast({
          title: "Failed to share view",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        });
        throw error;
      }
    },
    [shareMutation]
  );

  const revokeShare = useCallback(
    async (shareId: Id<"dbSharedViews">) => {
      try {
        await revokeMutation({ shareId });
        toast({ title: "Share revoked" });
      } catch (error) {
        toast({
          title: "Failed to revoke share",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        });
        throw error;
      }
    },
    [revokeMutation]
  );

  const defaultView = useMemo(
    () => savedViews?.find((v) => v.isDefault),
    [savedViews]
  );

  return {
    savedViews: savedViews ?? [],
    defaultView,
    isLoading: savedViews === undefined,
    createSavedView,
    updateSavedView,
    deleteSavedView,
    shareView,
    revokeShare,
  };
}

/**
 * Access a shared view by token
 */
export function useSharedView(accessToken: string | undefined) {
  const result = useQuery(
    api.features.database.savedViews.getSharedViewByToken,
    accessToken ? { accessToken } : "skip"
  );

  return {
    sharedView: result?.savedView ?? null,
    permission: result?.permission ?? null,
    isLoading: accessToken !== undefined && result === undefined,
  };
}
