import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

/**
 * Operational Checklist Feature Configuration
 *
 * This is the single source of truth for the operational-checklist feature.
 * Auto-discovered by the feature registry system.
 *
 * @see frontend/shared/lib/features/registry.ts for auto-discovery
 * @see frontend/shared/lib/features/defineFeature.ts for schema
 */
export default defineFeature({
  // Basic Info
  id: 'operational-checklist',
  name: 'Operational Checklist',
  description:
    'Build operational checklists and run them through the daily/audit workflow with photo + notes capture.',

  // UI Config
  ui: {
    icon: 'ClipboardCheck',                  // Lucide React icon name
    path: '/dashboard/operational-checklist',
    component: 'OperationalChecklistPage',
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
    'checklist.view',
    'checklist.create_template',
    'checklist.start_run',
    'checklist.check_item',
    'checklist.complete_run',
    'checklist.review_run',
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
    "operational-checklist",
    "administration"
],
})
