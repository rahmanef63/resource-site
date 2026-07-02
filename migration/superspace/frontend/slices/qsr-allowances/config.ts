import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

/**
 * Qsr Allowances Feature Configuration
 *
 * This is the single source of truth for the qsr-allowances feature.
 * Auto-discovered by the feature registry system.
 *
 * @see frontend/shared/lib/features/registry.ts for auto-discovery
 * @see frontend/shared/lib/features/defineFeature.ts for schema
 */
export default defineFeature({
  // Basic Info
  id: 'qsr-allowances',
  name: 'QSR Allowances',
  description: 'Employee allowances — luar-kota, transport, kos subsidies + monthly incentives by branch.',

  // UI Config
  ui: {
    icon: 'HandCoins',                  // Lucide React icon name
    path: '/dashboard/qsr-allowances',
    component: 'QsrAllowancesPage',
    category: 'administration',
    order: 33,
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
    "allowances",
    "employee"
],
})
