import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

/**
 * Calendar Feature Configuration
 *
 * Team calendar with event management and scheduling.
 */
export default defineFeature({
  id: 'calendar',
  name: 'Calendar',
  description: 'Team calendar with event management and scheduling',

  ui: {
    icon: 'Calendar',
    path: '/dashboard/calendar',
    component: 'CalendarPage',
    category: 'productivity',
    order: 10,
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
    sharedEngineId: 'calendar',
  },

  navigation: {
    aliases: ['event', 'deadline'],
    patterns: {
      'event': 'event/:id',
    }
  },

  agent: {
    definitionPath: "convex/features/calendar/agent.ts",
    capabilities: ["create", "read", "update", "delete", "search"],
  },

  bundles: {
    core: [],
    recommended: ['business-pro', 'project-management'],
    optional: ['startup', 'personal-productivity', 'education'],
  },

  tags: ['scheduling', 'events', 'productivity'],

  permissions: ['calendar.view', 'calendar.create', 'calendar.update', 'calendar.delete'],
})
