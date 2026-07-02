"use client"

import { createFeatureSettingsHook } from "@/frontend/shared/settings/hooks/useSettingsStorage"

export interface HRSettingsSchema {
    notificationsEnabled: boolean
    autoSave: boolean
}

export const DEFAULT_HR_SETTINGS: HRSettingsSchema = {
    notificationsEnabled: true,
    autoSave: true
}

export const useHRSettingsStorage = createFeatureSettingsHook<HRSettingsSchema>(
    "hr",
    DEFAULT_HR_SETTINGS
)
