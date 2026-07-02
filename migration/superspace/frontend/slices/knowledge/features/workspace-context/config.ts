import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

export default defineFeature({
  id: 'knowledge/workspace-context',
  name: 'Workspace Context',
  description: 'Workspace and team context for AI understanding',

  ui: {
    icon: 'Building2',
    path: '/dashboard/knowledge/workspace-context',
    component: 'WorkspaceContextPage',
    category: 'productivity',
    order: 4,
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
    recommended: ['startup', 'business-pro', 'project-management'],
    optional: [],
  },

  tags: ['workspace', 'context', 'ai', 'team'],
})
