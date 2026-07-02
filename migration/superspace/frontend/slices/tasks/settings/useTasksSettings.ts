"use client"

import { createFeatureSettingsHook } from "@/frontend/shared/settings/hooks/useSettingsStorage"

/**
 * Tasks Settings Schema
 */
export interface TasksSettingsSchema {
  // General
  defaultView: "list" | "board" | "calendar" | "timeline"
  showCompletedTasks: boolean
  enableSubtasks: boolean
  enableTimeTracking: boolean
  showTaskIds: boolean
  compactCards: boolean
  colorBy: "priority" | "status" | "none"
  
  // Task Defaults
  defaultPriority: "low" | "medium" | "high" | "urgent"
  defaultDueDateOffset: number // days from creation
  autoAssignToCreator: boolean
  
  // Notifications
  dueDateReminders: boolean
  reminderTime: "1hour" | "1day" | "1week"
  assignmentNotifications: boolean
  statusChangeNotifications: boolean
  dailyDigest: boolean
  
  // Productivity
  enableFocusMode: boolean
  pomodoroIntegration: boolean
  pomodoroDuration: number // minutes
}

export const DEFAULT_TASKS_SETTINGS: TasksSettingsSchema = {
  // General
  defaultView: "list",
  showCompletedTasks: true,
  enableSubtasks: true,
  enableTimeTracking: false,
  showTaskIds: false,
  compactCards: false,
  colorBy: "priority",
  
  // Task Defaults
  defaultPriority: "medium",
  defaultDueDateOffset: 7,
  autoAssignToCreator: true,
  
  // Notifications
  dueDateReminders: true,
  reminderTime: "1day",
  assignmentNotifications: true,
  statusChangeNotifications: true,
  dailyDigest: false,
  
  // Productivity
  enableFocusMode: false,
  pomodoroIntegration: false,
  pomodoroDuration: 25,
}

export const useTasksSettingsStorage = createFeatureSettingsHook<TasksSettingsSchema>(
  "tasks",
  DEFAULT_TASKS_SETTINGS
)
