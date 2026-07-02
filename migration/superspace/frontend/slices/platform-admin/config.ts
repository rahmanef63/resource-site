import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

/**
 * Platform Admin Feature Configuration
 *
 * This is the single source of truth for the platform-admin feature.
 * Auto-discovered by the feature registry system.
 *
 * @see lib/features/registry.ts for auto-discovery
 * @see lib/features/defineFeature.ts for schema
 */
export default defineFeature({
  // Basic Info
  id: 'platform-admin',
  name: 'Platform Admin',
  description: 'Super Admin panel for managing features, workspaces, and system configuration',

  // UI Config
  ui: {
    icon: 'Shield',
    path: '/dashboard/platform-admin',
    component: 'PlatformAdminPageNew',
    category: 'administration',
    order: 999, // Always at the end in sidebar
  },

  // Technical Config
  technical: {
    featureType: 'system',
    hasUI: true,
    hasConvex: true,
    hasTests: true,
    version: '1.0.0',
  },

  // Development Status
  status: {
    state: 'stable',
    isReady: true,
  },

  // Metadata
  tags: ['admin', 'system', 'platform', 'management', 'superadmin'],
  permissions: ['PLATFORM_ADMIN'],
})
