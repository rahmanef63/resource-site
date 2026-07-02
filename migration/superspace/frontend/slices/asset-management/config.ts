import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

/**
 * Asset Management Feature Configuration
 *
 * This is the single source of truth for the asset-management feature.
 * Auto-discovered by the feature registry system.
 *
 * @see frontend/shared/lib/features/registry.ts for auto-discovery
 * @see frontend/shared/lib/features/defineFeature.ts for schema
 */
export default defineFeature({
  // Basic Info
  id: 'asset-management',
  name: 'Asset Management',
  description: 'Track fixed assets with location, assignment, depreciation and transaction ledger.',

  // UI Config
  ui: {
    icon: 'Boxes',                  // Lucide React icon name
    path: '/dashboard/asset-management',
    component: 'AssetManagementPage',
    category: 'administration',
    order: 100,
  },

  // Technical Config
  technical: {
    featureType: 'optional',
    hasUI: true,
    hasConvex: true,
    hasTests: true,
    version: '1.0.0',
  },

  // Development Status
  status: {
    state: 'beta',                      // development | beta | stable | deprecated
    isReady: true,                      // Set to true when ready for production
    expectedRelease: undefined,         // Optional: 'Q1 2025'
  },

  // RBAC permission keys (declarative — role documents hold the authoritative grants)
  permissions: [
    'assets.view',
    'assets.register',
    'assets.transfer',
    'assets.retire',
  ],

  // JSON Generation Policy
  generation: {
    mode: 'full-json',
  },

  // Bundle Membership
  // Defines which workspace templates include this feature
  // core: Cannot be disabled | recommended: Enabled by default | optional: User can enable
  bundles: {
    core: [],
    recommended: ["business-pro"],
    optional: ["custom"],
  },

  // Metadata
  tags: [
    "asset-management",
    "administration"
],
})
