import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

export default defineFeature({
  id: 'tasks',
  name: 'Tasks',
  description: 'Task management and tracking',

  ui: {
    icon: 'CheckSquare',
    path: '/dashboard/tasks',
    component: 'TasksPage',
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

  navigation: {
    aliases: ['task'],
    patterns: {
      'task': '?id=:id', // Assuming task modal/sidebar
    }
  },

  agent: {
    definitionPath: "convex/features/tasks/agent.ts",
    capabilities: ["create", "read", "update", "delete", "search"],
  },

  // Bundle membership
  bundles: {
    core: [],
    recommended: [
      'startup', 'business-pro', 'project-management',
      'personal-productivity', 'digital-agency', 'education',
    ],
    optional: [
      'sales-crm', 'knowledge-base', 'personal-minimal',
      'family', 'content-creator', 'community',
    ],
  },

  tags: ['productivity', 'project-management'],

  permissions: [
    'tasks.view',
    'tasks.create',
    'tasks.update',
    'tasks.delete',
    'tasks.assign',
    'tasks.manage',
  ],

  // Export/Import integration
  hasExportImport: true,
  exportConfigPath: 'features/tasks/data/export-config',

  appStore: {
    badge: 'popular',
    longDescription: 'Tasks is your workspace command center for getting things done. Create, assign, and track work items with due dates, priorities, and custom statuses. Use kanban boards, list views, and timeline views to visualize progress. Attach files, leave comments, and @mention teammates — all in one place.',
    highlights: [
      'Kanban board, list, and timeline views',
      'Assign tasks to team members with due dates',
      'Custom statuses and priority levels',
      'File attachments and threaded comments',
      'Recurring tasks and dependencies',
      'Bulk actions and keyboard shortcuts',
    ],
    whatsNew: 'Added timeline (Gantt) view, bulk status updates, and task dependencies.',
  },
})
