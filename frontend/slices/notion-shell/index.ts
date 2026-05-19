/** notion-shell — portable Notion-style primitives.
 *
 *  Pure / props-driven · callback-based CRUD · no store reach-arounds.
 *  Drop any of these into any React surface and wire the callbacks to
 *  your own data source. Pair with notion-blocks for the four editor
 *  block primitives (equation, code, notify, drag-fill grid).
 *
 *  Composition:
 *    <NotionPage>           — page shell w/ header + body slot
 *      <NotionHeader>       — editable icon + title
 *      …user blocks
 *        <NotionBlock>      — single-block renderer (dispatches via prop registry)
 *      …embedded data
 *        <NotionDatabase>   — table view w/ property + row CRUD
 *          <NotionProperty> — value + schema editor (per-cell)
 *
 *    <NotionSidebar>        — tree nav w/ page CRUD (standalone) */

export { NotionPage, type NotionPageProps } from "./components/NotionPage";
export { NotionHeader, type NotionHeaderProps } from "./components/NotionHeader";
export { NotionSidebar, type NotionSidebarProps, type NotionSidebarPage } from "./components/NotionSidebar";
export { NotionBlock, type NotionBlockProps } from "./components/NotionBlock";
export { NotionDatabase, type NotionDatabaseProps } from "./components/NotionDatabase";
export { NotionProperty, type NotionPropertyProps } from "./components/NotionProperty";
export { TOP_LEVEL_PLACEHOLDERS } from "./components/placeholders";

export type {
  Block, BlockType, BlockRenderers, BlockRendererProps,
  Page,
  Property, PropertyValue, PropertyType, SelectOption, NumberFormat,
  Database, DatabaseViewConfig, DatabaseFilter, DatabaseSort, DbView,
} from "./types";
