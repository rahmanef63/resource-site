import { api } from "@/frontend/shared/foundation/utils/convex/any-api";

/**
 * Menu Store API endpoints
 * Centralized API calls for menu management
 */
export const menuStoreApi = {
  // Queries
  getWorkspaceMenuItems: api["features/menus/menuItems"].getWorkspaceMenuItems,
  getAvailableFeatureMenus: api["features/menus/menuItems"].getAvailableFeatureMenus,

  // Mutations
  createMenuItem: api["features/menus/menuItems"].createMenuItem,
  updateMenuItem: api["features/menus/menuItems"].updateMenuItem,
  deleteMenuItem: api["features/menus/menuItems"].deleteMenuItem,
  installFeatureMenus: api["features/menus/menuItems"].installFeatureMenus,
  uninstallFeatureMenus: api["features/menus/menuItems"].uninstallFeatureMenus,
  renameMenuItem: api["features/menus/menuItems"].renameMenuItem,
  duplicateMenuItem: api["features/menus/menuItems"].duplicateMenuItem,
  shareMenuItem: api["features/menus/menuItems"].shareMenuItem,
  importMenuFromShareableId: api["features/menus/menuItems"].importMenuFromShareableId,
  setMenuItemFeatureType: api["features/menus/menuItems"].setMenuItemFeatureType,
  syncWorkspaceDefaultMenus: api["features/menus/menuItems"].syncWorkspaceDefaultMenus,
  refreshMenuMetadata: api["features/menus/menuItems"].refreshMenuMetadata,
} as const;
