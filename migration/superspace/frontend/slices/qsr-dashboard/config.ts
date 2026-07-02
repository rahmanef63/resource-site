import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

/**
 * QSR Dashboard Feature Configuration
 *
 * Owner-facing chart-heavy overview of QSR weekly reports + child counts.
 * Reads `convex/features/qsr/queries:*` against the active workspace.
 *
 * Props-driven (workspaceId pass-through) so the same slice can serve any
 * F&B workspace that ingests via the `qsr` backend pipeline.
 */
export default defineFeature({
  id: 'qsr-dashboard',
  name: 'QSR Dashboard',
  description:
    'Restaurant weekly report overview — net sales trend, food cost %, daily cash flow, vendor purchases, attachment links.',

  ui: {
    icon: 'Utensils',
    path: '/dashboard/qsr-dashboard',
    component: 'QsrDashboardPage',
    category: 'analytics',
    order: 10,
  },

  technical: {
    featureType: 'optional',
    hasUI: true,
    hasConvex: true,
    hasTests: false,
    version: '0.1.0',
  },

  status: {
    state: 'beta',
    isReady: true,
  },

  bundles: {
    core: ['fnb'],
    recommended: [],
    optional: ['business-pro', 'custom'],
  },

  tags: ['qsr', 'fnb', 'restaurant', 'dashboard', 'charts', 'analytics'],

  permissions: ['qsr-dashboard.view', 'qsr-dashboard.export'],
})
