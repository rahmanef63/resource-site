import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

/**
 * Kpi Thresholds Feature Configuration
 *
 * This is the single source of truth for the kpi-thresholds feature.
 * Auto-discovered by the feature registry system.
 *
 * @see frontend/shared/lib/features/registry.ts for auto-discovery
 * @see frontend/shared/lib/features/defineFeature.ts for schema
 */
export default defineFeature({
  // Basic Info
  id: 'kpi-thresholds',
  name: 'Kpi Thresholds',
  description: 'Define KPI alert thresholds and triage triggered alerts across branches.',

  // UI Config
  ui: {
    icon: 'Gauge',                  // Lucide React icon name
    path: '/dashboard/kpi-thresholds',
    component: 'KpiThresholdsPage',
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
    'kpi.view',
    'kpi.define_threshold',
    'kpi.trigger_alert',
    'kpi.acknowledge_alert',
    'kpi.toggle_threshold',
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
    "kpi-thresholds",
    "analytics"
],
})
