import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

/**
 * Content Feature Configuration
 *
 * This is the single source of truth for the content feature.
 * Auto-discovered by the feature registry system.
 *
 * @see lib/features/registry.ts for auto-discovery
 * @see lib/features/defineFeature.ts for schema
 */
export default defineFeature({
  // Basic Info
  id: 'content',
  name: 'Content Library',
  description: 'Centralized content management for images, videos, audio, and documents with AI generation capabilities.',

  // UI Config
  ui: {
    icon: 'Library',                  // Lucide React icon name
    path: '/dashboard/content',
    component: 'ContentPage',
    category: 'creativity',
    order: 100,
  },

  // Technical Config
  technical: {
    featureType: 'default',
    hasUI: true,
    hasConvex: true,
    hasTests: true,
    version: '1.0.0',
  },

  // Development Status
  status: {
    state: 'stable',              // development | beta | stable | deprecated
    isReady: true,                     // Set to true when ready for production
    expectedRelease: undefined,         // Optional: 'Q1 2025'
  },

  // Bundle Membership
  // Defines which workspace templates include this feature
  // core: Cannot be disabled | recommended: Enabled by default | optional: User can enable
  bundles: {
    core: [],
    recommended: ['content-creator', 'digital-agency'],
    optional: ['startup', 'business-pro', 'personal-productivity'],
  },

  // Metadata
  tags: [
    "content",
    "creativity"
  ],

  permissions: [
    'content.view',
    'content.create',
    'content.update',
    'content.delete',
    'content.publish',
    'content.manage',
  ],

  // AI Agent
  agent: {
    definitionPath: "convex/features/content/agent.ts",
    capabilities: ["create", "read", "update", "delete", "search"],
  },
})
