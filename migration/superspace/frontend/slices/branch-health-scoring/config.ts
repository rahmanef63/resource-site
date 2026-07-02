import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

/**
 * Branch Health Scoring Feature Configuration
 *
 * This is the single source of truth for the branch-health-scoring feature.
 * Auto-discovered by the feature registry system.
 *
 * @see frontend/shared/lib/features/registry.ts for auto-discovery
 * @see frontend/shared/lib/features/defineFeature.ts for schema
 */
export default defineFeature({
  // Basic Info
  id: 'branch-health-scoring',
  name: 'Branch Health Scoring',
  description:
    'Capture branch health snapshots across revenue, expense, ops, staff, and customer scores.',

  // UI Config
  ui: {
    icon: 'Activity',                  // Lucide React icon name
    path: '/dashboard/branch-health-scoring',
    component: 'BranchHealthScoringPage',
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
    'branchhealth.view',
    'branchhealth.capture_snapshot',
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
    "branch-health-scoring",
    "analytics"
],
})
