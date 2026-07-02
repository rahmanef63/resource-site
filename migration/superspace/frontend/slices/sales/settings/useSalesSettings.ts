"use client"

import { createFeatureSettingsHook } from "@/frontend/shared/settings/hooks/useSettingsStorage"

export interface SalesSettingsSchema {
    notificationsEnabled: boolean
    autoSave: boolean
}

export const DEFAULT_SALES_SETTINGS: SalesSettingsSchema = {
    notificationsEnabled: true,
    autoSave: true
}

export const useSalesSettingsStorage = createFeatureSettingsHook<SalesSettingsSchema>(
    "sales",
    DEFAULT_SALES_SETTINGS
)
