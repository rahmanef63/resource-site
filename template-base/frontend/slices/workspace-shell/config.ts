import { defineFeature } from "@/frontend/shared/lib/features/defineFeature"

/**
 * workspace-shell — unified workspace + menu navigation context.
 *
 * Replaces the legacy split between workspace-store (tree hierarchy) and
 * menus (menuSets + assignments). Introduces NavContext primitive — atomic
 * (workspaceId, menuSetId) pair that the sidebar + breadcrumb + route resolver
 * all read from.
 */
export default defineFeature({
  id: "workspace-shell",
  name: "Workspace Shell",
  description:
    "Unified workspace + menu navigation context. Atomic 2-axis switcher (workspace × menuSet) with tiered RBAC and per-user customization via menuSet fork.",

  ui: {
    icon: "Layers",
    path: "/dashboard/workspace-shell",
    component: "WorkspaceShellPage",
    category: "administration",
    order: 5,
    layout: "three-column",
  },

  technical: {
    featureType: "system",
    hasUI: true,
    hasConvex: true,
    hasTests: false,
    version: "1.0.0",
  },

  status: {
    state: "beta",
    isReady: true,
  },

  bundles: {
    core: [],
    recommended: [],
    optional: [],
  },

  tags: ["navigation", "workspace", "menu", "core", "rr-publishable"],

  permissions: [
    "workspace.view",
    "menus.view",
    "menus.manage",
    "menus.fork",
  ],
})
