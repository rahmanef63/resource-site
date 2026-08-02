"use client"

/**
 * Reports Settings Hook
 * Provides persistent storage for reports feature settings
 */

import { createFeatureSettingsHook } from "@/frontend/shared/settings/hooks/useSettingsStorage"

/**
 * Schema for Reports Settings
 */
export interface ReportsSettingsSchema {
  // General settings
  defaultPeriod: "daily" | "weekly" | "monthly" | "quarterly" | "yearly"
  includeCharts: boolean
  autoGenerate: boolean
  exportFormat: "pdf" | "excel" | "csv" | "html"
  dateFormat: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD"
  
  // Scheduling settings
  schedulingEnabled: boolean
  scheduleFrequency: "daily" | "weekly" | "monthly"
  scheduleDay: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"
  sendEmail: boolean
  recipients: "owner" | "admins" | "all" | "custom"
  
  // Content settings
  includeMetrics: boolean
  includeTrends: boolean
  includeComparison: boolean
  comparisonPeriod: "previous" | "year-ago" | "custom"
  showEmptyData: boolean
  
  // Display settings
  chartStyle: "line" | "bar" | "pie" | "area"
  colorScheme: "default" | "monochrome" | "vibrant" | "pastel"
  paperSize: "a4" | "letter" | "legal"
  orientation: "portrait" | "landscape"
}

/**
 * Default values for Reports settings
 */
export const defaultReportsSettings: ReportsSettingsSchema = {
  // General settings
  defaultPeriod: "monthly",
  includeCharts: true,
  autoGenerate: false,
  exportFormat: "pdf",
  dateFormat: "MM/DD/YYYY",
  
  // Scheduling settings
  schedulingEnabled: false,
  scheduleFrequency: "weekly",
  scheduleDay: "monday",
  sendEmail: true,
  recipients: "owner",
  
  // Content settings
  includeMetrics: true,
  includeTrends: true,
  includeComparison: true,
  comparisonPeriod: "previous",
  showEmptyData: false,
  
  // Display settings
  chartStyle: "bar",
  colorScheme: "default",
  paperSize: "a4",
  orientation: "portrait",
}

/**
 * Hook for managing reports settings with persistence
 */
export const useReportsSettingsStorage = createFeatureSettingsHook<ReportsSettingsSchema>(
  "reports",
  defaultReportsSettings
)
