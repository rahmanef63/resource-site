"use client"

import { createFeatureSettingsHook } from "@/frontend/shared/settings/hooks/useSettingsStorage"

export interface AuditLogSettingsSchema {
    notificationsEnabled: boolean
    autoSave: boolean
}

export const DEFAULT_AUDIT_LOG_SETTINGS: AuditLogSettingsSchema = {
    notificationsEnabled: true,
    autoSave: true
}

export const useAuditLogSettingsStorage = createFeatureSettingsHook<AuditLogSettingsSchema>(
    "audit-log",
    DEFAULT_AUDIT_LOG_SETTINGS
)
