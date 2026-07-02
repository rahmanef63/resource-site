import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

/**
 * Maintenance Scheduling Feature Configuration
 *
 * This is the single source of truth for the maintenance-scheduling feature.
 * Auto-discovered by the feature registry system.
 *
 * @see frontend/shared/lib/features/registry.ts for auto-discovery
 * @see frontend/shared/lib/features/defineFeature.ts for schema
 */
export default defineFeature({
  // Basic Info
  id: 'maintenance-scheduling',
  name: 'Maintenance Scheduling',
  description:
    'Preventive and reactive maintenance with recurring schedules and cost tracking.',

  // UI Config
  ui: {
    icon: 'Wrench',                  // Lucide React icon name
    path: '/dashboard/maintenance-scheduling',
    component: 'MaintenanceSchedulingPage',
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
    'maintenance.view',
    'maintenance.schedule',
    'maintenance.complete',
    'maintenance.skip',
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
    "maintenance-scheduling",
    "administration"
],
})
