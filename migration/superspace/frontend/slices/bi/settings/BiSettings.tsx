"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SettingsToggle, SettingsSelect } from "@/frontend/shared/settings/primitives"
import { useState } from "react"

export function BiSettings() {
  const [settings, setSettings] = useState({
    defaultChartType: "bar",
    refreshInterval: "manual",
    showDataLabels: true,
    enableAnimations: true,
    dateFormat: "relative",
    colorScheme: "default",
  })

  const updateSetting = <K extends keyof typeof settings>(key: K, value: typeof settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Chart Settings</CardTitle>
          <CardDescription>Configure default chart preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingsSelect
            label="Default Chart Type"
            description="Chart type used for new visualizations"
            value={settings.defaultChartType}
            onValueChange={(v) => updateSetting("defaultChartType", v)}
            options={[
              { value: "bar", label: "Bar Chart" },
              { value: "line", label: "Line Chart" },
              { value: "pie", label: "Pie Chart" },
              { value: "area", label: "Area Chart" },
            ]}
          />
          <SettingsSelect
            label="Color Scheme"
            description="Color palette for charts"
            value={settings.colorScheme}
            onValueChange={(v) => updateSetting("colorScheme", v)}
            options={[
              { value: "default", label: "Default" },
              { value: "vibrant", label: "Vibrant" },
              { value: "pastel", label: "Pastel" },
              { value: "monochrome", label: "Monochrome" },
            ]}
          />
          <SettingsToggle
            label="Show Data Labels"
            description="Display values on chart elements"
            checked={settings.showDataLabels}
            onCheckedChange={(v) => updateSetting("showDataLabels", v)}
          />
          <SettingsToggle
            label="Enable Animations"
            description="Animate chart transitions"
            checked={settings.enableAnimations}
            onCheckedChange={(v) => updateSetting("enableAnimations", v)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Settings</CardTitle>
          <CardDescription>Configure data refresh and formatting</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingsSelect
            label="Auto-Refresh Interval"
            description="How often to refresh dashboard data"
            value={settings.refreshInterval}
            onValueChange={(v) => updateSetting("refreshInterval", v)}
            options={[
              { value: "manual", label: "Manual Only" },
              { value: "1min", label: "Every 1 Minute" },
              { value: "5min", label: "Every 5 Minutes" },
              { value: "15min", label: "Every 15 Minutes" },
            ]}
          />
          <SettingsSelect
            label="Date Format"
            description="How to display dates in reports"
            value={settings.dateFormat}
            onValueChange={(v) => updateSetting("dateFormat", v)}
            options={[
              { value: "relative", label: "Relative (e.g., 2 days ago)" },
              { value: "absolute", label: "Absolute (e.g., Jan 15, 2025)" },
              { value: "iso", label: "ISO Format (e.g., 2025-01-15)" },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  )
}
