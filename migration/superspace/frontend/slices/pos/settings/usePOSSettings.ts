"use client"

import { createFeatureSettingsHook } from "@/frontend/shared/settings/hooks/useSettingsStorage"

export interface POSSettingsSchema {
    notificationsEnabled: boolean
    autoSave: boolean
    currency: string
    taxDisplay: "inclusive" | "exclusive" | "hidden"
    receiptFormat: "detailed" | "compact" | "none"
    autoPrintReceipt: boolean
    barcodeScanner: boolean
    cashDrawer: boolean
    lowStockWarning: boolean
    lowStockThreshold: number
    roundingMode: "none" | "up" | "nearest"
}

export const DEFAULT_POS_SETTINGS: POSSettingsSchema = {
    notificationsEnabled: true,
    autoSave: true,
    currency: "USD",
    taxDisplay: "inclusive",
    receiptFormat: "detailed",
    autoPrintReceipt: false,
    barcodeScanner: false,
    cashDrawer: false,
    lowStockWarning: true,
    lowStockThreshold: 5,
    roundingMode: "nearest",
}

export const usePOSSettingsStorage = createFeatureSettingsHook<POSSettingsSchema>(
    "pos",
    DEFAULT_POS_SETTINGS
)
