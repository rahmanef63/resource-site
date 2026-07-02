"use client"

/**
 * Projects Settings Hook
 * Provides persistent storage for projects feature settings
 */

import { createFeatureSettingsHook } from "@/frontend/shared/settings/hooks/useSettingsStorage"

/**
 * Schema for Projects Settings
 */
export interface ProjectsSettingsSchema {
  // Display settings
  defaultView: "grid" | "list" | "timeline" | "kanban"
  showArchived: boolean
  enableTemplates: boolean
  autoArchiveDays: "30" | "60" | "90" | "180" | "never"
  compactMode: boolean
  showProgress: boolean
  
  // Collaboration settings
  allowGuestAccess: boolean
  defaultRole: "viewer" | "member" | "editor" | "admin"
  notifyOnJoin: boolean
  requireApproval: boolean
  allowComments: boolean
  enableMentions: boolean
  
  // Timeline settings
  showMilestones: boolean
  showDeadlines: boolean
  defaultTimeRange: "week" | "month" | "quarter" | "year"
  highlightOverdue: boolean
  
  // Workflow settings
  enableStatuses: boolean
  defaultStatus: "planning" | "active" | "on-hold" | "completed"
  requireDescription: boolean
  enableTags: boolean
  autoAssignCreator: boolean
}

/**
 * Default values for Projects settings
 */
export const defaultProjectsSettings: ProjectsSettingsSchema = {
  // Display settings
  defaultView: "grid",
  showArchived: false,
  enableTemplates: true,
  autoArchiveDays: "90",
  compactMode: false,
  showProgress: true,
  
  // Collaboration settings
  allowGuestAccess: false,
  defaultRole: "member",
  notifyOnJoin: true,
  requireApproval: true,
  allowComments: true,
  enableMentions: true,
  
  // Timeline settings
  showMilestones: true,
  showDeadlines: true,
  defaultTimeRange: "month",
  highlightOverdue: true,
  
  // Workflow settings
  enableStatuses: true,
  defaultStatus: "planning",
  requireDescription: false,
  enableTags: true,
  autoAssignCreator: true,
}

/**
 * Hook for managing projects settings with persistence
 */
export const useProjectsSettingsStorage = createFeatureSettingsHook<ProjectsSettingsSchema>(
  "projects",
  defaultProjectsSettings
)
