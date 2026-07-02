import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

/**
 * Communications Feature Configuration
 *
 * This is the single source of truth for the communications feature.
 * Unified communication platform supporting channels, DMs, calls, and AI bots.
 * 
 * Migrated from: chat + calls features
 *
 * @see lib/features/registry.ts for auto-discovery
 * @see lib/features/defineFeature.ts for schema
 */
export default defineFeature({
  // Basic Info
  id: 'communications',
  name: 'Communications',
  description: 'Unified communication platform with channels, direct messages, voice/video calls, and AI integrations',

  // UI Config
  ui: {
    icon: 'MessageSquare',
    path: '/dashboard/communications',
    component: 'CommunicationsPage',
    category: 'communication',
    order: 1,
  },

  // Technical Config
  technical: {
    featureType: 'default',
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

  generation: {
    mode: 'engine-owned',
    sharedEngineId: 'communications',
  },

  navigation: {
    aliases: ['message', 'chat'],
  },

  // Bundle membership (merged from chat + calls)
  bundles: {
    core: [],
    recommended: [
      'startup', 'business-pro', 'sales-crm',
      'project-management', 'knowledge-base',
      'personal-minimal', 'personal-productivity', 'family',
      'content-creator', 'digital-agency',
      'education', 'community',
    ],
    optional: [],
  },

  // Feature tags
  tags: [
    'communication', 'chat', 'channels', 'calls',
    'voice', 'video', 'messaging', 'dm', 'ai'
  ],

  // Required Permissions
  permissions: [
    'communications.view',
    'communications.channels.create',
    'communications.channels.manage',
    'communications.messages.send',
    'communications.messages.delete',
    'communications.calls.initiate',
    'communications.calls.manage',
    'communications.roles.manage',
    'communications.bots.manage',
  ],

  // Settings
  hasSettings: true,
  settingsPath: 'features/communications/settings',
})

// Theme configuration (migrated from chat)
export const COMMUNICATIONS_THEMES = {
  light: {
    bg: "hsl(var(--background))",
    surface: "hsl(var(--card))",
    border: "hsl(var(--border))",
    text: "hsl(var(--foreground))",
    muted: "hsl(var(--muted-foreground))",
    accent: "hsl(var(--primary))",
  },
  dark: {
    bg: "hsl(var(--background))",
    surface: "hsl(var(--card))",
    border: "hsl(var(--border))",
    text: "hsl(var(--foreground))",
    muted: "hsl(var(--muted-foreground))",
    accent: "hsl(var(--primary))",
  },
} as const
