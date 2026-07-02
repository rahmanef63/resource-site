import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

export default defineFeature({
  id: 'knowledge/articles',
  name: 'Knowledge Base',
  description: 'Structured knowledge base articles for AI and team consumption',

  ui: {
    icon: 'Brain',
    path: '/dashboard/knowledge/articles',
    component: 'ArticlesPage',
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
    core: ['knowledge-base', 'education'],
    recommended: [
      'startup', 'business-pro', 'project-management',
      'personal-productivity', 'content-creator', 'digital-agency',
    ],
    optional: ['sales-crm', 'personal-minimal', 'family', 'community'],
  },

  tags: ['knowledge', 'articles', 'ai', 'wiki', 'documentation'],

  // Export/Import integration
  hasExportImport: true,
  exportConfigPath: 'features/documents/data/export-config',
})
