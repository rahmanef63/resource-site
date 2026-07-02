import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

export default defineFeature({
  id: 'knowledge/profile',
  name: 'Profile Data',
  description: 'User profile information for AI context and personalization',

  ui: {
    icon: 'User',
    path: '/dashboard/knowledge/profile',
    component: 'ProfileDataPage',
    category: 'productivity',
    order: 1,
  },

  technical: {
    featureType: 'default',
    hasUI: true,
    hasConvex: true,
    hasTests: false,
    version: '1.0.0',
  },

  status: {
    state: 'stable',
    isReady: true,
  },

  bundles: {
    core: ['knowledge-base'],
    recommended: [],
    optional: [],
  },

  tags: ['profile', 'ai', 'personalization', 'user'],
})
