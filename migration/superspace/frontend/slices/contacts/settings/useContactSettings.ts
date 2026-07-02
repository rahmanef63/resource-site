"use client"

import { createFeatureSettingsHook } from "@/frontend/shared/settings/hooks/useSettingsStorage"

export interface ContactSettingsSchema {
    notificationsEnabled: boolean
    autoSave: boolean
}

export const DEFAULT_CONTACT_SETTINGS: ContactSettingsSchema = {
    notificationsEnabled: true,
    autoSave: true
}

export const useContactSettingsStorage = createFeatureSettingsHook<ContactSettingsSchema>(
    "contact",
    DEFAULT_CONTACT_SETTINGS
)
