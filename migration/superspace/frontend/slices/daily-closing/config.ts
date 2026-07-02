import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

/**
 * Daily Closing Feature Configuration
 *
 * This is the single source of truth for the daily-closing feature.
 * Auto-discovered by the feature registry system.
 *
 * @see frontend/shared/lib/features/registry.ts for auto-discovery
 * @see frontend/shared/lib/features/defineFeature.ts for schema
 */
export default defineFeature({
  // Basic Info
  id: 'daily-closing',
  name: 'Daily Closing',
  description:
    'End-of-day register close with per-payment-method variance and approval workflow.',

  // UI Config
  ui: {
    icon: 'ClipboardList',                 // Lucide React icon name
    path: '/dashboard/daily-closing',
    component: 'DailyClosingPage',
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
    'closing.view',
    'closing.open_day',
    'closing.record_sales',
    'closing.upsert_item',
    'closing.close_day',
    'closing.approve',
  ],

  // JSON Generation Policy
  generation: {
    mode: 'full-json',
  },

  // Bundle Membership
  // Defines which workspace templates include this feature
  // core: Cannot be disabled | recommended: Enabled by default | optional: User can enable
  bundles: {
    core: ["fnb"],
    recommended: ["business-pro"],
    optional: ["custom"],
  },

  // Metadata
  tags: [
    "daily-closing",
    "administration"
],
})
