import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

/**
 * Qsr Product Changes Feature Configuration
 *
 * This is the single source of truth for the qsr-product-changes feature.
 * Auto-discovered by the feature registry system.
 *
 * @see frontend/shared/lib/features/registry.ts for auto-discovery
 * @see frontend/shared/lib/features/defineFeature.ts for schema
 */
export default defineFeature({
  // Basic Info
  id: 'qsr-product-changes',
  name: 'QSR Product Changes',
  description: 'Weekly product additions/removals/price changes per branch — recipe lifecycle audit trail.',

  // UI Config
  ui: {
    icon: 'Replace',                  // Lucide React icon name
    path: '/dashboard/qsr-product-changes',
    component: 'QsrProductChangesPage',
    category: 'administration',
    order: 34,
  },

  // Technical Config
  technical: {
    featureType: 'optional',
    hasUI: true,
    hasConvex: true,
    hasTests: false,
    version: '1.0.0',
  },

  // Development Status
  status: {
    state: 'beta',                      // development | beta | stable | deprecated
    isReady: true,                      // Set to true when ready for production
    expectedRelease: undefined,         // Optional: 'Q1 2025'
  },

  // JSON Generation Policy
  generation: {
    mode: 'full-json',
  },

  // Bundle Membership
  // Defines which workspace templates include this feature
  // core: Cannot be disabled | recommended: Enabled by default | optional: User can enable
  bundles: {
    core: [],
    recommended: ["fnb"],
    optional: ["custom"],
  },

  // Metadata
  tags: [
    "qsr",
    "fnb",
    "product-changes",
    "waste"
],
})
