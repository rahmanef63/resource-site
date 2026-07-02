"use client"

import { createFeatureSettingsHook } from "@/frontend/shared/settings/hooks/useSettingsStorage"

/**
 * Inventory Settings Schema
 */
export interface InventorySettingsSchema {
    // General
    defaultView: "grid" | "list" | "table"
    lowStockThreshold: number
    showOutOfStock: boolean
    trackQuantity: boolean

    // Display
    showStockLevels: boolean
    showPrices: boolean
    unitFormat: "units" | "pieces" | "items" | "custom"
    showImages: boolean
    imageSize: "small" | "medium" | "large"

    // Alerts
    lowStockNotifications: boolean
    outOfStockNotifications: boolean
    expiryWarnings: boolean
    expiryWarningDays: 7 | 14 | 30 | 60

    // Automation
    autoReorder: boolean
    reorderPoint: number
    reorderQuantity: number
}

export const DEFAULT_INVENTORY_SETTINGS: InventorySettingsSchema = {
    // General
    defaultView: "table",
    lowStockThreshold: 10,
    showOutOfStock: true,
    trackQuantity: true,

    // Display
    showStockLevels: true,
    showPrices: true,
    unitFormat: "units",
    showImages: true,
    imageSize: "medium",

    // Alerts
    lowStockNotifications: true,
    outOfStockNotifications: true,
    expiryWarnings: false,
    expiryWarningDays: 14,

    // Automation
    autoReorder: false,
    reorderPoint: 5,
    reorderQuantity: 20,
}

export const useInventorySettingsStorage = createFeatureSettingsHook<InventorySettingsSchema>(
    "inventory",
    DEFAULT_INVENTORY_SETTINGS
)
