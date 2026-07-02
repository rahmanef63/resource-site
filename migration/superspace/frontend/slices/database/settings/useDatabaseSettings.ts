"use client"

import { createFeatureSettingsHook } from "@/frontend/shared/settings/hooks/useSettingsStorage"

/**
 * Database Settings Schema
 * 
 * Defines all settings for the Database feature with their default values.
 * Used for localStorage persistence and type safety.
 */
export interface DatabaseSettingsSchema {
    // General
    defaultView: "table" | "board" | "list" | "gallery" | "calendar" | "timeline"
    autoSave: boolean
    confirmDelete: boolean
    showCreatedTime: boolean
    showLastModified: boolean

    // Display
    denseMode: boolean
    showRowNumbers: boolean
    alternatingRowColors: boolean
    stickyHeader: boolean
    wrapCellContent: boolean
    highlightOnHover: boolean

    // Performance
    lazyLoadRows: boolean
    rowsPerPage: 25 | 50 | 100 | 200
    enableVirtualization: boolean
    cacheTimeout: number // minutes

    // Editing
    inlineEditing: boolean
    doubleClickToEdit: boolean
    tabToNextCell: boolean
    autoExpandRows: boolean

    // Import/Export
    defaultExportFormat: "csv" | "json" | "xlsx"
    includeHiddenColumns: boolean
    preserveFormatting: boolean
}

export const DEFAULT_DATABASE_SETTINGS: DatabaseSettingsSchema = {
    // General
    defaultView: "table",
    autoSave: true,
    confirmDelete: true,
    showCreatedTime: false,
    showLastModified: true,

    // Display
    denseMode: false,
    showRowNumbers: false,
    alternatingRowColors: true,
    stickyHeader: true,
    wrapCellContent: false,
    highlightOnHover: true,

    // Performance
    lazyLoadRows: true,
    rowsPerPage: 50,
    enableVirtualization: true,
    cacheTimeout: 5,

    // Editing
    inlineEditing: true,
    doubleClickToEdit: true,
    tabToNextCell: true,
    autoExpandRows: false,

    // Import/Export
    defaultExportFormat: "csv",
    includeHiddenColumns: false,
    preserveFormatting: true,
}

/**
 * Hook for accessing Database settings with localStorage persistence
 * 
 * @example
 * const { settings, updateSetting, resetSettings } = useDatabaseSettings()
 * 
 * // Read a setting
 * if (settings.denseMode) { ... }
 * 
 * // Update a setting
 * updateSetting("denseMode", true)
 */
export const useDatabaseSettingsStorage = createFeatureSettingsHook<DatabaseSettingsSchema>(
    "database",
    DEFAULT_DATABASE_SETTINGS
)
