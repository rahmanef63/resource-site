/**
 * Universal Database Validation Schemas (v2.0)
 *
 * Zod schemas for runtime validation of Universal Database types.
 * Provides type-safe validation with detailed error messages.
 *
 * @see docs/UNIVERSAL_DATABASE_SPEC.md
 */

import { z } from "zod";

// ==========================================
// Property Type Schemas
// ==========================================

/**
 * Property type enum schema
 */
export const PropertyTypeSchema = z.enum([
  // Core properties (14)
  "title",
  "rich_text",
  "number",
  "select",
  "multi_select",
  "date",
  "people",
  "files",
  "checkbox",
  "url",
  "email",
  "relation",
  "rollup",
  "formula",
  // Extended properties (7)
  "status",
  "phone",
  "button",
  "unique_id",
  "place",
  "created_time",
  "created_by",
  "last_edited_time",
  "last_edited_by",
]);

/**
 * View layout enum schema
 */
export const ViewLayoutSchema = z.enum([
  // Existing views (5)
  "table",
  "board",
  "list",
  "timeline",
  "calendar",
  // New views (5)
  "gallery",
  "map",
  "chart",
  "feed",
  "form",
]);

/**
 * Filter operator enum schema
 */
export const FilterOperatorSchema = z.enum([
  "equals",
  "not_equals",
  "contains",
  "not_contains",
  "starts_with",
  "ends_with",
  "is_empty",
  "is_not_empty",
  "greater_than",
  "less_than",
  "greater_than_or_equal",
  "less_than_or_equal",
  "before",
  "after",
  "on_or_before",
  "on_or_after",
  "is_checked",
  "is_not_checked",
]);

// ==========================================
// Filter & Sort Schemas
// ==========================================

/**
 * Filter configuration schema
 */
export const FilterSchema = z.object({
  property: z.string().min(1, "Property key is required"),
  operator: FilterOperatorSchema,
  value: z.any().optional(),
});

/**
 * Sort configuration schema
 */
export const SortSchema = z.object({
  property: z.string().min(1, "Property key is required"),
  direction: z.enum(["ascending", "descending"]),
});

// ==========================================
// Property Options Schemas
// ==========================================

/**
 * Number options schema
 */
export const NumberOptionsSchema = z.object({
  format: z.enum(["number", "percent", "currency"]),
  currency: z.enum(["USD", "EUR", "IDR", "SGD", "GBP", "JPY", "CNY"]).optional(),
  decimals: z.number().int().min(0).max(10).optional(),
});

/**
 * Select choice schema
 */
export const SelectChoiceSchema = z.union([
  z.string(),
  z.object({
    name: z.string(),
    color: z.string().optional(),
    icon: z.string().optional(),
  }),
]);

/**
 * Select options schema
 */
export const SelectOptionsSchema = z.object({
  choices: z.array(SelectChoiceSchema),
});

/**
 * Status group schema
 */
export const StatusGroupSchema = z.object({
  name: z.string().min(1, "Group name is required"),
  color: z.string().optional(),
  options: z.array(z.string()).min(1, "Group must have at least one option"),
});

/**
 * Status options schema
 */
export const StatusOptionsSchema = z.object({
  groups: z.array(StatusGroupSchema).min(1, "Status must have at least one group"),
});

/**
 * Date options schema
 */
export const DateOptionsSchema = z.object({
  allowEnd: z.boolean().optional(),
  timezone: z.string().optional(),
  format: z.enum(["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]).optional(),
});

/**
 * People options schema
 */
export const PeopleOptionsSchema = z.object({
  multi: z.boolean().optional(),
});

/**
 * Files options schema
 */
export const FilesOptionsSchema = z.object({
  accept: z.array(z.string()).optional(),
  maxSize: z.number().positive().optional(),
  maxFiles: z.number().int().positive().optional(),
});

/**
 * Relation options schema
 */
export const RelationOptionsSchema = z.object({
  dbId: z.string().min(1, "Database ID is required for relation"),
  multi: z.boolean().optional(),
  synced: z.boolean().optional(),
});

/**
 * Rollup aggregation schema
 */
export const RollupAggregationSchema = z.enum(["count", "sum", "avg", "min", "max", "unique"]);

/**
 * Rollup options schema
 */
export const RollupOptionsSchema = z.object({
  relationKey: z.string().min(1, "Relation key is required"),
  property: z.string().min(1, "Property is required"),
  aggregation: RollupAggregationSchema,
});

/**
 * Button action schema
 */
export const ButtonActionSchema = z.object({
  do: z.enum(["open_url", "set_property", "add_relation", "create_record", "trigger_webhook"]),
  url: z.string().url().optional(),
  property: z.string().optional(),
  value: z.any().optional(),
  dbId: z.string().optional(),
  webhookUrl: z.string().url().optional(),
});

/**
 * Button options schema
 */
export const ButtonOptionsSchema = z.object({
  actions: z.array(ButtonActionSchema).min(1, "Button must have at least one action"),
  label: z.string().optional(),
  variant: z.enum(["default", "primary", "destructive"]).optional(),
});

/**
 * Unique ID options schema
 */
export const UniqueIdOptionsSchema = z.object({
  prefix: z.string().optional(),
  pad: z.number().int().min(1).max(10).optional(),
  startFrom: z.number().int().min(0).optional(),
});

/**
 * Place options schema
 */
export const PlaceOptionsSchema = z.object({
  geocode: z.boolean().optional(),
  latProp: z.string().optional(),
  lngProp: z.string().optional(),
});

// ==========================================
// View Options Schemas
// ==========================================

/**
 * Table options schema
 */
export const TableOptionsSchema = z.object({
  visibleProps: z.array(z.string()).optional(),
  filters: z.array(FilterSchema).optional(),
  sorts: z.array(SortSchema).optional(),
  wrapLines: z.boolean().optional(),
  density: z.enum(["compact", "comfortable", "spacious"]).optional(),
  frozenColumns: z.number().int().min(0).optional(),
});

/**
 * Board options schema
 */
export const BoardOptionsSchema = z.object({
  groupBy: z.string().min(1, "Board view requires groupBy property"),
  showEmptyGroups: z.boolean().optional(),
  cardCoverProp: z.string().optional(),
  subgroupBy: z.string().optional(),
  cardLayout: z.enum(["default", "compact", "expanded"]).optional(),
});

/**
 * List options schema
 */
export const ListOptionsSchema = z.object({
  visibleProps: z.array(z.string()).optional(),
  dense: z.boolean().optional(),
  showThumbnails: z.boolean().optional(),
});

/**
 * Timeline options schema
 */
export const TimelineOptionsSchema = z.object({
  start: z.string().min(1, "Timeline view requires start property"),
  end: z.string().optional(),
  groupBy: z.string().optional(),
  zoom: z.enum(["day", "week", "month", "quarter", "year"]).optional(),
  showWeekends: z.boolean().optional(),
});

/**
 * Calendar options schema
 */
export const CalendarOptionsSchema = z.object({
  dateProp: z.string().min(1, "Calendar view requires dateProp property"),
  showWeekNumbers: z.boolean().optional(),
  firstDayOfWeek: z.union([z.literal(0), z.literal(1)]).optional(),
  view: z.enum(["month", "week", "day"]).optional(),
});

/**
 * Gallery options schema
 */
export const GalleryOptionsSchema = z.object({
  coverProp: z.string().optional(),
  cardSize: z.enum(["small", "medium", "large"]).optional(),
  showTitle: z.boolean().optional(),
  columns: z.number().int().min(1).max(12).optional(),
  gap: z.number().min(0).optional(),
});

/**
 * Map options schema
 */
export const MapOptionsSchema = z.object({
  placeProp: z.string().min(1, "Map view requires placeProp property"),
  cluster: z.boolean().optional(),
  zoom: z.number().int().min(1).max(20).optional(),
  center: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }).optional(),
});

/**
 * Chart type schema
 */
export const ChartTypeSchema = z.enum(["bar", "line", "area", "pie", "doughnut", "scatter"]);

/**
 * Chart options schema
 */
export const ChartOptionsSchema = z.object({
  chart: z.object({
    type: ChartTypeSchema,
    x: z.string().min(1, "Chart requires x-axis property"),
    y: z.object({
      agg: z.enum(["count", "sum", "avg", "min", "max"]),
      prop: z.string().optional(),
    }),
    stackBy: z.string().optional(),
    colorBy: z.string().optional(),
    showLegend: z.boolean().optional(),
    showGrid: z.boolean().optional(),
  }),
});

/**
 * Feed card config schema
 */
export const FeedCardConfigSchema = z.object({
  title: z.string().min(1, "Feed card requires title property"),
  subtitle: z.string().optional(),
  meta: z.array(z.string()).optional(),
  content: z.string().optional(),
  image: z.string().optional(),
});

/**
 * Feed options schema
 */
export const FeedOptionsSchema = z.object({
  card: FeedCardConfigSchema,
  orderBy: z.object({
    property: z.string(),
    direction: z.enum(["ascending", "descending"]),
  }).optional(),
  groupBy: z.string().optional(),
});

/**
 * Form field schema
 */
export const FormFieldSchema = z.object({
  property: z.string().min(1, "Form field requires property key"),
  required: z.boolean().optional(),
  default: z.any().optional(),
  hidden: z.boolean().optional(),
  placeholder: z.string().optional(),
});

/**
 * Form section schema
 */
export const FormSectionSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  fields: z.array(z.string()).min(1, "Form section must have at least one field"),
});

/**
 * Form options schema
 */
export const FormOptionsSchema = z.object({
  form: z.object({
    title: z.string().min(1, "Form requires title"),
    description: z.string().optional(),
    submitLabel: z.string().optional(),
    fields: z.array(FormFieldSchema).min(1, "Form must have at least one field"),
    layout: z.object({
      columns: z.number().int().min(1).max(4).optional(),
      sections: z.array(FormSectionSchema).optional(),
    }).optional(),
    onSubmit: z.object({
      action: z.enum(["create", "update", "redirect"]),
      redirect: z.string().url().optional(),
      message: z.string().optional(),
    }).optional(),
  }),
});

// ==========================================
// Core Schemas
// ==========================================

/**
 * Property schema with type-specific validation
 */
export const PropertySchema = z.object({
  key: z.string().min(1, "Property key is required"),
  name: z.string().min(1, "Property name is required"),
  type: PropertyTypeSchema,
  options: z.any().optional(),
  description: z.string().optional(),
  isRequired: z.boolean().optional(),
  isPrimary: z.boolean().optional(),
  position: z.number().int().min(0).optional(),
});

/**
 * View schema with layout-specific validation
 */
export const ViewSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "View name is required"),
  layout: ViewLayoutSchema,
  description: z.string().optional(),
  visibleProps: z.array(z.string()).optional(),
  filters: z.array(FilterSchema).optional(),
  sorts: z.array(SortSchema).optional(),
  groupBy: z.string().optional(),
  options: z.any().optional(),
  isDefault: z.boolean().optional(),
  position: z.number().int().min(0).optional(),
  createdBy: z.string().optional(),
  createdTime: z.number().optional(),
});

/**
 * Row schema
 */
export const RowSchema = z.object({
  id: z.string().min(1, "Row ID is required"),
  properties: z.any(),
  position: z.number().int().min(0).optional(),
  createdBy: z.string().optional(),
  createdTime: z.number().optional(),
  lastEditedBy: z.string().optional(),
  lastEditedTime: z.number().optional(),
});

/**
 * Database settings schema
 */
export const DatabaseSettingsSchema = z.object({
  showProperties: z.boolean().optional(),
  wrapCells: z.boolean().optional(),
  showCalculations: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  isTemplate: z.boolean().optional(),
});

/**
 * Database spec schema
 */
export const DatabaseSpecSchema = z.object({
  id: z.string().min(1, "Database ID is required"),
  name: z.string().min(1, "Database name is required"),
  description: z.string().optional(),
  icon: z.string().optional(),
  coverUrl: z.string().optional(),
  workspaceId: z.string().optional(),
  properties: z.array(PropertySchema).min(1, "Database must have at least one property"),
  views: z.array(ViewSchema).min(1, "Database must have at least one view"),
  rows: z.array(RowSchema),
  createdBy: z.string().optional(),
  createdTime: z.number().optional(),
  lastEditedBy: z.string().optional(),
  lastEditedTime: z.number().optional(),
  settings: DatabaseSettingsSchema.optional(),
}).refine(
  (db) => {
    // Validate that at least one property is primary
    const primaryProps = db.properties.filter(p => p.isPrimary);
    return primaryProps.length >= 1;
  },
  {
    message: "Database must have at least one primary property",
  }
).refine(
  (db) => {
    // Validate that only one property is primary
    const primaryProps = db.properties.filter(p => p.isPrimary);
    return primaryProps.length <= 1;
  },
  {
    message: "Database can only have one primary property",
  }
).refine(
  (db) => {
    // Validate that at least one view is default
    const defaultViews = db.views.filter(v => v.isDefault);
    return defaultViews.length >= 1;
  },
  {
    message: "Database must have at least one default view",
  }
).refine(
  (db) => {
    // Validate that only one view is default
    const defaultViews = db.views.filter(v => v.isDefault);
    return defaultViews.length <= 1;
  },
  {
    message: "Database can only have one default view",
  }
);

/**
 * Universal Database schema (v2.0)
 */
export const UniversalDatabaseSchema = z.object({
  schemaVersion: z.literal("2.0"),
  db: DatabaseSpecSchema,
});

// ==========================================
// Validation Helper Functions
// ==========================================

/**
 * Validate a Universal Database with detailed error reporting
 */
export function validateUniversalDatabase(data: unknown) {
  return UniversalDatabaseSchema.safeParse(data);
}

/**
 * Validate a Property with detailed error reporting
 */
export function validateProperty(data: unknown) {
  return PropertySchema.safeParse(data);
}

/**
 * Validate a View with detailed error reporting
 */
export function validateView(data: unknown) {
  return ViewSchema.safeParse(data);
}

/**
 * Validate a Row with detailed error reporting
 */
export function validateRow(data: unknown) {
  return RowSchema.safeParse(data);
}

/**
 * Type inference helpers
 */
export type InferredProperty = z.infer<typeof PropertySchema>;
export type InferredView = z.infer<typeof ViewSchema>;
export type InferredRow = z.infer<typeof RowSchema>;
export type InferredDatabaseSpec = z.infer<typeof DatabaseSpecSchema>;
export type InferredUniversalDatabase = z.infer<typeof UniversalDatabaseSchema>;
