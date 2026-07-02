import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

/**
 * Accounting Feature Configuration
 *
 * This is the single source of truth for the accounting feature.
 * Auto-discovered by the feature registry system.
 *
 * @see lib/features/registry.ts for auto-discovery
 * @see lib/features/defineFeature.ts for schema
 */
export default defineFeature({
  // Basic Info
  id: 'accounting',
  name: 'Accounting',
  description: 'Financial Management and Accounting',

  // UI Config
  ui: {
    icon: 'Calculator',                  // Lucide React icon name
    path: '/dashboard/accounting',
    component: 'AccountingPage',
    category: 'administration',
    order: 100,
  },

  // Technical Config
  technical: {
    featureType: 'optional',
    hasUI: true,
    hasConvex: true,
    hasTests: true,
    version: '1.0.0',
  },

  // Development Status
  status: {
    state: 'stable',              // development | beta | stable | deprecated
    isReady: true,                     // Set to true when ready for production
  },

  navigation: {
    aliases: ['finance'],
    patterns: {
      'invoice': 'invoices/:id',
      'expense': 'expenses/:id',
    }
  },

  // Bundle membership - REQUIRED for non-system features which workspace templates include this feature
  // core: Cannot be disabled | recommended: Enabled by default | optional: User can enable
  bundles: {
    core: [],
    recommended: ["business-pro", "fnb"],
    optional: ["startup"],
  },

  // Metadata
  tags: [
    "accounting",
    "administration"
  ],

  permissions: [
    'accounting.view',
    'accounting.create',
    'accounting.update',
    'accounting.delete',
    'accounting.manage',
  ],
})
