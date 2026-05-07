import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

export default defineFeature({
  id: 'reports',
  name: 'Reports',
  description: 'Analytics and reporting dashboard',

  ui: {
    icon: 'BarChart',
    path: '/dashboard/reports',
    component: 'ReportsPage',
    category: 'analytics',
    order: 12,
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

  // Bundle membership
  bundles: {
    core: [],
    recommended: ['business-pro'],
    optional: [
      'startup', 'sales-crm', 'project-management',
      'digital-agency', 'education',
    ],
  },

  tags: ['reports', 'analytics', 'dashboard'],

  permissions: ['VIEW_REPORTS'],
})
