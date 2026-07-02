import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

export default defineFeature({
  id: 'database',
  name: 'Database',
  description: 'Notion-style database views and management',

  ui: {
    icon: 'Database',
    path: '/dashboard/database',
    component: 'DatabasePage',
    category: 'productivity',
    order: 7,
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

  generation: {
    mode: 'engine-owned',
    sharedEngineId: 'database',
  },

  // Bundle membership
  bundles: {
    core: [],
    recommended: [
      'knowledge-base', 'content-creator',
      'personal-productivity',
    ],
    optional: [
      'startup', 'business-pro', 'project-management',
      'personal-minimal', 'digital-agency', 'education',
    ],
  },

  tags: ['database', 'tables', 'data-management'],

  permissions: [
    'database.read',      // Read database tables, rows, fields, and views
    'database.create',    // Create new tables, rows, fields, and views
    'database.update',    // Update existing tables, rows, fields, and views
    'database.delete',    // Delete tables, rows, fields, and views
    'database.manage',    // Admin access: duplicate tables, manage settings
  ],
})
