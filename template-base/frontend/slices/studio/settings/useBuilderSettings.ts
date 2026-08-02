"use client"

import { createFeatureSettingsHook } from "@/frontend/shared/settings/hooks/useSettingsStorage"

export interface BuilderSettingsSchema {
    notificationsEnabled: boolean
    autoSave: boolean
}

export const DEFAULT_BUILDER_SETTINGS: BuilderSettingsSchema = {
    notificationsEnabled: true,
    autoSave: true
}

export const useBuilderSettingsStorage = createFeatureSettingsHook<BuilderSettingsSchema>(
    "builder",
    DEFAULT_BUILDER_SETTINGS
)
