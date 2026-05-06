import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

export default defineFeature({
  id: 'notifications',
  name: 'Notifications',
  description: 'System notifications and activity feed',

  ui: {
    icon: 'Bell',
    path: '/dashboard/notifications',
    component: 'NotificationsPage',
    category: 'communication',
    order: 18,
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

  // Bundle membership - CORE for all bundles (essential system feature)
  bundles: {
    core: [
      'startup', 'business-pro', 'sales-crm',
      'project-management', 'knowledge-base',
      'personal-minimal', 'personal-productivity', 'family',
      'content-creator', 'digital-agency',
      'education', 'community',
    ],
    recommended: [],
    optional: [],
  },

  tags: ['notifications', 'activity', 'feed'],
})
