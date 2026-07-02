import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

/**
 * Owner Analytics Feature
 *
 * Financial dashboards, channel performance, asset expansion tracking.
 * Extracted from zianinn spec (merge-playbook/sources/zianinn-feature-spec.md).
 */
export default defineFeature({
  id: 'owner-analytics',
  name: 'Owner Analytics',
  description: 'Strategic financial dashboards, channel mix, and asset expansion tracking for property owners',

  ui: {
    icon: 'PieChart',
    path: '/dashboard/owner-analytics',
    component: 'OwnerAnalyticsPage',
    category: 'analytics',
    order: 52,
  },

  technical: {
    featureType: 'optional',
    hasUI: true,
    hasConvex: true,
    hasTests: true,
    version: '0.1.0',
  },

  status: {
    state: 'beta',
    isReady: true,
  },

  generation: {
    mode: 'hybrid-json',
    sharedEngineId: 'owner-analytics',
  },

  navigation: {
    aliases: ['revenue', 'kpi', 'expansion'],
    patterns: {
      'project': 'project/:id',
    },
  },

  agent: {
    definitionPath: 'convex/features/ownerAnalytics/agent.ts',
    capabilities: ['read', 'search'],
  },

  bundles: {
    core: [],
    recommended: ['custom'],
    optional: ['startup'],
  },

  tags: ['hospitality', 'analytics', 'revenue', 'kpi', 'owner'],

  permissions: ['owner-analytics.view', 'owner-analytics.manage'],
})
