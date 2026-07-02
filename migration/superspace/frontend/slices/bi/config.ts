import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

/**
 * BI (Business Intelligence) Feature Configuration
 *
 * Advanced analytics and business intelligence dashboards.
 */
export default defineFeature({
  id: 'bi',
  name: 'Business Intelligence',
  description: 'Advanced analytics and business intelligence',

  ui: {
    icon: 'LineChart',
    path: '/dashboard/bi',
    component: 'BiPage',
    category: 'analytics',
    order: 22,
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
    recommended: ['custom'],
    optional: ['business-pro'],
  },

  tags: ['bi', 'analytics', 'dashboards', 'reports'],

  permissions: ['bi.view', 'bi.create', 'bi.manage', 'bi.export'],
})
