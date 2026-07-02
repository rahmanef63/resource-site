/**
 * ERP Inventory Module Configuration
 */

import { defineFeature } from "@/frontend/shared/lib/features/defineFeature"

export default defineFeature({
  id: 'inventory',
  name: 'Inventory Management',
  description: 'Comprehensive inventory management with multi-warehouse support, stock tracking, and demand forecasting',

  ui: {
    icon: 'Package',
    path: '/dashboard/erp/inventory',
    component: 'InventoryPage',
    category: 'administration',
    order: 110,
  },

  technical: {
    featureType: 'optional',
    hasUI: true,
    hasConvex: true,
    hasTests: true,
    version: '1.0.0',
  },

  dependencies: [],

  status: {
    state: 'stable',
    isReady: true,
  },

  bundles: {
    core: [],
    recommended: ["business-pro"],
    optional: ["startup", "digital-agency"],
  },

  permissions: [
    'erp.inventory.view',
    'erp.inventory.create',
    'erp.inventory.edit',
    'erp.inventory.delete',
    'erp.inventory.transfer',
    'erp.inventory.adjust',
  ],

  tags: ["erp", "inventory", "warehouse", "stock"],
})
