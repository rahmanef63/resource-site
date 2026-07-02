import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

export default defineFeature({
  id: 'knowledge/docs',
  name: 'Documents',
  description: 'Regular documents, notes, and drafts within the knowledge base',

  ui: {
    icon: 'FileText',
    path: '/dashboard/knowledge/docs',
    component: 'DocsPage',
    category: 'productivity',
    order: 2,
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
    core: ['knowledge-base'],
    recommended: [
      'startup', 'business-pro', 'project-management',
      'personal-productivity', 'content-creator', 'digital-agency', 'education',
    ],
    optional: ['sales-crm', 'personal-minimal', 'family', 'community'],
  },

  tags: ['documents', 'notes', 'drafts', 'editor', 'collaboration'],

  // Export/Import integration
  hasExportImport: true,
  exportConfigPath: 'features/documents/data/export-config',
})
