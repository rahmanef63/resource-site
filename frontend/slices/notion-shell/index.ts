/** notion-shell — portable Notion-style primitives.
 *
 *  Pure / props-driven · callback-based CRUD · no store reach-arounds.
 *  Drop any of these into any React surface and wire the callbacks to
 *  your own data source. Pair with notion-blocks for the four editor
 *  block primitives (equation, code, notify, drag-fill grid).
 *
 *  Composition:
 *    <NotionPage>             — page shell w/ header + body slot
 *      <NotionHeader>         — editable icon + title
 *      …user blocks
 *        <NotionBlock>        — single-block renderer (dispatches via prop registry,
 *                               live inline-markdown decorator, hover actions menu)
 *      <InsertBlockButton>    — "+" trigger w/ SlashMenu popover
 *      …embedded data
 *        <NotionDatabase>     — full DB surface w/ ViewTabs + ViewOptions + 6 views
 *          <NotionProperty>   — value + schema editor (per-cell)
 *
 *    <NotionSidebar>          — tree nav w/ page CRUD (standalone) */

export { NotionPage, type NotionPageProps } from "./components/NotionPage";
export { NotionHeader, type NotionHeaderProps } from "./components/NotionHeader";
export { NotionSidebar, type NotionSidebarProps, type NotionSidebarPage } from "./components/NotionSidebar";
export { NotionBlock, type NotionBlockProps } from "./components/NotionBlock";
export { NotionDatabase, type NotionDatabaseProps } from "./components/NotionDatabase";
export { NotionProperty, type NotionPropertyProps } from "./components/NotionProperty";
export { SlashMenu, type SlashMenuProps } from "./components/SlashMenu";
export { BlockActionsMenu, type BlockActionsMenuProps } from "./components/BlockActionsMenu";
export { InsertBlockButton, type InsertBlockButtonProps } from "./components/InsertBlockButton";
export { ViewTabs, type ViewTabsProps } from "./components/ViewTabs";
export { ViewOptions, type ViewOptionsProps } from "./components/ViewOptions";
export { ColumnHeaderMenu, type ColumnHeaderMenuProps } from "./components/ColumnHeaderMenu";
export { renderPropertyCell } from "./components/property-cells";
export {
  VIEW_REGISTRY,
  TableView, BoardView, ListView, GalleryView, CalendarView, FeedView,
  type ViewRegistry, type ViewProps,
} from "./components/views";
export {
  SortableBlockList,
  type SortableBlockListProps,
  type SortableBlockDragProps,
} from "./components/SortableBlockList";
export { PageActionsMenu, type PageActionsMenuProps } from "./components/PageActionsMenu";
export { ImageRenderer } from "./components/blocks/ImageRenderer";
export { EmbedRenderer } from "./components/blocks/EmbedRenderer";
export { TOP_LEVEL_PLACEHOLDERS } from "./components/placeholders";

export { BLOCK_SPECS, specFor, type BlockSpec } from "./lib/blockSpecs";
export { tokenizeInline, stripMd, type Token } from "./lib/inlineMd";
export {
  decorateInPlace,
  decorateLineToFragment,
  getCaretOffset,
  setCaretAtOffset,
  visibleLength,
} from "./lib/inlineDecorator";
export { applyView, groupBy, bucketByDate } from "./lib/viewData";

export type {
  Block, BlockType, BlockRenderers, BlockRendererProps,
  Page,
  Property, PropertyValue, PropertyType, SelectOption, NumberFormat,
  Database, DatabaseViewConfig, DatabaseFilter, DatabaseSort, DbView,
} from "./types";
