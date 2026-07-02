import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

/**
 * Forms Feature Configuration
 *
 * Form builder for data collection.
 */
export default defineFeature({
  id: 'forms',
  name: 'Forms',
  description: 'Build custom forms for data collection',

  ui: {
    icon: 'FormInput',
    path: '/dashboard/forms',
    component: 'FormsPage',
    category: 'productivity',
    order: 13,
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
    core: [],
    recommended: ['business-pro'],
    optional: ['startup', 'education', 'custom'],
  },

  tags: ['forms', 'data-collection', 'surveys'],

  permissions: ['forms.view', 'forms.create', 'forms.update', 'forms.delete', 'forms.submissions'],
})
