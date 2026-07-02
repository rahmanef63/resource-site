"use client"

import { createFeatureSettingsHook } from "@/frontend/shared/settings/hooks/useSettingsStorage"

// ============================================================================
// Settings Schema
// ============================================================================

export interface OverviewSettingsSchema {
    // Display Settings
    notificationsEnabled: boolean
    autoRefresh: boolean
    refreshInterval: number // in seconds

    // Widget Visibility
    showStats: boolean
    showRecentActivity: boolean
    showTeamComposition: boolean
    showRecentItems: boolean
    showUpcomingEvents: boolean
    showAIChat: boolean

    // Stats Configuration
    defaultTimeRange: "today" | "7d" | "30d" | "90d"

    // AI Settings
    aiQuickPromptsEnabled: boolean
}

export const DEFAULT_OVERVIEW_SETTINGS: OverviewSettingsSchema = {
    // Display Settings
    notificationsEnabled: true,
    autoRefresh: false,
    refreshInterval: 300, // 5 minutes

    // Widget Visibility - all enabled by default
    showStats: true,
    showRecentActivity: true,
    showTeamComposition: true,
    showRecentItems: true,
    showUpcomingEvents: true,
    showAIChat: true,

    // Stats Configuration
    defaultTimeRange: "30d",

    // AI Settings
    aiQuickPromptsEnabled: true,
}

export const useOverviewSettingsStorage = createFeatureSettingsHook<OverviewSettingsSchema>(
    "overview",
    DEFAULT_OVERVIEW_SETTINGS
)
