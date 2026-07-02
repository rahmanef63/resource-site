import { useState } from "react";
import type { Id } from "@convex/_generated/dataModel";
import type { MenuStoreState, ViewMode, TabType, MenuItem } from "../types";

/**
 * Hook to manage menu store local state
 */
export function useMenuStoreState() {
  const [state, setState] = useState<MenuStoreState>({
    searchQuery: "",
    selectedItemId: undefined,
    showForm: false,
    editingItemId: undefined,
    viewMode: "tree",
    activeTab: "installed",
    installingFeatures: new Set(),
    renameDialog: { isOpen: false, newName: "" },
    shareDialog: { isOpen: false },
    importMenuId: "",
    importing: false,
    syncingDefaults: false,
    updatingFeatureTypeId: null,
  });

  const setSearchQuery = (query: string) =>
    setState((prev) => ({ ...prev, searchQuery: query }));

  const setSelectedItemId = (id: Id<"menuItems"> | undefined) =>
    setState((prev) => ({ ...prev, selectedItemId: id }));

  const setShowForm = (show: boolean) =>
    setState((prev) => ({ ...prev, showForm: show }));

  const setEditingItemId = (id: Id<"menuItems"> | undefined) =>
    setState((prev) => ({ ...prev, editingItemId: id }));

  const setViewMode = (mode: ViewMode) =>
    setState((prev) => ({ ...prev, viewMode: mode }));

  const setActiveTab = (tab: TabType) =>
    setState((prev) => ({ ...prev, activeTab: tab }));

  const addInstallingFeature = (slug: string) =>
    setState((prev) => ({
      ...prev,
      installingFeatures: new Set([...prev.installingFeatures, slug]),
    }));

  const removeInstallingFeature = (slug: string) =>
    setState((prev) => {
      const newSet = new Set(prev.installingFeatures);
      newSet.delete(slug);
      return { ...prev, installingFeatures: newSet };
    });

  const openRenameDialog = (item: MenuItem) =>
    setState((prev) => ({
      ...prev,
      renameDialog: { isOpen: true, item, newName: item.name },
    }));

  const closeRenameDialog = () =>
    setState((prev) => ({
      ...prev,
      renameDialog: { isOpen: false, newName: "" },
    }));

  const setRenameDialogName = (name: string) =>
    setState((prev) => ({
      ...prev,
      renameDialog: { ...prev.renameDialog, newName: name },
    }));

  const openShareDialog = (shareableId: string) =>
    setState((prev) => ({
      ...prev,
      shareDialog: { isOpen: true, shareableId },
    }));

  const closeShareDialog = () =>
    setState((prev) => ({
      ...prev,
      shareDialog: { isOpen: false },
    }));

  const setImportMenuId = (id: string) =>
    setState((prev) => ({ ...prev, importMenuId: id }));

  const setImporting = (importing: boolean) =>
    setState((prev) => ({ ...prev, importing }));

  const setSyncingDefaults = (syncing: boolean) =>
    setState((prev) => ({ ...prev, syncingDefaults: syncing }));

  const setUpdatingFeatureTypeId = (id: Id<"menuItems"> | null) =>
    setState((prev) => ({ ...prev, updatingFeatureTypeId: id }));

  return {
    state,
    setSearchQuery,
    setSelectedItemId,
    setShowForm,
    setEditingItemId,
    setViewMode,
    setActiveTab,
    addInstallingFeature,
    removeInstallingFeature,
    openRenameDialog,
    closeRenameDialog,
    setRenameDialogName,
    openShareDialog,
    closeShareDialog,
    setImportMenuId,
    setImporting,
    setSyncingDefaults,
    setUpdatingFeatureTypeId,
  };
}
