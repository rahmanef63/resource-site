"use client"

import { createFeatureSettingsHook } from "@/frontend/shared/settings/hooks/useSettingsStorage"

export interface UserManagementSettingsSchema {
    notificationsEnabled: boolean
    autoSave: boolean
    defaultRole: "member" | "viewer" | "editor"
    inviteExpiryDays: number
    sendWelcomeEmail: boolean
    sessionTimeoutMinutes: number
    enforce2FA: boolean
    allowGuestAccess: boolean
    notifyOnNewUser: boolean
    notifyOnRoleChange: boolean
    autoDeactivateInactiveDays: number
}

export const DEFAULT_USER_MANAGEMENT_SETTINGS: UserManagementSettingsSchema = {
    notificationsEnabled: true,
    autoSave: true,
    defaultRole: "member",
    inviteExpiryDays: 7,
    sendWelcomeEmail: true,
    sessionTimeoutMinutes: 0,
    enforce2FA: false,
    allowGuestAccess: false,
    notifyOnNewUser: true,
    notifyOnRoleChange: false,
    autoDeactivateInactiveDays: 0,
}

export const useUserManagementSettingsStorage = createFeatureSettingsHook<UserManagementSettingsSchema>(
    "user-management",
    DEFAULT_USER_MANAGEMENT_SETTINGS
)
