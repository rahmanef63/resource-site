"use client"

/**
 * Database Feature Settings Components
 * All settings with persistence using useDatabaseSettingsStorage
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useDatabaseSettingsStorage } from "./useDatabaseSettings"
import {
    SettingsSection,
    SettingsToggle,
    SettingsSelect,
    SettingsSlider,
} from "@/frontend/shared/settings/primitives"

// ============================================================================
// Database General Settings
// ============================================================================

export function DatabaseGeneralSettings() {
    const { settings, updateSetting, resetSettings, isLoaded } = useDatabaseSettingsStorage()

    if (!isLoaded) {
        return <div className="p-4 text-center text-muted-foreground">Loading...</div>
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>General Settings</CardTitle>
                            <CardDescription>Configure database behavior and defaults</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" onClick={resetSettings}>
                            Reset
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsSelect
                        id="default-view"
                        label="Default View"
                        description="Default view when opening a database"
                        value={settings.defaultView}
                        onValueChange={(v) => updateSetting("defaultView", v as typeof settings.defaultView)}
                        options={[
                            { value: "table", label: "Table" },
                            { value: "board", label: "Board (Kanban)" },
                            { value: "list", label: "List" },
                            { value: "gallery", label: "Gallery" },
                            { value: "calendar", label: "Calendar" },
                            { value: "timeline", label: "Timeline" },
                        ]}
                    />

                    <Separator />

                    <SettingsToggle
                        id="auto-save"
                        label="Auto-Save Changes"
                        description="Automatically save changes as you edit"
                        checked={settings.autoSave}
                        onCheckedChange={(v) => updateSetting("autoSave", v)}
                    />

                    <SettingsToggle
                        id="confirm-delete"
                        label="Confirm Before Delete"
                        description="Show confirmation dialog when deleting rows"
                        checked={settings.confirmDelete}
                        onCheckedChange={(v) => updateSetting("confirmDelete", v)}
                    />

                    <Separator />

                    <SettingsSection title="Timestamps" description="Show time information for records">
                        <SettingsToggle
                            id="show-created"
                            label="Show Created Time"
                            description="Display when records were created"
                            checked={settings.showCreatedTime}
                            onCheckedChange={(v) => updateSetting("showCreatedTime", v)}
                        />

                        <SettingsToggle
                            id="show-modified"
                            label="Show Last Modified"
                            description="Display when records were last updated"
                            checked={settings.showLastModified}
                            onCheckedChange={(v) => updateSetting("showLastModified", v)}
                        />
                    </SettingsSection>
                </CardContent>
            </Card>
        </div>
    )
}

// ============================================================================
// Database Display Settings
// ============================================================================

export function DatabaseDisplaySettings() {
    const { settings, updateSetting, isLoaded } = useDatabaseSettingsStorage()

    if (!isLoaded) {
        return <div className="p-4 text-center text-muted-foreground">Loading...</div>
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Display Settings</CardTitle>
                    <CardDescription>Customize how data is displayed</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsToggle
                        id="dense-mode"
                        label="Dense Mode"
                        description="Compact row height for more data on screen"
                        checked={settings.denseMode}
                        onCheckedChange={(v) => updateSetting("denseMode", v)}
                    />

                    <SettingsToggle
                        id="row-numbers"
                        label="Show Row Numbers"
                        description="Display row numbers in the first column"
                        checked={settings.showRowNumbers}
                        onCheckedChange={(v) => updateSetting("showRowNumbers", v)}
                    />

                    <SettingsToggle
                        id="alternating-rows"
                        label="Alternating Row Colors"
                        description="Alternate background colors for better readability"
                        checked={settings.alternatingRowColors}
                        onCheckedChange={(v) => updateSetting("alternatingRowColors", v)}
                    />

                    <SettingsToggle
                        id="sticky-header"
                        label="Sticky Header"
                        description="Keep column headers visible while scrolling"
                        checked={settings.stickyHeader}
                        onCheckedChange={(v) => updateSetting("stickyHeader", v)}
                    />

                    <SettingsToggle
                        id="wrap-content"
                        label="Wrap Cell Content"
                        description="Allow text to wrap within cells"
                        checked={settings.wrapCellContent}
                        onCheckedChange={(v) => updateSetting("wrapCellContent", v)}
                    />

                    <SettingsToggle
                        id="highlight-hover"
                        label="Highlight on Hover"
                        description="Highlight rows when hovering"
                        checked={settings.highlightOnHover}
                        onCheckedChange={(v) => updateSetting("highlightOnHover", v)}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

// ============================================================================
// Database Performance Settings
// ============================================================================

export function DatabasePerformanceSettings() {
    const { settings, updateSetting, isLoaded } = useDatabaseSettingsStorage()

    if (!isLoaded) {
        return <div className="p-4 text-center text-muted-foreground">Loading...</div>
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Performance</CardTitle>
                    <CardDescription>Optimize for large datasets</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsToggle
                        id="lazy-load"
                        label="Lazy Load Rows"
                        description="Load rows as you scroll for better performance"
                        checked={settings.lazyLoadRows}
                        onCheckedChange={(v) => updateSetting("lazyLoadRows", v)}
                    />

                    <SettingsSelect
                        id="rows-per-page"
                        label="Rows Per Page"
                        description="Number of rows to load at once"
                        value={String(settings.rowsPerPage)}
                        onValueChange={(v) => updateSetting("rowsPerPage", Number(v) as typeof settings.rowsPerPage)}
                        options={[
                            { value: "25", label: "25 rows" },
                            { value: "50", label: "50 rows" },
                            { value: "100", label: "100 rows" },
                            { value: "200", label: "200 rows" },
                        ]}
                    />

                    <SettingsToggle
                        id="virtualization"
                        label="Enable Virtualization"
                        description="Render only visible rows for large tables"
                        checked={settings.enableVirtualization}
                        onCheckedChange={(v) => updateSetting("enableVirtualization", v)}
                    />

                    <SettingsSlider
                        id="cache-timeout"
                        label="Cache Timeout"
                        description="Minutes to cache data before refreshing"
                        value={settings.cacheTimeout}
                        onValueChange={(v: number[]) => updateSetting("cacheTimeout", v[0])}
                        min={1}
                        max={30}
                        step={1}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

// ============================================================================
// Database Editing Settings
// ============================================================================

export function DatabaseEditingSettings() {
    const { settings, updateSetting, isLoaded } = useDatabaseSettingsStorage()

    if (!isLoaded) {
        return <div className="p-4 text-center text-muted-foreground">Loading...</div>
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Editing</CardTitle>
                    <CardDescription>Configure editing behavior</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsToggle
                        id="inline-editing"
                        label="Inline Editing"
                        description="Edit cells directly in the table view"
                        checked={settings.inlineEditing}
                        onCheckedChange={(v) => updateSetting("inlineEditing", v)}
                    />

                    <SettingsToggle
                        id="double-click-edit"
                        label="Double-Click to Edit"
                        description="Require double-click to start editing"
                        checked={settings.doubleClickToEdit}
                        onCheckedChange={(v) => updateSetting("doubleClickToEdit", v)}
                        disabled={!settings.inlineEditing}
                    />

                    <SettingsToggle
                        id="tab-navigation"
                        label="Tab to Next Cell"
                        description="Use Tab key to move between cells"
                        checked={settings.tabToNextCell}
                        onCheckedChange={(v) => updateSetting("tabToNextCell", v)}
                    />

                    <SettingsToggle
                        id="auto-expand"
                        label="Auto-Expand Rows"
                        description="Automatically expand rows when editing long content"
                        checked={settings.autoExpandRows}
                        onCheckedChange={(v) => updateSetting("autoExpandRows", v)}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

// ============================================================================
// Database Import/Export Settings
// ============================================================================

export function DatabaseExportSettings() {
    const { settings, updateSetting, isLoaded } = useDatabaseSettingsStorage()

    if (!isLoaded) {
        return <div className="p-4 text-center text-muted-foreground">Loading...</div>
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Import & Export</CardTitle>
                    <CardDescription>Configure import and export preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsSelect
                        id="export-format"
                        label="Default Export Format"
                        description="Preferred format when exporting data"
                        value={settings.defaultExportFormat}
                        onValueChange={(v) => updateSetting("defaultExportFormat", v as typeof settings.defaultExportFormat)}
                        options={[
                            { value: "csv", label: "CSV" },
                            { value: "json", label: "JSON" },
                            { value: "xlsx", label: "Excel (XLSX)" },
                        ]}
                    />

                    <Separator />

                    <SettingsToggle
                        id="include-hidden"
                        label="Include Hidden Columns"
                        description="Export columns that are hidden in the view"
                        checked={settings.includeHiddenColumns}
                        onCheckedChange={(v) => updateSetting("includeHiddenColumns", v)}
                    />

                    <SettingsToggle
                        id="preserve-formatting"
                        label="Preserve Formatting"
                        description="Keep cell formatting when exporting"
                        checked={settings.preserveFormatting}
                        onCheckedChange={(v) => updateSetting("preserveFormatting", v)}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

// Default export
export const DatabaseSettings = DatabaseGeneralSettings
