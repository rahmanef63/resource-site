/** notion-shell — domain types subset.
 *
 *  Portable subset of nosion's shared/types/domain.ts. Strips fields
 *  that only make sense with the convex backend (workspaceId, wiki,
 *  shareSlug, snapshot machinery, etc.) and keeps the value-shape
 *  every consumer needs to render blocks, pages, and databases.
 *
 *  When a downstream needs richer state (relations / rollups /
 *  formulas / per-view filters), bump this subset — the wrappers
 *  are typed against it.
 */

import type { ComponentType, ReactNode } from "react";

export type BlockType =
  | "paragraph"
  | "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
  | "todo" | "bullet" | "numbered"
  | "quote" | "code" | "divider"
  | "callout" | "page" | "database"
  | "image" | "equation" | "table" | "embed" | "button"
  | "toc" | "audio" | "video" | "toggle";

export interface Block {
  id: string;
  type: BlockType;
  text: string;
  checked?: boolean;
  lang?: string;
  pageId?: string;
  databaseId?: string;
  children?: Block[];
  collapsed?: boolean;
  url?: string;
  caption?: string;
  tableRows?: string[][];
  tableHeader?: boolean;
  width?: number;
  align?: "left" | "center" | "right";
  indent?: number;
  calloutKind?: "note" | "tip" | "warning" | "important" | "caution" | "default";
  color?: string;
  bgColor?: string;
}

export interface BlockRendererProps {
  block: Block;
  pageId?: string;
  onUpdate: (patch: Partial<Block>) => void;
  onReplace?: (next: Block) => void;
  registerRef?: (el: HTMLElement | null) => void;
}

export type BlockRenderers = Partial<Record<BlockType, ComponentType<BlockRendererProps>>>;

export interface Page {
  id: string;
  parentId: string | null;
  title: string;
  icon: string;
  /** Optional cover image URL. Rendered by NotionPage when set. */
  cover?: string;
  blocks: Block[];
  favorite: boolean;
  trashed: boolean;
  createdAt: number;
  updatedAt: number;
  /** When set, this page is a row in a database — `rowProps` carries the cell values. */
  rowOfDatabaseId?: string;
  rowProps?: Record<string, PropertyValue>;
  smallText?: boolean;
  fullWidth?: boolean;
}

export type PropertyType =
  | "text" | "number" | "select" | "multi_select" | "status"
  | "date" | "checkbox" | "url" | "email" | "phone";

export interface SelectOption {
  id: string;
  name: string;
  color: string;
}

export type NumberFormat = "number" | "decimal" | "percent" | "currency";

export interface Property {
  id: string;
  name: string;
  type: PropertyType;
  hidden?: boolean;
  description?: string;
  options?: SelectOption[];
  numberFormat?: NumberFormat;
  numberDecimals?: number;
}

export type PropertyValue =
  | string | number | boolean | null
  | string[]
  | { date?: string; end?: string; time?: string; endTime?: string };

export type DbView = "table" | "board" | "list" | "gallery" | "calendar" | "feed";

export interface DatabaseFilter {
  propertyId: string;
  op: "contains" | "equals" | "not_empty" | "is_empty" | "checked" | "unchecked";
  value?: string;
}

export interface DatabaseSort {
  propertyId: string;
  direction: "asc" | "desc";
}

export interface DatabaseViewConfig {
  id: string;
  name: string;
  type: DbView;
  groupBy?: string;
  sorts: DatabaseSort[];
  filters: DatabaseFilter[];
  search: string;
}

export interface Database {
  id: string;
  name: string;
  icon: string;
  properties: Property[];
  rowIds: string[];
  views: DatabaseViewConfig[];
  activeViewId: string;
  createdAt: number;
  updatedAt: number;
}

export type ActionsSlot = ReactNode;
