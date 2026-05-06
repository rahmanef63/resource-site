"use client"

/**
 * Notifications Settings Hook
 * Provides persistent storage for notifications feature settings
 */

import { createFeatureSettingsHook } from "@/frontend/shared/settings/hooks/useSettingsStorage"

/**
 * Schema for Notifications Settings
 */
export interface NotificationsSettingsSchema {
  // General settings
  enabled: boolean
  sound: boolean
  soundVolume: number
  desktop: boolean
  email: boolean
  badge: boolean
  
  // Quiet hours settings
  quietHoursEnabled: boolean
  quietStartTime: "20:00" | "21:00" | "22:00" | "23:00" | "00:00"
  quietEndTime: "05:00" | "06:00" | "07:00" | "08:00" | "09:00"
  allowUrgent: boolean
  weekendsOnly: boolean
  
  // Filter settings
  priorityFilter: "all" | "high" | "medium-high"
  mentionsOnly: boolean
  groupNotifications: boolean
  groupDelay: "instant" | "1min" | "5min" | "15min"
  
  // Feature-specific settings
  chatNotifications: boolean
  taskNotifications: boolean
  projectNotifications: boolean
  calendarNotifications: boolean
  documentNotifications: boolean
  systemNotifications: boolean
}

/**
 * Default values for Notifications settings
 */
export const defaultNotificationsSettings: NotificationsSettingsSchema = {
  // General settings
  enabled: true,
  sound: true,
  soundVolume: 0.7,
  desktop: true,
  email: false,
  badge: true,
  
  // Quiet hours settings
  quietHoursEnabled: false,
  quietStartTime: "22:00",
  quietEndTime: "07:00",
  allowUrgent: true,
  weekendsOnly: false,
  
  // Filter settings
  priorityFilter: "all",
  mentionsOnly: false,
  groupNotifications: true,
  groupDelay: "5min",
  
  // Feature-specific settings
  chatNotifications: true,
  taskNotifications: true,
  projectNotifications: true,
  calendarNotifications: true,
  documentNotifications: true,
  systemNotifications: true,
}

/**
 * Hook for managing notifications settings with persistence
 */
export const useNotificationsSettingsStorage = createFeatureSettingsHook<NotificationsSettingsSchema>(
  "notifications",
  defaultNotificationsSettings
)
