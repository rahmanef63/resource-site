"use client"

import { createFeatureSettingsHook } from "@/frontend/shared/settings/hooks/useSettingsStorage"

/**
 * Automation Settings Schema
 */
export interface AutomationSettingsSchema {
    // General
    defaultView: "workflows" | "triggers" | "history"
    enableAutomations: boolean
    maxConcurrent: 5 | 10 | 25 | 50

    // Execution
    retryOnFailure: boolean
    maxRetries: 1 | 3 | 5
    retryDelay: 60 | 300 | 900 // seconds
    timeout: 30 | 60 | 300 | 600 // seconds

    // Notifications
    notifyOnSuccess: boolean
    notifyOnFailure: boolean
    notifyOnComplete: boolean

    // Logging
    logLevel: "minimal" | "normal" | "verbose"
    retainLogs: 7 | 30 | 90 // days
    showDebugInfo: boolean
}

export const DEFAULT_AUTOMATION_SETTINGS: AutomationSettingsSchema = {
    // General
    defaultView: "workflows",
    enableAutomations: true,
    maxConcurrent: 10,

    // Execution
    retryOnFailure: true,
    maxRetries: 3,
    retryDelay: 300,
    timeout: 60,

    // Notifications
    notifyOnSuccess: false,
    notifyOnFailure: true,
    notifyOnComplete: false,

    // Logging
    logLevel: "normal",
    retainLogs: 30,
    showDebugInfo: false,
}

export const useAutomationSettingsStorage = createFeatureSettingsHook<AutomationSettingsSchema>(
    "automation",
    DEFAULT_AUTOMATION_SETTINGS
)
