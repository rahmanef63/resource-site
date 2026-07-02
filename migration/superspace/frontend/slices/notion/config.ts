import { defineFeature } from "@/frontend/shared/lib/features/defineFeature"

/**
 * `notion` — Notion-style block editor (vendored from notion-page-clone via
 * `rr add notion`). Rich page authoring: slash menu, drag-and-drop blocks,
 * columns, markdown triggers, turn-into, per-block colours, code + equations.
 *
 * Persistence: local-first (per-browser localStorage) — the editor's own
 * pure block-tree utils drive an in-memory adapter (`lib/localAdapter`).
 * The vendored convex backend was NOT wired: its `notion_docs` table lacks
 * `workspaceId` (cross-tenant) + RBAC + audit. Workspace-scoped convex
 * persistence is a supervised sp-backend follow-up (re-`rr add notion` for
 * the backend, then add ensureUser + requirePermission + logAuditEvent +
 * a by_workspace index before deploy).
 */
const notionConfig = defineFeature({
  id: "notion",
  name: "Notion",
  description:
    "Editor blok ala Notion — tulis halaman kaya dengan slash menu, drag-and-drop blok, kolom, dan markdown.",

  ui: {
    icon: "NotebookPen",
    path: "/dashboard/notion",
    component: "NotionPage",
    category: "content",
    order: 115,
  },

  technical: {
    featureType: "optional",
    hasUI: true,
    hasConvex: false,
    hasTests: true,
    version: "0.1.0",
  },

  // Local-first MVP: fully editable block editor persisted to localStorage.
  // Multi-user workspace-scoped convex persistence deferred (see file header).
  status: {
    state: "beta",
    isReady: true,
  },

  permissions: [
    "notion.view",
    "notion.edit",
  ],

  bundles: {
    core: [],
    recommended: [],
    optional: ["custom"],
  },

  tags: ["notion", "editor", "content", "pages"],
})

export default notionConfig
export { notionConfig }
