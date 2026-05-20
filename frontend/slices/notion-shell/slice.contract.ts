/**
 * notion-shell — portable Notion-style wrapper primitives.
 *
 * Pure / props-driven · callback-based CRUD · no store reach-arounds.
 * Pair with notion-blocks for the four editor block primitives.
 */

import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "notion-shell",
  version: "0.3.0",
  category: "ui",
  kind: "ui",
  provides: {
    components: [
      "NotionPage", "NotionHeader", "NotionSidebar",
      "NotionBlock", "NotionDatabase", "NotionProperty",
      "SlashMenu", "BlockActionsMenu", "InsertBlockButton",
      "ViewTabs", "ViewOptions", "ColumnHeaderMenu",
      "TableView", "BoardView", "ListView", "GalleryView", "CalendarView", "FeedView",
    ],
    utils: [
      "TOP_LEVEL_PLACEHOLDERS",
      "BLOCK_SPECS", "specFor",
      "tokenizeInline", "stripMd",
      "decorateInPlace", "decorateLineToFragment",
      "getCaretOffset", "setCaretAtOffset", "visibleLength",
      "applyView", "groupBy", "bucketByDate",
      "renderPropertyCell",
      "VIEW_REGISTRY",
    ],
    hooks: [],
    types: [
      "NotionPageProps", "NotionHeaderProps", "NotionSidebarProps", "NotionSidebarPage",
      "NotionBlockProps", "NotionDatabaseProps", "NotionPropertyProps",
      "SlashMenuProps", "BlockActionsMenuProps", "InsertBlockButtonProps",
      "ViewTabsProps", "ViewOptionsProps", "ColumnHeaderMenuProps",
      "ViewRegistry", "ViewProps",
      "BlockSpec", "Token",
      "Block", "BlockType", "BlockRenderers", "BlockRendererProps",
      "Page", "Property", "PropertyValue", "PropertyType", "SelectOption", "NumberFormat",
      "Database", "DatabaseViewConfig", "DatabaseFilter", "DatabaseSort", "DbView",
    ],
  },
  requires: {
    npm: [],
    shadcn: ["button", "input", "checkbox", "dropdown-menu", "popover"],
    env: [],
    peers: [],
    routes: [],
    tables: [],
  },
});
