"use client"

import { createFeatureSettingsHook } from "@/frontend/shared/settings/hooks/useSettingsStorage"

export interface BISettingsSchema {
    notificationsEnabled: boolean
    autoSave: boolean
}

export const DEFAULT_BI_SETTINGS: BISettingsSchema = {
    notificationsEnabled: true,
    autoSave: true
}

export const useBISettingsStorage = createFeatureSettingsHook<BISettingsSchema>(
    "bi",
    DEFAULT_BI_SETTINGS
)
