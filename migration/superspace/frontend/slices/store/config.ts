import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

export default defineFeature({
  id: 'store',
  name: 'Store',
  description:
    'Unified store: workspace hierarchy + menu management. Role-gated tabs — Workspace visible to all members, Menu visible to roles with manage_menus permission.',

  ui: {
    icon: 'Store',
    path: '/dashboard/store',
    component: 'StorePage',
    category: 'administration',
    order: 5,
  },

  technical: {
    featureType: 'system',
    hasUI: true,
    hasConvex: false,
    hasTests: true,
    version: '1.0.0',
  },

  status: {
    state: 'stable',
    isReady: true,
  },

  bundles: {
    core: [],
    recommended: [],
    optional: [],
  },

  tags: ['workspace', 'menus', 'system', 'administration'],

  permissions: ['MANAGE_WORKSPACES', 'MANAGE_MENUS'],
})
