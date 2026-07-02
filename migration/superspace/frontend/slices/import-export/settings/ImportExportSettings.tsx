"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
    SettingsToggle,
    SettingsSelect,
    SettingsSlider,
} from "@/frontend/shared/settings/primitives"
import { useImportExportSettingsStorage } from "./useImportExportSettings"

export function ImportExportGeneralSettings() {
    const { settings, updateSetting, resetSettings, isLoaded } = useImportExportSettingsStorage()

    if (!isLoaded) return <div className="p-4 text-center text-muted-foreground">Loading...</div>

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Export Settings</CardTitle>
                            <CardDescription>Configure default export behavior</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" onClick={resetSettings}>Reset</Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsSelect
                        id="export-format"
                        label="Default Export Format"
                        description="File format used for exports"
                        value={settings.defaultExportFormat}
                        onValueChange={(v) => updateSetting("defaultExportFormat", v as typeof settings.defaultExportFormat)}
                        options={[
                            { value: "csv", label: "CSV (.csv)" },
                            { value: "json", label: "JSON (.json)" },
                            { value: "excel", label: "Excel (.xlsx)" },
                            { value: "tsv", label: "TSV (.tsv)" },
                        ]}
                    />

                    <SettingsSelect
                        id="date-format"
                        label="Date Format"
                        description="How dates are formatted in exports"
                        value={settings.dateFormat}
                        onValueChange={(v) => updateSetting("dateFormat", v as typeof settings.dateFormat)}
                        options={[
                            { value: "iso", label: "ISO 8601 (2025-01-31)" },
                            { value: "us", label: "US (01/31/2025)" },
                            { value: "eu", label: "EU (31/01/2025)" },
                            { value: "local", label: "Locale default" },
                        ]}
                    />

                    <SettingsToggle
                        id="include-headers"
                        label="Include Column Headers"
                        description="Add column names as first row in CSV/TSV"
                        checked={settings.includeHeaders}
                        onCheckedChange={(v) => updateSetting("includeHeaders", v)}
                    />

                    <SettingsToggle
                        id="compress-export"
                        label="Compress Export"
                        description="Compress exported files as .zip"
                        checked={settings.compressExport}
                        onCheckedChange={(v) => updateSetting("compressExport", v)}
                    />

                    <Separator />

                    <SettingsSlider
                        id="max-rows"
                        label={`Max Export Rows (${settings.maxExportRows.toLocaleString()})`}
                        description="Maximum number of rows per export"
                        value={settings.maxExportRows}
                        onValueChange={(v: number[]) => updateSetting("maxExportRows", v[0])}
                        min={100}
                        max={100000}
                        step={100}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export function ImportExportImportSettings() {
    const { settings, updateSetting, isLoaded } = useImportExportSettingsStorage()

    if (!isLoaded) return <div className="p-4 text-center text-muted-foreground">Loading...</div>

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Import Settings</CardTitle>
                    <CardDescription>Configure how data is imported</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsSelect
                        id="duplicate-handling"
                        label="Duplicate Handling"
                        description="What to do when duplicate records are found"
                        value={settings.duplicateHandling}
                        onValueChange={(v) => updateSetting("duplicateHandling", v as typeof settings.duplicateHandling)}
                        options={[
                            { value: "skip", label: "Skip duplicates" },
                            { value: "overwrite", label: "Overwrite existing" },
                            { value: "merge", label: "Merge fields" },
                        ]}
                    />

                    <SettingsToggle
                        id="skip-errors"
                        label="Skip Errors"
                        description="Continue importing when individual rows fail"
                        checked={settings.skipImportErrors}
                        onCheckedChange={(v) => updateSetting("skipImportErrors", v)}
                    />

                    <SettingsToggle
                        id="notify-complete"
                        label="Notify on Completion"
                        description="Send notification when import finishes"
                        checked={settings.notifyOnComplete}
                        onCheckedChange={(v) => updateSetting("notifyOnComplete", v)}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export const ImportExportSettings = ImportExportGeneralSettings
export default ImportExportSettings
