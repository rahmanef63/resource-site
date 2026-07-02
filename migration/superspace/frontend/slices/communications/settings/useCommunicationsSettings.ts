"use client"

import { createFeatureSettingsHook } from "@/frontend/shared/settings/hooks/useSettingsStorage"

export interface CommunicationsSettingsSchema {
    notificationsEnabled: boolean
    emailEnabled: boolean
    smsEnabled: boolean
    pushEnabled: boolean
    inAppEnabled: boolean
    defaultSendChannel: "email" | "sms" | "push" | "in-app"
    retryFailedMessages: boolean
    retryAttempts: number
    notifyOnDelivery: boolean
    notifyOnFailure: boolean
    archiveAfterDays: number
}

export const DEFAULT_COMMUNICATIONS_SETTINGS: CommunicationsSettingsSchema = {
    notificationsEnabled: true,
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    inAppEnabled: true,
    defaultSendChannel: "email",
    retryFailedMessages: true,
    retryAttempts: 3,
    notifyOnDelivery: false,
    notifyOnFailure: true,
    archiveAfterDays: 90,
}

export const useCommunicationsSettingsStorage = createFeatureSettingsHook<CommunicationsSettingsSchema>(
    "communications",
    DEFAULT_COMMUNICATIONS_SETTINGS
)
