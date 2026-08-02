/** notion-sidebar — standalone Notion-style tree-nav sidebar with full page
 *  CRUD, double-click rename, drag-reorder/reparent, and optional per-row icon
 *  picker. Props-driven + decoupled (owns its own NotionSidebarPage type), so
 *  it composes with notion-shell (page editor) + notion-database for the full
 *  Notion-clone OS, or drops into any app on its own. */

export { NotionSidebar } from "./components/NotionSidebar";
export type {
  NotionSidebarPage,
  NotionSidebarProps,
  FlatPage,
} from "./types";
