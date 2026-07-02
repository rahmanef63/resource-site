/**
 * ERP CRM Module Configuration
 */

import { defineFeature } from "@/frontend/shared/lib/features/defineFeature"

export default defineFeature({
  id: 'crm',
  name: 'CRM',
  description: 'Customer Relationship Management with contacts, leads, opportunities, and sales pipeline',

  ui: {
    icon: 'Handshake',
    path: '/dashboard/erp/crm',
    component: 'CrmView',
    category: 'administration',
    order: 120,
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
    recommended: ["business-pro", "sales-crm", "digital-agency"],
    optional: ["startup"],
  },

  permissions: [
    'erp.crm.view',
    'erp.crm.create',
    'erp.crm.edit',
    'erp.crm.delete',
    'erp.crm.export',
  ],

  tags: ["erp", "crm", "customers", "leads", "sales"],

  appStore: {
    badge: 'new',
    longDescription: 'A full-featured CRM built into your workspace. Track contacts, companies, and deals through a visual sales pipeline. Log calls and emails, set follow-up reminders, and analyze conversion rates with built-in reports. Integrates with Communications for seamless customer conversations.',
    highlights: [
      'Visual drag-and-drop sales pipeline',
      'Contact and company management',
      'Deal tracking with custom stages',
      'Activity timeline and follow-up reminders',
      'Sales reports and conversion analytics',
      'Integrates with Communications and Email',
    ],
  },
})
