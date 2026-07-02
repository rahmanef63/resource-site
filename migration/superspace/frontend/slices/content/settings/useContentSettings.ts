"use client"

import { createFeatureSettingsHook } from "@/frontend/shared/settings/hooks/useSettingsStorage"

export interface ContentSettingsSchema {
    notificationsEnabled: boolean
    autoSave: boolean
}

export const DEFAULT_CONTENT_SETTINGS: ContentSettingsSchema = {
    notificationsEnabled: true,
    autoSave: true
}

export const useContentSettingsStorage = createFeatureSettingsHook<ContentSettingsSchema>(
    "content",
    DEFAULT_CONTENT_SETTINGS
)
