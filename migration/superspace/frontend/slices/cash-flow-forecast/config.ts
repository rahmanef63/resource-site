import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

/**
 * Cash Flow Forecast Feature Configuration
 *
 * This is the single source of truth for the cash-flow-forecast feature.
 * Auto-discovered by the feature registry system.
 *
 * @see frontend/shared/lib/features/registry.ts for auto-discovery
 * @see frontend/shared/lib/features/defineFeature.ts for schema
 */
export default defineFeature({
  // Basic Info
  id: 'cash-flow-forecast',
  name: 'Cash Flow Forecast',
  description: 'Build cash-flow forecasts from bucketed revenue and expense line items.',

  // UI Config
  ui: {
    icon: 'Banknote',                  // Lucide React icon name
    path: '/dashboard/cash-flow-forecast',
    component: 'CashFlowForecastPage',
    category: 'analytics',
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
    'cashflow.view',
    'cashflow.create_forecast',
    'cashflow.add_item',
    'cashflow.publish',
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
    recommended: ["business-pro", "fnb"],
    optional: ["custom"],
  },

  // Metadata
  tags: [
    "cash-flow-forecast",
    "analytics"
],
})
