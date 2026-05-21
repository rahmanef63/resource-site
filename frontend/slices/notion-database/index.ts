/** notion-database — portable Notion-style database surface.
 *
 *  Pure / props-driven · callback-based CRUD · no store reach-arounds.
 *  Optional companion to notion-shell — install notion-shell alone for
 *  pages + sidebar + block editor, add notion-database when you want
 *  embedded databases with table / board / list / gallery / calendar /
 *  feed views, filter + sort + search + column-header menu, and per-
 *  property cell renderers.
 *
 *  Composition:
 *    <NotionDatabase>          — full DB surface
 *      <ViewTabs>              — switch between views
 *      <ViewOptions>           — sort + filter + search popover
 *      <ColumnHeaderMenu>      — per-column actions
 *      <NotionProperty>        — value + schema editor (per-cell)
 *      VIEW_REGISTRY[view]     — renders the active view
 *
 *  Use embedded inside a NotionBlock (type="database") OR as a
 *  standalone page surface.
 */

export { NotionDatabase, type NotionDatabaseProps } from "./components/NotionDatabase";
export { NotionProperty, type NotionPropertyProps } from "./components/NotionProperty";
export { ViewTabs, type ViewTabsProps } from "./components/ViewTabs";
export { ViewOptions, type ViewOptionsProps } from "./components/ViewOptions";
export { ColumnHeaderMenu, type ColumnHeaderMenuProps } from "./components/ColumnHeaderMenu";
export { renderPropertyCell } from "./components/property-cells";
export {
  VIEW_REGISTRY,
  TableView, BoardView, ListView, GalleryView, CalendarView, FeedView,
  type ViewRegistry, type ViewProps,
} from "./components/views";
export { applyView, groupBy, bucketByDate } from "./lib/viewData";

// Re-export domain types for convenience (source of truth is notion-shell).
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
} from "./types";
