import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

/**
 * Tags Feature Configuration
 *
 * Tags and categories management.
 */
export default defineFeature({
  id: 'tags',
  name: 'Tags',
  description: 'Tags and categories for organizing data',

  ui: {
    icon: 'Tags',
    path: '/dashboard/tags',
    component: 'TagsPage',
    category: 'productivity',
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

  bundles: {
    core: [],
    recommended: ['business-pro'],
    optional: ['startup', 'sales-crm', 'project-management'],
  },

  tags: ['tags', 'categories', 'organization'],

  permissions: ['tags.view', 'tags.create', 'tags.update', 'tags.delete'],
})
