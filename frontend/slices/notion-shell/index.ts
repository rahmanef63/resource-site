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

// CI-wave (2026-05-21) — database surface split out into the
// `notion-database` slice. notion-shell is now PURE shell: page +
// header + block + sidebar + slash menu + actions + sortable list.
// For embedded databases (TableView / BoardView / ListView /
// GalleryView / CalendarView / FeedView), add the notion-database
// peer slice. Domain types (Database / Property / PropertyValue /
// DbView / DatabaseViewConfig / etc.) remain here as the single
// source of truth — Page references them via `rowOfDatabaseId` +
// `rowProps`.

export { NotionPage, type NotionPageProps } from "./components/NotionPage";
export { NotionHeader, type NotionHeaderProps } from "./components/NotionHeader";
export { NotionSidebar, type NotionSidebarProps, type NotionSidebarPage } from "./components/NotionSidebar";
export { NotionBlock, type NotionBlockProps } from "./components/NotionBlock";
export { focusBlock } from "./lib/focusBlock";
export { SlashMenu, type SlashMenuProps } from "./components/SlashMenu";
export { BlockActionsMenu, type BlockActionsMenuProps } from "./components/BlockActionsMenu";
export { InsertBlockButton, type InsertBlockButtonProps } from "./components/InsertBlockButton";
export {
  SortableBlockList,
  type SortableBlockListProps,
  type SortableBlockDragProps,
} from "./components/SortableBlockList";
export { PageActionsMenu, type PageActionsMenuProps } from "./components/PageActionsMenu";
export { PageLayoutSection, type PageLayoutSectionProps, type PageFont } from "./components/PageLayoutSection";
export { PageBreadcrumbs, type PageBreadcrumbsProps, type Crumb } from "./components/PageBreadcrumbs";
export { Subpages, SubpageIcon, type SubpagesProps, type SubpageItem } from "./components/Subpages";
export { InlineFormatToolbar } from "./components/InlineFormatToolbar";
export { MentionTypeahead, type MentionTypeaheadProps, type Mentionable } from "./components/MentionTypeahead";
export { wrapSelection } from "./lib/selectionFormat";
export { TocBlock, type TocBlockProps, type TocHeading } from "./components/blocks/TocBlock";
export { collectHeadings } from "./lib/collectHeadings";
export { BlockColorPicker } from "./components/BlockColorPicker";
export { BLOCK_COLORS, blockColorClass, type BlockColor } from "./lib/blockColors";
export { ImageRenderer } from "./components/blocks/ImageRenderer";
export { EmbedRenderer } from "./components/blocks/EmbedRenderer";
export { CalloutBlock } from "./components/blocks/CalloutBlock";
export { TableBlock } from "./components/blocks/TableBlock";
export { DividerBlock } from "./components/blocks/DividerBlock";
export { VideoBlock, AudioBlock } from "./components/blocks/MediaBlock";
export { PageLinkBlock } from "./components/blocks/PageLinkBlock";
export { ButtonBlock } from "./components/blocks/ButtonBlock";
export { makeToggleBlock } from "./components/blocks/ToggleBlock";
export { makeColumnsBlock } from "./components/blocks/ColumnsBlock";
export { EditableLine } from "./components/blocks/EditableLine";
export {
  createDefaultBlockRenderers,
  type DefaultBlockRendererOpts,
} from "./lib/defaultBlockRenderers";
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

export type {
  Block, BlockType, BlockRenderers, BlockRendererProps,
  Page,
  Property, PropertyValue, PropertyType, SelectOption, NumberFormat,
  Database, DatabaseViewConfig, DatabaseFilter, DatabaseFilterOp, DatabaseSort, DbView,
  ChartKind, ChartAggregate, CalcKind,
  RollupAggregate,
} from "./types";

export type { PropertyTypeMeta } from "./property-type-meta";
export {
  PROPERTY_TYPE_META,
  PROPERTY_TYPES_USER_ADDABLE,
  PROPERTY_TYPES_CSV_IMPORTABLE,
} from "./property-type-meta";
