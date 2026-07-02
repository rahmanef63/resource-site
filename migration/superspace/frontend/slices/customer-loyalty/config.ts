import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

/**
 * Customer Loyalty Feature Configuration
 *
 * This is the single source of truth for the customer-loyalty feature.
 * Auto-discovered by the feature registry system.
 *
 * @see frontend/shared/lib/features/registry.ts for auto-discovery
 * @see frontend/shared/lib/features/defineFeature.ts for schema
 */
export default defineFeature({
  // Basic Info
  id: 'customer-loyalty',
  name: 'Customer Loyalty',
  description:
    'Customer loyalty program with tiered memberships and a points transaction ledger.',

  // UI Config
  ui: {
    icon: 'Award',                  // Lucide React icon name
    path: '/dashboard/customer-loyalty',
    component: 'CustomerLoyaltyPage',
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
    'loyalty.view',
    'loyalty.enroll',
    'loyalty.earn',
    'loyalty.redeem',
    'loyalty.upsert_tier',
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
    "customer-loyalty",
    "administration"
],
})
