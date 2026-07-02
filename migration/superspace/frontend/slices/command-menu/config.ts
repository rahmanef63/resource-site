import { defineFeature } from "@/frontend/shared/lib/features/defineFeature"

/**
 * command-menu slice — renderless ⌘K palette + generic search modal.
 * Pure UI library, no route, no Convex. Consumer supplies groups/bindings;
 * slice owns dialog chrome, hotkey, and MRU history.
 * Lifted from rr `command-menu@0.2.0` (2026-05-27).
 */
export default defineFeature({
  id: "command-menu",
  name: "Command Menu",
  description:
    "Renderless ⌘K command palette + search modal. Consumer-supplied groups + bindings; slice owns dialog chrome, hotkey, MRU history.",

  ui: {
    icon: "Command",
    path: "/dashboard/command-menu",
    component: "CommandPalette",
    category: "productivity",
    order: 999,
  },

  technical: {
    featureType: "optional",
    hasUI: true,
    hasConvex: false,
    hasTests: true,
    version: "0.2.0",
  },

  status: {
    state: "stable",
    isReady: true,
  },

  bundles: {
    core: [],
    recommended: [],
    optional: ["custom"],
  },

  tags: ["ui", "palette", "cmd-k", "navigation", "keyboard", "library"],

  permissions: [],
})
