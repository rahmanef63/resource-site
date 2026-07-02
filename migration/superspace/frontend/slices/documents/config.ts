import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

/**
 * @deprecated This feature has been moved to frontend/slices/knowledge/features/docs
 * The documents feature is now part of the knowledge base umbrella.
 * This config is kept for backward compatibility and will redirect to the knowledge feature.
 */
export default defineFeature({
  id: 'documents',
  name: 'Documents',
  description: 'Collaborative document editor with real-time sync (Deprecated - use Knowledge > Docs)',

  ui: {
    icon: 'FileText',
    path: '/dashboard/documents', // Keep original path for backward compatibility
    component: 'DocumentsPage',
    category: 'productivity',
    order: 9,
  },

  technical: {
    // Deprecated wrapper: keep available for backward compatibility,
    // but don't treat as a default bundle feature.
    featureType: 'optional',
    hasUI: true,
    hasConvex: false,
    hasTests: true,
    version: '1.2.0',
  },

  status: {
    state: 'stable',
    isReady: true,
  },

  generation: {
    mode: 'hybrid-json',
    sharedEngineId: 'documents',
  },
  agent: {
    definitionPath: "convex/features/docs/agent.ts",
    capabilities: ["create", "read", "update", "delete"],
  },

  navigation: {
    aliases: ['doc', 'file'],
    patterns: {
      'file': '?file=:id',
    }
  },

  // Bundle membership - REQUIRED for non-system features; available in custom setups
  bundles: {
    core: [],
    recommended: [],
    optional: ['custom'],
  },

  tags: ['collaboration', 'real-time', 'documents', 'editor', 'deprecated'],
})
