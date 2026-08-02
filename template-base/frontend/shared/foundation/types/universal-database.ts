/**
 * Universal Database Types (v2.0)
 *
 * Vendor-neutral type definitions for Notion-like database functionality.
 * Supports 21 property types, 10 view layouts, and complete CRUD operations.
 *
 * @see docs/UNIVERSAL_DATABASE_SPEC.md
 */

// ==========================================
// Property Types (21 total)
// ==========================================

/**
 * All supported property types
 * - Core (14): Basic property types from v1
 * - Extended (7): New property types in v2
 */
export type PropertyType =
  // Core properties (14)
  | "title"              // Primary text field
  | "text"               // Formatted text with markdown
  | "rich_text"          // Legacy alias for formatted text
  | "number"             // Numeric values with formatting
  | "select"             // Single choice from options
  | "multi_select"       // Multiple choices
  | "date"               // Date/date range
  | "people"             // User references
  | "files"              // File attachments
  | "checkbox"           // Boolean value
  | "url"                // Web link
  | "email"              // Email address
  | "relation"           // Link to other database
  | "rollup"             // Aggregate from relation
  | "formula"            // Computed value
  // Extended properties (7)
  | "status"             // Structured enum with groups
  | "phone"              // Phone number
  | "button"             // Trigger actions
  | "unique_id"          // Auto-generated ID with prefix
  | "place"              // Address/location (for Map views)
  | "created_time"       // Auto timestamp
  | "created_by"         // Auto user reference
  | "last_edited_time"   // Auto timestamp
  | "last_edited_by";    // Auto user reference

// ==========================================
// View Layouts (10 total)
// ==========================================

/**
 * All supported view layouts
 * - Existing (5): From v1
 * - New (5): Added in v2
 */
export type ViewLayout =
  // Existing views (5)
  | "table"      // Spreadsheet-like grid
  | "board"      // Kanban board
  | "list"       // Compact list view
  | "timeline"   // Gantt-style timeline
  | "calendar"   // Calendar grid
  // New views (5)
  | "gallery"    // Card grid with cover images
  | "map"        // Geographic visualization
  | "chart"      // Data visualization
  | "feed"       // Social media-style stream
  | "form";      // Form builder for data entry

// ==========================================
// Filter & Sort
// ==========================================

/**
 * Filter operators for querying data
 */
export type FilterOperator =
  | "equals"
  | "not_equals"
  | "contains"
  | "not_contains"
  | "starts_with"
  | "ends_with"
  | "is_empty"
  | "is_not_empty"
  | "greater_than"
  | "less_than"
  | "greater_than_or_equal"
  | "less_than_or_equal"
  | "before"
  | "after"
  | "on_or_before"
  | "on_or_after"
  | "is_checked"
  | "is_not_checked";

/**
 * Filter configuration
 */
export interface Filter {
  /** Property key to filter on */
  property: string;
  /** Filter operator */
  operator: FilterOperator;
  /** Filter value (optional for some operators like is_empty) */
  value?: any;
}

/**
 * Sort configuration
 */
export interface Sort {
  /** Property key to sort by */
  property: string;
  /** Sort direction */
  direction: "ascending" | "descending";
}

// ==========================================
// Property Options (Type-specific)
// ==========================================

/**
 * Number formatting options
 */
export interface NumberOptions {
  format: "number" | "percent" | "currency";
  currency?: "USD" | "EUR" | "IDR" | "SGD" | "GBP" | "JPY" | "CNY";
  decimals?: number;
}

/**
 * Select/Multi-select choice
 */
export interface SelectChoice {
  name: string;
  color?: string;
  icon?: string;
}

/**
 * Select options
 */
export interface SelectOptions {
  choices: Array<string | SelectChoice>;
}

/**
 * Status group configuration
 */
export interface StatusGroup {
  name: string;
  color?: string;
  options: string[];
}

/**
 * Status options
 */
export interface StatusOptions {
  groups: StatusGroup[];
}

/**
 * Date formatting options
 */
export interface DateOptions {
  allowEnd?: boolean;
  timezone?: string;
  format?: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
}

/**
 * People options
 */
export interface PeopleOptions {
  multi?: boolean;
}

/**
 * File upload options
 */
export interface FilesOptions {
  accept?: string[];
  maxSize?: number;
  maxFiles?: number;
}

/**
 * Relation options
 */
export interface RelationOptions {
  dbId: string;
  multi?: boolean;
  synced?: boolean;
}

/**
 * Rollup aggregation type
 */
export type RollupAggregation = "count" | "sum" | "avg" | "min" | "max" | "unique";

/**
 * Rollup options
 */
export interface RollupOptions {
  relationKey: string;
  property: string;
  aggregation: RollupAggregation;
}

/**
 * Button action types
 */
export type ButtonAction = {
  do: "open_url" | "set_property" | "add_relation" | "create_record" | "trigger_webhook";
  url?: string;
  property?: string;
  value?: any;
  dbId?: string;
  webhookUrl?: string;
};

/**
 * Button options
 */
export interface ButtonOptions {
  actions: ButtonAction[];
  label?: string;
  variant?: "default" | "primary" | "destructive";
}

/**
 * Unique ID options
 */
export interface UniqueIdOptions {
  prefix?: string;
  pad?: number;
  startFrom?: number;
}

/**
 * Place/location options
 */
export interface PlaceOptions {
  geocode?: boolean;
  latProp?: string;
  lngProp?: string;
}

/**
 * Union of all property options
 */
export type PropertyOptions =
  | NumberOptions
  | SelectOptions
  | StatusOptions
  | DateOptions
  | PeopleOptions
  | FilesOptions
  | RelationOptions
  | RollupOptions
  | ButtonOptions
  | UniqueIdOptions
  | PlaceOptions
  | Record<string, any>;

// ==========================================
// View Options (Layout-specific)
// ==========================================

/**
 * Table view options
 */
export interface TableOptions {
  visibleProps?: string[];
  filters?: Filter[];
  sorts?: Sort[];
  wrapLines?: boolean;
  density?: "compact" | "comfortable" | "spacious";
  frozenColumns?: number;
}

/**
 * Board view options
 */
export interface BoardOptions {
  groupBy: string;
  showEmptyGroups?: boolean;
  cardCoverProp?: string;
  subgroupBy?: string;
  cardLayout?: "default" | "compact" | "expanded";
}

/**
 * List view options
 */
export interface ListOptions {
  visibleProps?: string[];
  dense?: boolean;
  showThumbnails?: boolean;
}

/**
 * Timeline view options
 */
export interface TimelineOptions {
  start: string;
  end?: string;
  groupBy?: string;
  zoom?: "day" | "week" | "month" | "quarter" | "year";
  showWeekends?: boolean;
}

/**
 * Calendar view options
 */
export interface CalendarOptions {
  dateProp: string;
  showWeekNumbers?: boolean;
  firstDayOfWeek?: 0 | 1;
  view?: "month" | "week" | "day";
}

/**
 * Gallery view options
 */
export interface GalleryOptions {
  coverProp?: string;
  cardSize?: "small" | "medium" | "large";
  showTitle?: boolean;
  columns?: number;
  gap?: number;
}

/**
 * Map view options
 */
export interface MapOptions {
  placeProp: string;
  cluster?: boolean;
  zoom?: number;
  center?: { lat: number; lng: number };
}

/**
 * Chart types
 */
export type ChartType = "bar" | "line" | "area" | "pie" | "doughnut" | "scatter";

/**
 * Chart view options
 */
export interface ChartOptions {
  chart: {
    type: ChartType;
    x: string;
    y: {
      agg: "count" | "sum" | "avg" | "min" | "max";
      prop?: string;
    };
    stackBy?: string;
    colorBy?: string;
    showLegend?: boolean;
    showGrid?: boolean;
  };
}

/**
 * Feed card configuration
 */
export interface FeedCardConfig {
  title: string;
  subtitle?: string;
  meta?: string[];
  content?: string;
  image?: string;
}

/**
 * Feed view options
 */
export interface FeedOptions {
  card: FeedCardConfig;
  orderBy?: {
    property: string;
    direction: "ascending" | "descending";
  };
  groupBy?: string;
}

/**
 * Form field configuration
 */
export interface FormField {
  property: string;
  required?: boolean;
  default?: any;
  hidden?: boolean;
  placeholder?: string;
}

/**
 * Form section configuration
 */
export interface FormSection {
  title: string;
  description?: string;
  fields: string[];
}

/**
 * Form view options
 */
export interface FormOptions {
  form: {
    title: string;
    description?: string;
    submitLabel?: string;
    fields: FormField[];
    layout?: {
      columns?: number;
      sections?: FormSection[];
    };
    onSubmit?: {
      action: "create" | "update" | "redirect";
      redirect?: string;
      message?: string;
    };
  };
}

/**
 * Union of all view options
 */
export type ViewOptions =
  | TableOptions
  | BoardOptions
  | ListOptions
  | TimelineOptions
  | CalendarOptions
  | GalleryOptions
  | MapOptions
  | ChartOptions
  | FeedOptions
  | FormOptions
  | Record<string, any>;

// ==========================================
// Core Interfaces
// ==========================================

/**
 * Property definition (column/field)
 */
export interface Property {
  /** Unique identifier */
  key: string;
  /** Display name */
  name: string;
  /** Property type */
  type: PropertyType;
  /** Type-specific options */
  options?: PropertyOptions;
  /** Help text */
  description?: string;
  /** Validation requirement */
  isRequired?: boolean;
  /** Primary field indicator */
  isPrimary?: boolean;
  /** Display order */
  position?: number;
}

/**
 * View definition (layout)
 */
export interface View {
  /** Unique identifier (optional, auto-generated) */
  id?: string;
  /** Display name */
  name: string;
  /** View layout type */
  layout: ViewLayout;
  /** Help text */
  description?: string;
  /** Visible property keys */
  visibleProps?: string[];
  /** Filter configurations */
  filters?: Filter[];
  /** Sort configurations */
  sorts?: Sort[];
  /** Group by property key */
  groupBy?: string;
  /** Layout-specific options */
  options?: ViewOptions;
  /** Default view indicator */
  isDefault?: boolean;
  /** Display order */
  position?: number;
  /** Creator user ID */
  createdBy?: string;
  /** Creation timestamp */
  createdTime?: number;
}

/**
 * Row/record in database
 */
export interface Row {
  /** Unique identifier */
  id: string;
  /** Property key-value pairs */
  properties: Record<string, any>;
  /** Display order */
  position?: number;
  /** Creator user ID */
  createdBy?: string;
  /** Creation timestamp */
  createdTime?: number;
  /** Last editor user ID */
  lastEditedBy?: string;
  /** Last edit timestamp */
  lastEditedTime?: number;
}

/**
 * Database settings
 */
export interface DatabaseSettings {
  /** Show property panel */
  showProperties?: boolean;
  /** Wrap cell content */
  wrapCells?: boolean;
  /** Show calculation row */
  showCalculations?: boolean;
  /** Public access */
  isPublic?: boolean;
  /** Template database */
  isTemplate?: boolean;
}

/**
 * Database specification
 */
export interface DatabaseSpec {
  /** Database ID */
  id: string;
  /** Database name */
  name: string;
  /** Description */
  description?: string;
  /** Icon (emoji or URL) */
  icon?: string;
  /** Cover image URL */
  coverUrl?: string;
  /** Workspace context */
  workspaceId?: string;
  /** Property definitions */
  properties: Property[];
  /** View definitions */
  views: View[];
  /** Row data */
  rows: Row[];
  /** Creator user ID */
  createdBy?: string;
  /** Creation timestamp */
  createdTime?: number;
  /** Last editor user ID */
  lastEditedBy?: string;
  /** Last edit timestamp */
  lastEditedTime?: number;
  /** Database settings */
  settings?: DatabaseSettings;
}

/**
 * Universal Database format (v2.0)
 * Top-level wrapper with schema version
 */
export interface UniversalDatabase {
  /** Schema version for compatibility */
  schemaVersion: "2.0";
  /** Database specification */
  db: DatabaseSpec;
}

// ==========================================
// Helper Types
// ==========================================

/**
 * Type guard to check if value is a valid PropertyType
 */
export function isPropertyType(value: string): value is PropertyType {
  const validTypes: PropertyType[] = [
    "title", "text", "number", "select", "multi_select",
    "date", "people", "files", "checkbox", "url", "email",
    "relation", "rollup", "formula", "status", "phone",
    "button", "unique_id", "place",
    "created_time", "created_by", "last_edited_time", "last_edited_by"
  ];
  return validTypes.includes(value as PropertyType);
}

/**
 * Type guard to check if value is a valid ViewLayout
 */
export function isViewLayout(value: string): value is ViewLayout {
  const validLayouts: ViewLayout[] = [
    "table", "board", "list", "timeline", "calendar",
    "gallery", "map", "chart", "feed", "form"
  ];
  return validLayouts.includes(value as ViewLayout);
}

/**
 * Type guard to check if value is a valid FilterOperator
 */
export function isFilterOperator(value: string): value is FilterOperator {
  const validOperators: FilterOperator[] = [
    "equals", "not_equals", "contains", "not_contains",
    "starts_with", "ends_with", "is_empty", "is_not_empty",
    "greater_than", "less_than", "greater_than_or_equal", "less_than_or_equal",
    "before", "after", "on_or_before", "on_or_after",
    "is_checked", "is_not_checked"
  ];
  return validOperators.includes(value as FilterOperator);
}

/**
 * Extract property types by category
 */
export const PropertyTypeCategories = {
  core: [
    "title", "text", "number", "select", "multi_select",
    "date", "people", "files", "checkbox", "url", "email",
    "relation", "rollup", "formula"
  ] as const,
  extended: [
    "status", "phone", "button", "unique_id", "place"
  ] as const,
  auto: [
    "created_time", "created_by", "last_edited_time", "last_edited_by"
  ] as const
} as const;

/**
 * Extract view layouts by category
 */
export const ViewLayoutCategories = {
  existing: ["table", "board", "list", "timeline", "calendar"] as const,
  new: ["gallery", "map", "chart", "feed", "form"] as const
} as const;

/**
 * Re-export Property Options types for convenience
 */
export * from "./property-options";

/**
 * Re-export View Options types for convenience
 */
export * from "./view-options";
