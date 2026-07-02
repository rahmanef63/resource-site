import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

export default defineFeature({
  id: 'knowledge',
  name: 'Knowledge',
  description: 'Centralized knowledge base with documents, articles, and AI-consumable data',

  ui: {
    icon: 'BookOpen',
    path: '/dashboard/knowledge',
    component: 'KnowledgePage',
    category: 'productivity',
    order: 5,
  },

  technical: {
    featureType: 'default',
    hasUI: true,
    hasConvex: true,
    hasTests: true,
    version: '1.0.0',
  },

  status: {
    state: 'beta',
    isReady: true,
  },

  generation: {
    mode: 'hybrid-json',
    sharedEngineId: 'knowledge',
  },

  // Bundle membership - CORE for knowledge-focused bundles
  bundles: {
    core: [
      'knowledge-base', 'education',
    ],
    recommended: [
      'startup', 'business-pro', 'project-management',
      'personal-productivity', 'content-creator', 'digital-agency',
    ],
    optional: [
      'sales-crm', 'personal-minimal', 'family', 'community',
    ],
  },

  tags: ['knowledge', 'documents', 'ai', 'wiki', 'articles', 'profile'],

  permissions: [
    'knowledge.view',
    'knowledge.create',
    'knowledge.update',
    'knowledge.delete',
    'knowledge.manage',
    'knowledge.ai-access',
  ],
})
