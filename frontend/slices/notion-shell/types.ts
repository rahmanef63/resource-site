/** notion-shell domain types — portable subset of nosion's domain. */

import type { ReactNode } from "react";
import type { Block } from "./block-types";

export type { Block, BlockType, BlockRenderers, BlockRendererProps } from "./block-types";

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
  /** Author + last-editor user ids — `created_by` / `last_edited_by` cells. */
  createdBy?: string;
  lastEditedBy?: string;
  /** When set, this page is a row in a database — `rowProps` carries the cell values. */
  rowOfDatabaseId?: string;
  rowProps?: Record<string, PropertyValue>;
  smallText?: boolean;
  fullWidth?: boolean;
}

export type PropertyType =
  | "text" | "number" | "select" | "multi_select" | "status"
  | "date" | "checkbox" | "url" | "email" | "phone"
  | "person" | "files" | "formula"
  | "created_time" | "last_edited_time" | "unique_id"
  | "created_by" | "last_edited_by"
  | "relation" | "rollup";

/** Rollup aggregation kinds. Determines how a rollup folds the values
 *  pulled from its relation's target property. */
export type RollupAggregate =
  | "count" | "count_unique" | "values"
  | "sum" | "avg" | "min" | "max"
  | "earliest" | "latest"
  | "checked" | "percent_checked";

// PROPERTY_TYPE_META + derived lists live in ./property-type-meta.ts.

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
  /** Formula expression — `{{prop}}` interpolation + fn(). type=formula. */
  formulaExpression?: string;
  /** Prefix for unique_id — e.g. "BUG" → "BUG-001". type=unique_id. */
  uniqueIdPrefix?: string;
  /** Target database for a relation cell. `null` / unset = "any database
   *  row". type=relation. */
  relationDatabaseId?: string | null;
  /** Relation property id this rollup pulls linked rows from. type=rollup. */
  rollupRelationPropertyId?: string | null;
  /** Property id on the relation's target database whose values get
   *  aggregated. Unset = aggregate page titles. type=rollup. */
  rollupTargetPropertyId?: string | null;
  /** Aggregation fold. Defaults to "count". type=rollup. */
  rollupAggregate?: RollupAggregate;
}

export type PropertyValue =
  | string | number | boolean | null
  | string[]
  | { date?: string; end?: string; time?: string; endTime?: string };

export type DbView =
  | "table" | "board" | "list" | "gallery" | "calendar" | "feed"
  | "chart" | "dashboard" | "form" | "map" | "timeline";

export type ChartKind = "bar" | "line" | "area" | "pie" | "donut";
export type ChartAggregate = "count" | "sum" | "avg" | "min" | "max";

import type { CalcKind } from "./calc-types";
export type { CalcKind };

/** Filter operators, grouped by intended property type. The viewData
 *  matcher tolerates op/type mismatches (returns true) so legacy
 *  configs keep working when a property type changes. */
export type DatabaseFilterOp =
  // text / shared
  | "contains" | "does_not_contain" | "starts_with" | "ends_with"
  | "equals" | "not_equals"
  | "is_empty" | "not_empty"
  // checkbox
  | "checked" | "unchecked"
  // number
  | "gt" | "lt" | "gte" | "lte" | "between"
  // date
  | "before" | "after" | "on" | "is_today" | "past_week" | "next_week"
  // select / multi-select
  | "is_any_of" | "is_none_of";

export interface DatabaseFilter {
  propertyId: string;
  op: DatabaseFilterOp;
  /** Operand encoding:
   *   - text/number/date single ops: plain string
   *   - "between": "min|max" (numbers) or "ISO|ISO" (dates)
   *   - "is_any_of" / "is_none_of": "id1,id2,id3" (select option ids)
   *   - is_empty / not_empty / checked / unchecked / is_today / past_week / next_week: ignored
   */
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
  /** Per-view hidden property ids (independent of any global flag). */
  hiddenPropIds?: string[];
  /** Table view footer per-column aggregate. Unset / "none" hides cell. */
  tableCalcs?: Record<string, CalcKind>;
  chartKind?: ChartKind;
  chartXProp?: string;
  chartYProp?: string;
  chartAggregate?: ChartAggregate;
  chartPalette?: "warm" | "cool" | "rainbow" | "mono";
  chartDecimals?: number;
  chartShowGrid?: boolean;
  chartShowLegend?: boolean;
  chartShowValues?: boolean;
  chartSortBy?: "name" | "value";
  chartSortDir?: "asc" | "desc";
  chartTopN?: number;
  chartXLabel?: string;
  chartYLabel?: string;
  chartTitle?: string;
  chartHeight?: "small" | "medium" | "large";
  mapLatProp?: string;
  mapLngProp?: string;
  mapPinColorProp?: string;
  mapShowList?: boolean;
  formRequiredProps?: string[];
  formShownProps?: string[];
  formSuccessMessage?: string;
  formTitle?: string;
  formDescription?: string;
  dashboardKPIs?: string[];
  dashboardBreakdowns?: string[];
  dashboardRecentLimit?: number;
  feedTimestamp?: "createdAt" | "updatedAt";
  timelineStartProp?: string;
  timelineEndProp?: string;
  timelineColorByProp?: string;
  timelineZoom?: "day" | "week" | "month" | "quarter";
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
  /** Atomic counter for unique_id properties — increments on each new row.
   *  Read-only at the cell layer; host owns the bump. */
  uniqueIdCounter?: number;
}

export type ActionsSlot = ReactNode;
