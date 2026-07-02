import type { Doc, Id } from "@convex/_generated/dataModel";

export type DatabaseTable = Doc<"dbTables">;
export type DatabaseField = Doc<"dbFields">;
export type DatabaseRow = Doc<"dbRows">;
export type DatabaseView = Doc<"dbViews">;

/**
 * Database Field Types
 * 
 * @deprecated "text" type is legacy. Use PropertyType from shared/foundation for new properties.
 * "text" is kept for backward compatibility with existing database records.
 */
export type DatabaseFieldType =
  | "text"       // @deprecated Use "rich_text" from PropertyType instead
  | "number"
  | "select"
  | "multiSelect"
  | "date"
  | "person"
  | "files"
  | "checkbox"
  | "url"
  | "email"
  | "phone"
  | "formula"
  | "relation"
  | "rollup";

export interface DatabaseSelectOption {
  id: string;
  name: string;
  color?: string;
}

export interface DatabaseFieldOptions {
  selectOptions?: DatabaseSelectOption[];
  dateFormat?: string;
  numberFormat?: string;
  formula?: string;
}

export interface DatabaseStats {
  totalRows: number;
  totalFields: number;
  totalViews: number;
  lastUpdatedAt: number | null;
}

export interface DatabaseRecord {
  table: DatabaseTable;
  fields: DatabaseField[];
  rows: DatabaseRow[];
  views: DatabaseView[];
  stats: DatabaseStats;
}

export interface DatabaseStatus {
  id: string;
  name: string;
  color?: string;
}

export interface DatabasePerson {
  id: string;
  label: string;
  avatarUrl?: string | null;
}

export interface DatabaseMarker {
  id: string;
  date: Date;
  label: string;
  className?: string;
}

export interface DatabaseFeature {
  id: Id<"dbRows">;
  docId?: Id<"documents"> | null;
  name: string;
  status?: DatabaseStatus | null;
  owner?: DatabasePerson | null;
  group?: string | null;
  product?: string | null;
  initiative?: string | null;
  release?: string | null;
  startAt?: Date | null;
  endAt?: Date | null;
  metadata: Record<string, unknown>;
}

export interface DatabaseViewModel {
  features: DatabaseFeature[];
  statuses: DatabaseStatus[];
  markers: DatabaseMarker[];
  groups: string[];
}

export interface FieldMapping {
  titleField?: string;
  statusField?: string;
  ownerField?: string;
  groupField?: string;
  productField?: string;
  initiativeField?: string;
  releaseField?: string;
  startDateField?: string;
  endDateField?: string;
}

export type DatabaseViewType =
  | "gantt"
  | "calendar"
  | "list"
  | "kanban"
  | "table";
