/** database-json — domain types re-exported from notion-database.
 *  Same indirection pattern as database-csv so internal files use
 *  `../types` (relative-within-slice) instead of crossing the slice
 *  boundary at every call site. */

export type {
  Database,
  DatabaseViewConfig,
  Page,
  Property,
  PropertyType,
  PropertyValue,
  SelectOption,
} from "@/features/notion-database";
