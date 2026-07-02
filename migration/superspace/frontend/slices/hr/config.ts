import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

/**
 * HR Management Feature Configuration
 *
 * This is the single source of truth for the hr feature.
 * Auto-discovered by the feature registry system.
 *
 * @see lib/features/registry.ts for auto-discovery
 * @see lib/features/defineFeature.ts for schema
 */
export default defineFeature({
  // Basic Info
  id: 'hr',
  name: 'HR Management',
  description: 'Human Resources Management',

  // UI Config
  ui: {
    icon: 'Users',                  // Lucide React icon name
    path: '/dashboard/hr',
    component: 'HrPage',
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
    state: 'stable',              // development | beta | stable | deprecated
    isReady: true,                     // Set to true when ready for production
  },

  // Bundle Membership
  // Defines which workspace templates include this feature
  // core: Cannot be disabled | recommended: Enabled by default | optional: User can enable
  bundles: {
    core: [],
    recommended: ["business-pro"],
    optional: ["startup"],
  },

  // Metadata
  tags: [
    "hr",
    "administration"
  ],

  permissions: [
    'hr.view',
    'hr.create',
    'hr.update',
    'hr.delete',
    'hr.manage',
  ],
})
