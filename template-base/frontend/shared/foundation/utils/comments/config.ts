import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

/**
 * Comments Feature Configuration
 *
 * Comments and discussions system.
 */
export default defineFeature({
  id: 'comments',
  name: 'Comments',
  description: 'Comments and discussions on any content',

  ui: {
    icon: 'MessageSquare',
    path: '/dashboard/comments',
    component: 'CommentsPage',
    category: 'collaboration',
    order: 19,
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

  tags: ['comments', 'discussions', 'collaboration'],

  permissions: ['comments.view', 'comments.create', 'comments.update', 'comments.delete'],
})
