import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

export default defineFeature({
  id: 'support',
  name: 'Support',
  description: 'Customer support and helpdesk ticketing system',

  ui: {
    icon: 'Headphones',
    path: '/dashboard/support',
    component: 'SupportPage',
    category: 'communication',
    order: 15,
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
    recommended: [],
    optional: [
      'startup', 'business-pro', 'sales-crm',
      'digital-agency',
    ],
  },

  tags: ['support', 'tickets', 'helpdesk'],

  permissions: [
    'support.view',
    'support.create',
    'support.update',
    'support.delete',
    'support.resolve',
    'support.manage',
  ],
})
