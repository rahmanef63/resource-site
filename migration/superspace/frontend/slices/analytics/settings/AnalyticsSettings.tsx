"use client"

/**
 * Analytics Feature Settings Components
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useAnalyticsSettingsStorage } from "./useAnalyticsSettings"
import {
    SettingsSection,
    SettingsToggle,
    SettingsSelect,
} from "@/frontend/shared/settings/primitives"

export function AnalyticsGeneralSettings() {
    const { settings, updateSetting, resetSettings, isLoaded } = useAnalyticsSettingsStorage()

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
                            <CardDescription>Configure analytics defaults</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" onClick={resetSettings}>
                            Reset
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsSelect
                        id="dashboard"
                        label="Default Dashboard"
                        description="Dashboard shown on load"
                        value={settings.defaultDashboard}
                        onValueChange={(v) => updateSetting("defaultDashboard", v as typeof settings.defaultDashboard)}
                        options={[
                            { value: "overview", label: "Overview" },
                            { value: "traffic", label: "Traffic" },
                            { value: "engagement", label: "Engagement" },
                            { value: "conversion", label: "Conversion" },
                        ]}
                    />

                    <SettingsSelect
                        id="date-range"
                        label="Default Date Range"
                        description="Time period for analytics"
                        value={settings.dateRange}
                        onValueChange={(v) => updateSetting("dateRange", v as typeof settings.dateRange)}
                        options={[
                            { value: "7d", label: "Last 7 days" },
                            { value: "30d", label: "Last 30 days" },
                            { value: "90d", label: "Last 90 days" },
                            { value: "1y", label: "Last year" },
                            { value: "custom", label: "Custom" },
                        ]}
                    />

                    <Separator />

                    <SettingsSection title="Auto-Refresh" description="Automatic data refresh">
                        <SettingsToggle
                            id="auto-refresh"
                            label="Enable Auto-Refresh"
                            description="Automatically refresh data"
                            checked={settings.autoRefresh}
                            onCheckedChange={(v) => updateSetting("autoRefresh", v)}
                        />

                        <SettingsSelect
                            id="refresh-interval"
                            label="Refresh Interval"
                            description="How often to refresh"
                            value={String(settings.refreshInterval)}
                            onValueChange={(v) => updateSetting("refreshInterval", Number(v) as typeof settings.refreshInterval)}
                            options={[
                                { value: "30", label: "30 seconds" },
                                { value: "60", label: "1 minute" },
                                { value: "300", label: "5 minutes" },
                                { value: "600", label: "10 minutes" },
                            ]}
                            disabled={!settings.autoRefresh}
                        />
                    </SettingsSection>
                </CardContent>
            </Card>
        </div>
    )
}

export function AnalyticsDisplaySettings() {
    const { settings, updateSetting, isLoaded } = useAnalyticsSettingsStorage()

    if (!isLoaded) {
        return <div className="p-4 text-center text-muted-foreground">Loading...</div>
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Display Settings</CardTitle>
                    <CardDescription>Customize chart and data display</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsSelect
                        id="chart-type"
                        label="Default Chart Type"
                        description="How data is visualized"
                        value={settings.chartType}
                        onValueChange={(v) => updateSetting("chartType", v as typeof settings.chartType)}
                        options={[
                            { value: "line", label: "Line Chart" },
                            { value: "bar", label: "Bar Chart" },
                            { value: "area", label: "Area Chart" },
                        ]}
                    />

                    <Separator />

                    <SettingsToggle
                        id="trends"
                        label="Show Trends"
                        description="Display trend indicators"
                        checked={settings.showTrends}
                        onCheckedChange={(v) => updateSetting("showTrends", v)}
                    />

                    <SettingsToggle
                        id="comparisons"
                        label="Show Comparisons"
                        description="Compare to previous periods"
                        checked={settings.showComparisons}
                        onCheckedChange={(v) => updateSetting("showComparisons", v)}
                    />

                    <SettingsToggle
                        id="compact"
                        label="Compact Mode"
                        description="Show more data in less space"
                        checked={settings.compactMode}
                        onCheckedChange={(v) => updateSetting("compactMode", v)}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export function AnalyticsDataSettings() {
    const { settings, updateSetting, isLoaded } = useAnalyticsSettingsStorage()

    if (!isLoaded) {
        return <div className="p-4 text-center text-muted-foreground">Loading...</div>
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Data Settings</CardTitle>
                    <CardDescription>Configure data processing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsToggle
                        id="test-data"
                        label="Include Test Data"
                        description="Include test/debug data in reports"
                        checked={settings.includeTestData}
                        onCheckedChange={(v) => updateSetting("includeTestData", v)}
                    />

                    <SettingsSelect
                        id="aggregate"
                        label="Aggregate By"
                        description="Time granularity for data"
                        value={settings.aggregateBy}
                        onValueChange={(v) => updateSetting("aggregateBy", v as typeof settings.aggregateBy)}
                        options={[
                            { value: "hour", label: "Hourly" },
                            { value: "day", label: "Daily" },
                            { value: "week", label: "Weekly" },
                            { value: "month", label: "Monthly" },
                        ]}
                    />

                    <SettingsToggle
                        id="raw-numbers"
                        label="Show Raw Numbers"
                        description="Display exact values instead of rounded"
                        checked={settings.showRawNumbers}
                        onCheckedChange={(v) => updateSetting("showRawNumbers", v)}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export function AnalyticsExportSettings() {
    const { settings, updateSetting, isLoaded } = useAnalyticsSettingsStorage()

    if (!isLoaded) {
        return <div className="p-4 text-center text-muted-foreground">Loading...</div>
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Export Settings</CardTitle>
                    <CardDescription>Configure report exports</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsSelect
                        id="export-format"
                        label="Default Export Format"
                        description="Preferred format for exports"
                        value={settings.defaultExportFormat}
                        onValueChange={(v) => updateSetting("defaultExportFormat", v as typeof settings.defaultExportFormat)}
                        options={[
                            { value: "csv", label: "CSV" },
                            { value: "pdf", label: "PDF Report" },
                            { value: "xlsx", label: "Excel (XLSX)" },
                        ]}
                    />

                    <SettingsToggle
                        id="include-charts"
                        label="Include Charts"
                        description="Include visualizations in exports"
                        checked={settings.includeCharts}
                        onCheckedChange={(v) => updateSetting("includeCharts", v)}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export const AnalyticsSettings = AnalyticsGeneralSettings
