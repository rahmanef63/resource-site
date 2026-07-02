"use client"

import { createFeatureSettingsHook } from "@/frontend/shared/settings/hooks/useSettingsStorage"

export interface CmsLiteSettingsSchema {
    notificationsEnabled: boolean
    defaultPublishStatus: "draft" | "published" | "scheduled"
    autoSaveDraft: boolean
    autoSaveIntervalSeconds: number
    enableVersionHistory: boolean
    enableSEOFields: boolean
    enableTags: boolean
    defaultContentType: "article" | "page" | "post"
    imageOptimization: boolean
    allowComments: boolean
}

export const DEFAULT_cmsLite_SETTINGS: CmsLiteSettingsSchema = {
    notificationsEnabled: true,
    defaultPublishStatus: "draft",
    autoSaveDraft: true,
    autoSaveIntervalSeconds: 30,
    enableVersionHistory: true,
    enableSEOFields: true,
    enableTags: true,
    defaultContentType: "article",
    imageOptimization: true,
    allowComments: false,
}

export const useCmsLiteSettingsStorage = createFeatureSettingsHook<CmsLiteSettingsSchema>(
    "cms-lite",
    DEFAULT_cmsLite_SETTINGS
)
