"use client"

import { createFeatureSettingsHook } from "@/frontend/shared/settings/hooks/useSettingsStorage"

export interface IntegrationsSettingsSchema {
    notificationsEnabled: boolean
    autoSave: boolean
    apiTimeoutSeconds: number
    retryAttempts: number
    webhookEnabled: boolean
    autoRefreshTokens: boolean
    logApiCalls: boolean
    sandboxMode: boolean
    notifyOnDisconnect: boolean
    notifyOnError: boolean
}

export const DEFAULT_INTEGRATIONS_SETTINGS: IntegrationsSettingsSchema = {
    notificationsEnabled: true,
    autoSave: true,
    apiTimeoutSeconds: 30,
    retryAttempts: 3,
    webhookEnabled: true,
    autoRefreshTokens: true,
    logApiCalls: false,
    sandboxMode: false,
    notifyOnDisconnect: true,
    notifyOnError: true,
}

export const useIntegrationsSettingsStorage = createFeatureSettingsHook<IntegrationsSettingsSchema>(
    "integrations",
    DEFAULT_INTEGRATIONS_SETTINGS
)
