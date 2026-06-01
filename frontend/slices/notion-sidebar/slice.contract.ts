/**
 * notion-sidebar — standalone Notion-style tree-nav sidebar.
 *
 * Pure / props-driven · callback-based CRUD · double-click rename ·
 * drag-reorder/reparent (@dnd-kit) · optional per-row icon picker.
 * Decoupled — owns its own NotionSidebarPage type.
 */

import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "notion-sidebar",
  version: "0.1.0",
  category: "ui",
  kind: "ui",
  provides: {
    components: ["NotionSidebar"],
    utils: [],
    hooks: [],
    types: ["NotionSidebarPage", "NotionSidebarProps", "FlatPage"],
  },
  requires: {
    npm: ["@dnd-kit/core", "@dnd-kit/sortable", "@dnd-kit/utilities"],
    shadcn: ["button", "input"],
    env: [],
    peers: [],
    routes: [],
    tables: [],
  },
});
