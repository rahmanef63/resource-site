import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

/**
 * Marketing Feature Configuration
 *
 * Marketing automation and campaign management.
 */
export default defineFeature({
  id: 'marketing',
  name: 'Marketing',
  description: 'Marketing automation and campaign management',

  ui: {
    icon: 'Megaphone',
    path: '/dashboard/marketing',
    component: 'MarketingPage',
    category: 'content',
    order: 21,
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
    recommended: ['business-pro', 'digital-agency'],
    optional: ['startup', 'sales-crm'],
  },

  tags: ['marketing', 'campaigns', 'email', 'automation'],

  permissions: ['marketing.view', 'marketing.create', 'marketing.manage', 'marketing.analytics'],
})
