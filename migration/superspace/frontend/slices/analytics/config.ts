/**
 * Analytics Feature Configuration
 */

import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

export default defineFeature({
  id: 'analytics',
  name: 'Analytics',
  description: 'Monitor your business performance with real-time analytics',

  ui: {
    icon: 'BarChart3',
    path: '/dashboard/analytics',
    component: 'AnalyticsPage',
    category: 'analytics',
    order: 21,
  },

  technical: {
    featureType: 'optional',
    hasUI: true,
    hasConvex: true,
    hasTests: true,
    version: '1.0.0',
  },

  status: {
    state: 'stable',
    isReady: true,
  },

  // Bundle membership
  bundles: {
    core: ['fnb'],
    recommended: [
      'startup', 'business-pro', 'sales-crm',
      'project-management', 'digital-agency',
    ],
    optional: [
      'knowledge-base', 'personal-productivity',
      'content-creator', 'education', 'community',
    ],
  },

  tags: ['analytics', 'insights', 'metrics', 'dashboard'],

  permissions: [
    'analytics.view',
    'analytics.export',
  ],

  children: [
    {
      id: 'analytics-dashboard',
      name: 'Dashboard',
      description: 'Overview of key metrics',
      ui: {
        icon: 'TrendingUp',
        path: '/dashboard/analytics/dashboard',
        component: 'AnalyticsDashboardPage',
        category: 'analytics',
        order: 1,
      },
      technical: {
        featureType: 'optional',
        hasUI: true,
        hasConvex: true,
        hasTests: false,
        version: '1.0.0',
      },
      status: {
        state: 'stable',
        isReady: true,
      },
    },
    {
      id: 'analytics-reports',
      name: 'Reports',
      description: 'Generate detailed reports',
      ui: {
        icon: 'FileText',
        path: '/dashboard/analytics/reports',
        component: 'AnalyticsReportsPage',
        category: 'analytics',
        order: 2,
      },
      technical: {
        featureType: 'optional',
        hasUI: true,
        hasConvex: true,
        hasTests: false,
        version: '1.0.0',
      },
      status: {
        state: 'stable',
        isReady: true,
        expectedRelease: '2025-11-01',
      },
    },
  ],
})
