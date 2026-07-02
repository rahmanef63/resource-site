import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

export default defineFeature({
  id: 'projects',
  name: 'Projects',
  description: 'Project management with team discussions',

  ui: {
    icon: 'FolderKanban',
    path: '/dashboard/projects',
    component: 'ProjectsPage',
    category: 'productivity',
    order: 16,
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

  navigation: {
    aliases: ['project'],
    patterns: {
      'project': ':id',
    }
  },

  // Bundle membership
  bundles: {
    core: ['project-management'],
    recommended: [
      'startup', 'business-pro', 'digital-agency',
    ],
    optional: [
      'sales-crm', 'knowledge-base', 'education',
    ],
  },

  tags: ['projects', 'collaboration', 'discussions'],

  permissions: [
    'projects.view',
    'projects.create',
    'projects.update',
    'projects.delete',
    'projects.manage',
  ],
})
