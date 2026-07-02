import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

/**
 * Staff Operations Feature
 *
 * Housekeeping, laundry, damage reports, reimbursement, shift scheduling.
 * Extracted from zianinn spec (merge-playbook/sources/zianinn-feature-spec.md).
 */
export default defineFeature({
  id: 'staff-operations',
  name: 'Staff Operations',
  description: 'Housekeeping, laundry, damage reports, and shift scheduling for hospitality ops',

  ui: {
    icon: 'ConciergeBell',
    path: '/dashboard/staff-operations',
    component: 'StaffOperationsPage',
    category: 'productivity',
    order: 51,
  },

  technical: {
    featureType: 'optional',
    hasUI: true,
    hasConvex: true,
    hasTests: true,
    version: '0.1.0',
  },

  status: {
    state: 'beta',
    isReady: true,
  },

  generation: {
    mode: 'hybrid-json',
    sharedEngineId: 'staff-operations',
  },

  navigation: {
    aliases: ['housekeeping', 'laundry', 'shift'],
    patterns: {
      'task': 'task/:id',
      'damage': 'damage/:id',
    },
  },

  agent: {
    definitionPath: 'convex/features/staffOperations/agent.ts',
    capabilities: ['create', 'read', 'update', 'search'],
  },

  bundles: {
    core: [],
    recommended: ['custom'],
    optional: ['startup'],
  },

  tags: ['hospitality', 'housekeeping', 'laundry', 'operations'],

  permissions: [
    'staff-operations.view',
    'staff-operations.create',
    'staff-operations.update',
    'staff-operations.assign',
  ],
})
