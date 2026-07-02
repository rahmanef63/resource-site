/**
 * User Management Feature Configuration
 * 
 * Unified user management composing members, invitations, Contacts, and teams.
 * System feature - visible only to users with MANAGE_MEMBERS permission.
 */

import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

export default defineFeature({
  id: 'user-management',
  name: 'User Management',
  description: 'Unified user management: members, teams, invitations, and role hierarchy',

  ui: {
    icon: 'UserCog',
    path: '/dashboard/user-management',
    component: 'UserManagementPage',
    category: 'administration',
    order: 12,
  },

  technical: {
    featureType: 'system',
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
    mode: 'engine-owned',
    sharedEngineId: 'user-management',
  },

  // Bundle membership - SYSTEM feature, core for team workspaces
  bundles: {
    core: [
      'startup', 'business-pro', 'sales-crm',
      'project-management', 'knowledge-base',
      'family', 'digital-agency', 'education', 'community',
    ],
    recommended: [],
    optional: [],
  },

  tags: ['users', 'members', 'teams', 'roles', 'invitations', 'access-control'],

  permissions: ['MANAGE_MEMBERS'],
})

// Additional UI configuration for the feature
export const USER_MANAGEMENT_UI_CONFIG = {
  tabs: [
    { id: "team", label: "Team", icon: "Users" },
    { id: "matrix", label: "Access Matrix", icon: "Grid3X3" },
    { id: "invite", label: "Quick Invite", icon: "UserPlus" },
    { id: "roles", label: "Role Hierarchy", icon: "GitBranch" },
  ],
  propagationStrategies: [
    { id: "same", label: "Same role in all workspaces" },
    { id: "decreasing", label: "Decreasing role level" },
  ],
  inheritanceModes: [
    { id: "full", label: "Full inherit", description: "Child inherits all parent permissions" },
    { id: "restrict", label: "Restrict", description: "Child can only have subset of parent" },
    { id: "extend", label: "Extend", description: "Child can add to parent permissions" },
  ],
} as const;
