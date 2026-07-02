"use client"

/**
 * Support Settings Hook
 * Provides persistent storage for support feature settings
 */

import { createFeatureSettingsHook } from "@/frontend/shared/settings/hooks/useSettingsStorage"

/**
 * Schema for Support Settings
 */
export interface SupportSettingsSchema {
  // Ticket settings
  enableTickets: boolean
  autoAssign: boolean
  defaultPriority: "low" | "medium" | "high" | "urgent"
  showResolved: boolean
  ticketCategories: boolean
  requireCategory: boolean
  
  // Response settings
  enableCannedResponses: boolean
  requireFeedback: boolean
  autoClose: boolean
  autoCloseDays: "3" | "7" | "14" | "30" | "never"
  enableAIResponses: boolean
  
  // SLA settings
  enableSLA: boolean
  responseTimeTarget: "1h" | "4h" | "8h" | "24h" | "48h"
  resolutionTimeTarget: "24h" | "48h" | "72h" | "1week"
  escalateOnBreach: boolean
  
  // Notifications
  notifyOnNewTicket: boolean
  notifyOnAssignment: boolean
  notifyOnUpdate: boolean
  notifyOnResolution: boolean
  dailyDigest: boolean
}

/**
 * Default values for Support settings
 */
export const defaultSupportSettings: SupportSettingsSchema = {
  // Ticket settings
  enableTickets: true,
  autoAssign: true,
  defaultPriority: "medium",
  showResolved: false,
  ticketCategories: true,
  requireCategory: false,
  
  // Response settings
  enableCannedResponses: true,
  requireFeedback: false,
  autoClose: true,
  autoCloseDays: "7",
  enableAIResponses: false,
  
  // SLA settings
  enableSLA: false,
  responseTimeTarget: "4h",
  resolutionTimeTarget: "48h",
  escalateOnBreach: true,
  
  // Notifications
  notifyOnNewTicket: true,
  notifyOnAssignment: true,
  notifyOnUpdate: true,
  notifyOnResolution: true,
  dailyDigest: false,
}

/**
 * Hook for managing support settings with persistence
 */
export const useSupportSettingsStorage = createFeatureSettingsHook<SupportSettingsSchema>(
  "support",
  defaultSupportSettings
)
