import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

export default defineFeature({
  id: 'contacts',
  name: 'Contacts',
  description: 'Manage your contacts and connections',

  ui: {
    icon: 'Contact',
    path: '/dashboard/contacts',
    component: 'ContactsLayout',
    category: 'social',
    order: 5,
  },

  technical: {
    featureType: 'default',
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
    core: [],
    recommended: ['community', 'fnb'],
    optional: [
      'startup', 'business-pro', 'project-management',
      'personal-productivity', 'education',
    ],
  },

  tags: ['social', 'connections', 'networking', 'contacts'],

  permissions: [
    'contacts.view',
    'contacts.create',
    'contacts.update',
    'contacts.delete',
    'contacts.manage',
  ],
})

