import { useMutation } from "convex/react";
import type { Id } from "@convex/_generated/dataModel";
import { toast } from "sonner";
import { menuStoreApi } from "../api/menuStoreApi";
import type { MenuItem } from "../types";
import { useAuthed } from "@/frontend/shared/foundation/auth/hooks/useAuthed";
import {
  getFeatureInstallErrorFeedback,
  getFeatureInstallPreflightFeedback,
} from "@/frontend/shared/ui/layout/menus/utils/install-feature-feedback";

/**
 * Hook to manage menu store mutations
 */
export function useMenuStoreMutations() {
  const { isLoading: isAuthLoading, isSignedIn, isAuthenticated } = useAuthed();
  const createMenuItemMutation = useMutation(menuStoreApi.createMenuItem);
  const updateMenuItemMutation = useMutation(menuStoreApi.updateMenuItem);
  const deleteMenuItemMutation = useMutation(menuStoreApi.deleteMenuItem);
  const installFeatureMenusMutation = useMutation(menuStoreApi.installFeatureMenus);
  const renameMenuItemMutation = useMutation(menuStoreApi.renameMenuItem);
  const duplicateMenuItemMutation = useMutation(menuStoreApi.duplicateMenuItem);
  const shareMenuItemMutation = useMutation(menuStoreApi.shareMenuItem);
  const importMenuFromShareableIdMutation = useMutation(menuStoreApi.importMenuFromShareableId);
  const setMenuItemFeatureTypeMutation = useMutation(menuStoreApi.setMenuItemFeatureType);
  const syncDefaultMenusMutation = useMutation(menuStoreApi.syncWorkspaceDefaultMenus);

  const createMenuItem = async (
    workspaceId: Id<"workspaces">,
    data: {
      name: string;
      slug: string;
      type: "folder" | "group" | "route" | "divider" | "action" | "chat" | "document";
      parentId?: Id<"menuItems"> | null;
      icon?: string;
      path?: string;
      metadata?: { description?: string; color?: string };
    },
    onSuccess?: (menuItemId: Id<"menuItems">) => void
  ) => {
    try {
      const menuItemId = await createMenuItemMutation({
        workspaceId,
        parentId: data.parentId,
        name: data.name,
        slug: data.slug,
        type: data.type,
        icon: data.icon,
        path: data.path,
        metadata: data.metadata,
      });
      toast.success(`${data.type === "folder" ? "Folder" : data.type === "group" ? "Group" : "Menu item"} created successfully`);
      onSuccess?.(menuItemId);
      return menuItemId;
    } catch (error) {
      console.error("Failed to create menu item:", error);
      toast.error("Failed to create menu item");
      throw error;
    }
  };

  const updateMenuItem = async (
    menuItemId: Id<"menuItems">,
    data: Partial<MenuItem>,
    onSuccess?: () => void
  ) => {
    try {
      await updateMenuItemMutation({
        menuItemId,
        name: data.name,
        slug: data.slug,
        icon: (data as any).icon,
        path: data.path,
        metadata: data.metadata,
      });
      onSuccess?.();
    } catch (error) {
      console.error("Failed to update menu item:", error);
      toast.error("Failed to update menu item");
      throw error;
    }
  };

  const deleteMenuItem = async (menuItemId: Id<"menuItems">, onSuccess?: () => void) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return;

    try {
      await deleteMenuItemMutation({ menuItemId });
      toast.success("Menu item deleted successfully");
      onSuccess?.();
    } catch (error) {
      console.error("Failed to delete menu item:", error);
      toast.error("Failed to delete menu item");
    }
  };

  const installFeature = async (
    workspaceId: Id<"workspaces">,
    featureSlugs: string[],
    onSuccess?: () => void
  ) => {
    const authFeedback = getFeatureInstallPreflightFeedback({
      isAuthLoading,
      isSignedIn,
      isAuthenticated,
    });

    if (authFeedback) {
      toast.error(authFeedback.title, {
        description: authFeedback.description,
      });
      return;
    }

    try {
      await installFeatureMenusMutation({ workspaceId, featureSlugs });
      toast.success("Feature installed successfully");
      onSuccess?.();
    } catch (error) {
      console.error("Failed to install feature:", error);
      const feedback = getFeatureInstallErrorFeedback(error);
      toast.error(feedback.title, {
        description: feedback.description,
      });
      throw error;
    }
  };

  const renameMenuItem = async (menuItemId: Id<"menuItems">, name: string, onSuccess?: () => void) => {
    if (!name.trim()) return;

    try {
      await renameMenuItemMutation({ menuItemId, name: name.trim() });
      toast.success("Menu item renamed successfully");
      onSuccess?.();
    } catch (error) {
      console.error("Failed to rename menu item:", error);
      toast.error("Failed to rename menu item");
    }
  };

  const duplicateMenuItem = async (menuItemId: Id<"menuItems">, onSuccess?: () => void) => {
    try {
      await duplicateMenuItemMutation({ menuItemId });
      toast.success("Menu item duplicated successfully");
      onSuccess?.();
    } catch (error) {
      console.error("Failed to duplicate menu item:", error);
      toast.error("Failed to duplicate menu item");
    }
  };

  const shareMenuItem = async (menuItemId: Id<"menuItems">): Promise<string | null> => {
    try {
      const result = await shareMenuItemMutation({ menuItemId });
      return result.shareableId;
    } catch (error) {
      console.error("Failed to share menu item:", error);
      toast.error("Failed to share menu item");
      return null;
    }
  };

  const importMenu = async (
    workspaceId: Id<"workspaces">,
    shareableId: string,
    onSuccess?: (sourceName: string) => void
  ) => {
    if (!shareableId.trim()) {
      toast.error("Please enter a menu ID");
      return;
    }

    try {
      const result = await importMenuFromShareableIdMutation({
        workspaceId,
        shareableId: shareableId.trim(),
      });
      toast.success(`Menu "${result.sourceName}" imported successfully`);
      onSuccess?.(result.sourceName);
    } catch (error) {
      console.error("Failed to import menu:", error);
      toast.error(error instanceof Error ? error.message : "Failed to import menu");
      throw error;
    }
  };

  const setFeatureType = async (
    menuItemId: Id<"menuItems">,
    featureType: "default" | "system" | "optional",
    onSuccess?: () => void
  ) => {
    try {
      await setMenuItemFeatureTypeMutation({ menuItemId, featureType });
      toast.success(
        featureType === "system"
          ? "Menu restricted to system roles"
          : featureType === "optional"
          ? "Menu marked as optional"
          : "Menu visibility restored"
      );
      onSuccess?.();
    } catch (error) {
      console.error("Failed to update menu visibility:", error);
      toast.error("Failed to update menu visibility");
      throw error;
    }
  };

  const syncDefaults = async (workspaceId: Id<"workspaces">, onSuccess?: () => void) => {
    try {
      await syncDefaultMenusMutation({ workspaceId });
      toast.success("Default menus synced with feature manifest");
      onSuccess?.();
    } catch (error) {
      console.error("Failed to sync default menus:", error);
      toast.error("Failed to sync default menus");
      throw error;
    }
  };

  return {
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    installFeature,
    renameMenuItem,
    duplicateMenuItem,
    shareMenuItem,
    importMenu,
    setFeatureType,
    syncDefaults,
  };
}
