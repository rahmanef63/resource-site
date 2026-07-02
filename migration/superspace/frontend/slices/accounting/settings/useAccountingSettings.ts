"use client"

import { createFeatureSettingsHook } from "@/frontend/shared/settings/hooks/useSettingsStorage"

export interface AccountingSettingsSchema {
    notificationsEnabled: boolean
    autoSave: boolean
}

export const DEFAULT_ACCOUNTING_SETTINGS: AccountingSettingsSchema = {
    notificationsEnabled: true,
    autoSave: true
}

export const useAccountingSettingsStorage = createFeatureSettingsHook<AccountingSettingsSchema>(
    "accounting",
    DEFAULT_ACCOUNTING_SETTINGS
)
