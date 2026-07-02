import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

/**
 * Cms Lite Feature Configuration
 *
 * This is the single source of truth for the cms-lite feature.
 * Auto-discovered by the feature registry system.
 *
 * @see lib/features/registry.ts for auto-discovery
 * @see lib/features/defineFeature.ts for schema
 */
export default defineFeature({
  // Basic Info
  id: 'cms-lite',
  name: 'CMS Lite (deprecated)',
  description: 'Deprecated 2026-05-07 — use Blog slice for content publishing. Notion-clone (sibling project) will replace remaining cms-lite surfaces. See docs/coordination/cms-lite-removal-plan.md.',

  // UI Config
  ui: {
    icon: 'Box',                  // Lucide React icon name
    path: '/dashboard/cms-lite',
    component: 'CmsLitePage',
    category: 'productivity',
    order: 100,
  },

  // Technical Config
  technical: {
    featureType: 'default',
    hasUI: true,
    hasConvex: true,
    hasTests: true,
    version: '1.0.0',
  },

  // Development Status
  status: {
    state: 'deprecated',
    isReady: true,                     // Still functional during deprecation window
    expectedRelease: undefined,
  },

  // Bundle membership — emptied during deprecation; new workspaces should not auto-enable cms-lite
  bundles: {
    core: [],
    recommended: [],
    optional: ['custom'], // available only via explicit opt-in
  },

  // Permissions — derived from `requirePermission(...)` call sites in convex/features/cmsLite/**
  // Sorted alphabetically. EXACT strings as used in mutations (do not normalize).
  permissions: [
    "cart.checkout",
    "cart.use",
    "cmsLite.ai.manage",
    "currency.manage",
    "currency.update_rates",
    "manage_workspace",
    "navigation.manage",
    "storage.manage",
    "storage.upload",
    "storage.view",
    "users.view",
    "wishlist.manage",
  ],

  // Metadata
  tags: [
    "cms-lite",
    "productivity"
  ],
})
