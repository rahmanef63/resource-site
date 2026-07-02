"use client"

import { createFeatureSettingsHook } from "@/frontend/shared/settings/hooks/useSettingsStorage"

export interface PlatformAdminSettingsSchema {
    notificationsEnabled: boolean
    autoSave: boolean
}

export const DEFAULT_PLATFORM_ADMIN_SETTINGS: PlatformAdminSettingsSchema = {
    notificationsEnabled: true,
    autoSave: true
}

export const usePlatformAdminSettingsStorage = createFeatureSettingsHook<PlatformAdminSettingsSchema>(
    "platform-admin",
    DEFAULT_PLATFORM_ADMIN_SETTINGS
)
