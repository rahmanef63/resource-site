import { useQuery } from "convex/react";
import type { Id } from "@convex/_generated/dataModel";
import { menuStoreApi } from "../api/menuStoreApi";
import type { MenuItem, AvailableFeatureMenu } from "../types";

/**
 * Hook to fetch menu store data
 */
export function useMenuStoreData(workspaceId: Id<"workspaces"> | null) {
  const menuItems = useQuery(
    menuStoreApi.getWorkspaceMenuItems,
    workspaceId ? { workspaceId } : undefined
  ) as MenuItem[] | undefined;

  const availableFeatures = useQuery(
    menuStoreApi.getAvailableFeatureMenus,
    workspaceId ? { workspaceId } : undefined
  ) as AvailableFeatureMenu[] | undefined;

  return {
    menuItems,
    availableFeatures,
    isLoading: menuItems === undefined || availableFeatures === undefined,
  };
}
