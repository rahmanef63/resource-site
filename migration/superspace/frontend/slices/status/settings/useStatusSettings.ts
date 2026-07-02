"use client"

import { createFeatureSettingsHook } from "@/frontend/shared/settings/hooks/useSettingsStorage"

/**
 * Status Settings Schema
 */
export interface StatusSettingsSchema {
  // General
  autoExpireHours: 24 | 48 | 72
  defaultStatusType: "photo" | "video" | "text"
  allowComments: boolean
  allowReactions: boolean
  
  // Privacy
  visibility: "everyone" | "contacts" | "selected" | "nobody"
  hideFromList: string[] // user IDs
  muteStatusFromList: string[] // user IDs
  
  // Viewing
  showSeenList: boolean
  allowReplies: boolean
  notifyOnViews: boolean
  
  // Media
  uploadQuality: "original" | "high" | "medium" | "low"
  autoDownload: boolean
  allowResharing: boolean
}

export const DEFAULT_STATUS_SETTINGS: StatusSettingsSchema = {
  // General
  autoExpireHours: 24,
  defaultStatusType: "photo",
  allowComments: true,
  allowReactions: true,
  
  // Privacy
  visibility: "everyone",
  hideFromList: [],
  muteStatusFromList: [],
  
  // Viewing
  showSeenList: true,
  allowReplies: true,
  notifyOnViews: false,
  
  // Media
  uploadQuality: "high",
  autoDownload: true,
  allowResharing: true,
}

export const useStatusSettingsStorage = createFeatureSettingsHook<StatusSettingsSchema>(
  "status",
  DEFAULT_STATUS_SETTINGS
)
