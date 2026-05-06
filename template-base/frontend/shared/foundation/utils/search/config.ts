import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

/**
 * Search Feature Configuration
 *
 * Global and local search functionality across workspace.
 * This is the single source of truth for the search feature.
 */
export default defineFeature({
  id: 'search',
  name: 'Search',
  description: 'Global and local search across all workspace data',

  ui: {
    icon: 'Search',
    path: '/dashboard/search',
    component: 'SearchPage',
    category: 'productivity',
    order: 4,
  },

  technical: {
    featureType: 'default',
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
    core: ['startup', 'business-pro', 'custom'],
    recommended: [],
    optional: [],
  },

  tags: ['search', 'navigation', 'global'],

  permissions: ['search.view', 'search.advanced'],
})
