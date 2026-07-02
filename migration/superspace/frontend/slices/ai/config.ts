import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

export default defineFeature({
  id: 'ai',
  name: 'AI',
  description: 'AI assistant',

  ui: {
    icon: 'Bot',
    path: '/dashboard/ai',
    component: 'AIView',
    category: 'communication',
    order: 4,
  },

  technical: {
    featureType: 'default',
    hasUI: true,
    hasConvex: true,
    hasTests: true,
    version: '2.0.0',
  },

  status: {
    state: 'stable',
    isReady: true,
  },

  generation: {
    mode: 'engine-owned',
    sharedEngineId: 'ai',
  },

  // Bundle membership
  bundles: {
    core: [],
    recommended: [],
    optional: [
      'startup', 'business-pro', 'sales-crm',
      'project-management', 'knowledge-base',
      'personal-productivity', 'content-creator', 'digital-agency',
      'education',
    ],
  },

  tags: ['ai', 'assistant', 'automation'],

  permissions: [
    'ai.view',
    'ai.chat',
    'ai.execute',
    'ai.manage',
  ],

  appStore: {
    badge: 'featured',
    longDescription: 'Your AI-powered workspace assistant. Ask questions, generate content, summarize documents, and automate repetitive work. The AI assistant is context-aware — it understands your workspace, your team, and your data. Each feature has its own specialized AI agent trained to help with that specific workflow.',
    highlights: [
      'Context-aware AI for every feature',
      'Generate documents, reports, and content',
      'Summarize long threads and documents',
      'Answer questions about your workspace data',
      'Automate workflows with natural language',
      'Multi-agent system with specialized skills',
    ],
    whatsNew: 'Introduced multi-agent routing, RAG vector search, and full-text knowledge indexing.',
  },
})
