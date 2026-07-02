import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

export default defineFeature({
  id: 'status',
  name: 'Status',
  description: 'Share status updates with your team',

  ui: {
    icon: 'RadioTower',
    path: '/dashboard/status',
    component: 'StatusPage',
    category: 'communication',
    order: 3,
  },

  technical: {
    featureType: 'optional',
    hasUI: true,
    hasConvex: true,
    hasTests: true,
    version: '2.0.0',
  },

  status: {
    state: 'stable',
    isReady: true,
  },

  // Bundle membership
  bundles: {
    core: [],
    recommended: ['community'],
    optional: [
      'startup', 'project-management', 'family',
      'education',
    ],
  },

  tags: ['communication', 'status', 'updates', 'stories'],

  permissions: [
    'status.view',
    'status.create',
    'status.update',
    'status.delete',
    'status.manage',
  ],
})
