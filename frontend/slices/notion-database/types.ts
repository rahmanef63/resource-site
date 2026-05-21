/** notion-database — domain types re-exported from notion-shell.
 *
 *  Database types (Database, Property, PropertyValue, DbView,
 *  DatabaseViewConfig, DatabaseFilter, DatabaseSort) live in
 *  notion-shell because the Page type references them
 *  (`rowOfDatabaseId`, `rowProps`) — keeping the domain model
 *  in a single source avoids circular shell↔database imports.
 *
 *  This file is a CONVENIENCE barrel — notion-database internals
 *  + consumers can import from "../types" / "@/features/notion-database"
 *  without having to know the types physically reside in notion-shell.
 *
 *  Slice peer: notion-shell (declared in slice.contract.ts).
 */

export type {
  Database,
  DatabaseFilter,
  DatabaseSort,
  DatabaseViewConfig,
  DbView,
  NumberFormat,
  Page,
  Property,
  PropertyType,
  PropertyValue,
  SelectOption,
} from "@/features/notion-shell";
