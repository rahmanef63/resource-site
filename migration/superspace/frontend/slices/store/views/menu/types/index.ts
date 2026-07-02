import type { Id } from "@convex/_generated/dataModel";
import type { MenuItemMetadata } from "@/frontend/shared/ui";

export interface MenuItem {
  _id: Id<"menuItems">;
  name: string;
  slug: string;
  type: string;
  path?: string;
  metadata?: MenuItemMetadata;
}

export interface AvailableFeatureMenu {
  slug: string;
  name: string;
  description: string;
  icon: string;
  version?: string;
  category?: string;
  featureType?: MenuItemMetadata["featureType"];
  tags?: string[];
  status?: "stable" | "beta" | "development" | "experimental" | "deprecated";
  isReady?: boolean;
  expectedRelease?: string;
}

export type FeatureType = "default" | "system" | "optional" | "custom";

export type ViewMode = "tree" | "grid";

export type TabType = "installed" | "available" | "import";

export interface RenameDialogState {
  isOpen: boolean;
  item?: MenuItem;
  newName: string;
}

export interface ShareDialogState {
  isOpen: boolean;
  shareableId?: string;
}

export interface MenuStoreState {
  searchQuery: string;
  selectedItemId?: Id<"menuItems">;
  showForm: boolean;
  editingItemId?: Id<"menuItems">;
  viewMode: ViewMode;
  activeTab: TabType;
  installingFeatures: Set<string>;
  renameDialog: RenameDialogState;
  shareDialog: ShareDialogState;
  importMenuId: string;
  importing: boolean;
  syncingDefaults: boolean;
  updatingFeatureTypeId: Id<"menuItems"> | null;
}
