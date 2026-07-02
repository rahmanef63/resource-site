"use client"

import { createFeatureSettingsHook } from "@/frontend/shared/settings/hooks/useSettingsStorage"

export interface ImportExportSettingsSchema {
    notificationsEnabled: boolean
    autoSave: boolean
    defaultExportFormat: "csv" | "json" | "excel" | "tsv"
    includeHeaders: boolean
    dateFormat: "iso" | "local" | "us" | "eu"
    maxExportRows: number
    compressExport: boolean
    skipImportErrors: boolean
    duplicateHandling: "skip" | "overwrite" | "merge"
    notifyOnComplete: boolean
}

export const DEFAULT_IMPORT_EXPORT_SETTINGS: ImportExportSettingsSchema = {
    notificationsEnabled: true,
    autoSave: true,
    defaultExportFormat: "csv",
    includeHeaders: true,
    dateFormat: "iso",
    maxExportRows: 10000,
    compressExport: false,
    skipImportErrors: false,
    duplicateHandling: "skip",
    notifyOnComplete: true,
}

export const useImportExportSettingsStorage = createFeatureSettingsHook<ImportExportSettingsSchema>(
    "import-export",
    DEFAULT_IMPORT_EXPORT_SETTINGS
)
