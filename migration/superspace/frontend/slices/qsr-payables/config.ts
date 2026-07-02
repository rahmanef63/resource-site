import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

/**
 * Qsr Payables Feature Configuration
 *
 * This is the single source of truth for the qsr-payables feature.
 * Auto-discovered by the feature registry system.
 *
 * @see frontend/shared/lib/features/registry.ts for auto-discovery
 * @see frontend/shared/lib/features/defineFeature.ts for schema
 */
export default defineFeature({
  // Basic Info
  id: 'qsr-payables',
  name: 'QSR Payables',
  description: 'Vendor credit purchases pending payment — invoice tracking, due-date reminders, supplier aggregates.',

  // UI Config
  ui: {
    icon: 'Receipt',                  // Lucide React icon name
    path: '/dashboard/qsr-payables',
    component: 'QsrPayablesPage',
    category: 'administration',
    order: 30,
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
    recommended: ["fnb","business-pro"],
    optional: ["custom"],
  },

  // Metadata
  tags: [
    "qsr",
    "fnb",
    "payables",
    "vendor"
],
})
