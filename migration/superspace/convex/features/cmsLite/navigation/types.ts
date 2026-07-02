// These types will be replaced by generated types from Convex
// Temporarily defining them here for development
export type Id<TableName extends string> = string & { __tableName: TableName };

export interface Translation {
  locale: string;
  title: string;
  description?: string;
}

export interface NavigationData {
  [key: string]: unknown;
}

export interface NavigationItem {
  _id?: Id<"navigationItems">;
  workspaceId: string;
  key: string;
  type: string;
  status: "active" | "draft" | "inactive";
  parentKey?: string;
  translations: Translation[];
  path: string;
  isExternal: boolean;
  target?: string;
  icon?: string;
  data?: NavigationData;
  metadata?: Record<string, unknown>;
  children?: NavigationItem[];
}

export interface NavigationGroup {
  _id?: Id<"navigationGroups">;
  workspaceId: string;
  name: string;
  translations: Translation[];
  status: "active" | "draft" | "inactive";
  items: string[];
  settings?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}