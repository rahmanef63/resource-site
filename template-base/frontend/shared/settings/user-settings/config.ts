import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

/**
 * @deprecated This feature has been moved:
 * - Profile data for AI → frontend/slices/knowledge/features/profile
 * - Account settings → frontend/shared/settings/personal
 * 
 * This config is kept for backward compatibility.
 */
export default defineFeature({
  id: 'user-settings',
  name: 'Profile',
  description: 'Manage your user profile and preferences (Deprecated - use Knowledge > Profile or Settings)',

  ui: {
    icon: 'User',
    path: '/dashboard/user-settings', // Keep original path for backward compatibility
    component: 'ProfilePage',
    category: 'administration',
    order: 20,
  },

  technical: {
    featureType: 'default',
    hasUI: true,
    hasConvex: true,
    hasTests: true,
    version: '1.0.0',
  },

  status: {
    state: 'deprecated',
    isReady: true,
  },

  // Bundle membership - empty as deprecated
  bundles: {
    core: [],
    recommended: [],
    optional: [],
  },

  tags: ['profile', 'settings', 'user', 'deprecated'],
})
