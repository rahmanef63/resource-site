"use client"

import { createFeatureSettingsHook } from "@/frontend/shared/settings/hooks/useSettingsStorage"

/**
 * Analytics Settings Schema
 */
export interface AnalyticsSettingsSchema {
    // General
    defaultDashboard: "overview" | "traffic" | "engagement" | "conversion"
    dateRange: "7d" | "30d" | "90d" | "1y" | "custom"
    autoRefresh: boolean
    refreshInterval: 30 | 60 | 300 | 600 // seconds

    // Display
    chartType: "line" | "bar" | "area"
    showTrends: boolean
    showComparisons: boolean
    compactMode: boolean

    // Data
    includeTestData: boolean
    aggregateBy: "hour" | "day" | "week" | "month"
    showRawNumbers: boolean

    // Export
    defaultExportFormat: "csv" | "pdf" | "xlsx"
    includeCharts: boolean
}

export const DEFAULT_ANALYTICS_SETTINGS: AnalyticsSettingsSchema = {
    // General
    defaultDashboard: "overview",
    dateRange: "30d",
    autoRefresh: false,
    refreshInterval: 300,

    // Display
    chartType: "line",
    showTrends: true,
    showComparisons: true,
    compactMode: false,

    // Data
    includeTestData: false,
    aggregateBy: "day",
    showRawNumbers: false,

    // Export
    defaultExportFormat: "pdf",
    includeCharts: true,
}

export const useAnalyticsSettingsStorage = createFeatureSettingsHook<AnalyticsSettingsSchema>(
    "analytics",
    DEFAULT_ANALYTICS_SETTINGS
)
