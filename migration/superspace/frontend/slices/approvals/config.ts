import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

/**
 * Approvals Feature Configuration
 *
 * Approval workflows and request management.
 */
export default defineFeature({
  id: 'approvals',
  name: 'Approvals',
  description: 'Approval workflows and request management',

  ui: {
    icon: 'CheckCircle',
    path: '/dashboard/approvals',
    component: 'ApprovalsPage',
    category: 'administration',
    order: 14,
  },

  technical: {
    featureType: 'optional',
    hasUI: true,
    hasConvex: true,
    hasTests: true,
    version: '1.0.0',
  },

  status: {
    state: 'stable',
    isReady: true,
  },

  bundles: {
    core: [],
    recommended: ['custom', 'business-pro'],
    optional: ['project-management', 'startup', 'digital-agency'],
  },

  tags: ['approvals', 'workflows', 'requests'],

  permissions: ['approvals.view', 'approvals.create', 'approvals.approve', 'approvals.reject'],
})
