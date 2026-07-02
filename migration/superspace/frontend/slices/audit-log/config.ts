import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

/**
 * Audit Log Feature Configuration
 *
 * View and manage audit logs.
 */
export default defineFeature({
  id: 'audit-log',
  name: 'Audit Log',
  description: 'View activity logs and audit trail',

  ui: {
    icon: 'History',
    path: '/dashboard/audit-log',
    component: 'AuditLogPage',
    category: 'administration',
    order: 16,
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

  bundles: {
    core: ['custom'],
    recommended: ['business-pro', 'fnb'],
    optional: ['startup', 'sales-crm'],
  },

  tags: ['audit', 'logs', 'compliance', 'security'],

  permissions: ['audit-log.view', 'audit-log.export'],
})
