import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

/**
 * Sales Feature Configuration
 *
 * Sales management and pipeline tracking.
 */
export default defineFeature({
  id: 'sales',
  name: 'Sales',
  description: 'Sales management and pipeline tracking',

  ui: {
    icon: 'DollarSign',
    path: '/dashboard/sales',
    component: 'SalesPage',
    category: 'productivity',
    order: 23,
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
    recommended: ['sales-crm', 'business-pro'],
    optional: ['startup'],
  },

  tags: ['sales', 'pipeline', 'deals', 'revenue'],

  permissions: ['sales.view', 'sales.create', 'sales.update', 'sales.delete', 'sales.reports'],
})
