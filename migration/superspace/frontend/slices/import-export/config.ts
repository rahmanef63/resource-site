import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

/**
 * Import/Export Feature Configuration
 *
 * Data import and export functionality.
 */
export default defineFeature({
  id: 'import-export',
  name: 'Import/Export',
  description: 'Import and export data across workspace',

  ui: {
    icon: 'ArrowUpDown',
    path: '/dashboard/import-export',
    component: 'ImportExportPage',
    category: 'administration',
    order: 17,
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

  generation: {
    mode: 'hybrid-json',
    sharedEngineId: 'import-export',
  },

  bundles: {
    core: ['fnb'],
    recommended: ['custom', 'business-pro'],
    optional: ['startup', 'sales-crm'],
  },

  tags: ['import', 'export', 'data', 'migration'],

  permissions: ['import-export.view', 'import-export.import', 'import-export.export'],
})
