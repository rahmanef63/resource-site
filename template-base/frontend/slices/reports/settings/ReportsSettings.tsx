"use client"

/**
 * Reports Feature Settings
 * All settings with persistence using useReportsSettingsStorage
 */

import { SettingsSection } from "@/frontend/shared/settings/primitives/SettingsSection"
import { SettingsToggle } from "@/frontend/shared/settings/primitives/SettingsToggle"
import { SettingsSelect } from "@/frontend/shared/settings/primitives/SettingsSelect"
import { useReportsSettingsStorage } from "./useReportsSettings"

/**
 * Reports General Settings
 * Core report configuration
 */
export function ReportsGeneralSettings() {
  const { settings, updateSetting, isLoading } = useReportsSettingsStorage()

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-muted rounded-lg" />
  }

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Report Defaults"
        description="Configure default report settings"
      >
        <SettingsSelect
          label="Default Period"
          description="Default time period for reports"
          value={settings.defaultPeriod}
          onValueChange={(value) => updateSetting("defaultPeriod", value as typeof settings.defaultPeriod)}
          options={[
            { value: "daily", label: "Daily" },
            { value: "weekly", label: "Weekly" },
            { value: "monthly", label: "Monthly" },
            { value: "quarterly", label: "Quarterly" },
            { value: "yearly", label: "Yearly" },
          ]}
        />

        <SettingsSelect
          label="Date Format"
          description="How dates are displayed in reports"
          value={settings.dateFormat}
          onValueChange={(value) => updateSetting("dateFormat", value as typeof settings.dateFormat)}
          options={[
            { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
            { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
            { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
          ]}
        />

        <SettingsToggle
          label="Include Charts"
          description="Include visual charts in reports"
          checked={settings.includeCharts}
          onCheckedChange={(checked) => updateSetting("includeCharts", checked)}
        />

        <SettingsToggle
          label="Auto-Generate Reports"
          description="Automatically generate periodic reports"
          checked={settings.autoGenerate}
          onCheckedChange={(checked) => updateSetting("autoGenerate", checked)}
        />
      </SettingsSection>

      <SettingsSection
        title="Export"
        description="Export format settings"
      >
        <SettingsSelect
          label="Export Format"
          description="Default format for report exports"
          value={settings.exportFormat}
          onValueChange={(value) => updateSetting("exportFormat", value as typeof settings.exportFormat)}
          options={[
            { value: "pdf", label: "PDF" },
            { value: "excel", label: "Excel" },
            { value: "csv", label: "CSV" },
            { value: "html", label: "HTML" },
          ]}
        />
      </SettingsSection>
    </div>
  )
}

/**
 * Reports Schedule Settings
 * Automatic report scheduling
 */
export function ReportsScheduleSettings() {
  const { settings, updateSetting, isLoading } = useReportsSettingsStorage()

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-muted rounded-lg" />
  }

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Scheduled Reports"
        description="Configure automatic report scheduling"
      >
        <SettingsToggle
          label="Enable Scheduling"
          description="Automatically generate and send reports"
          checked={settings.schedulingEnabled}
          onCheckedChange={(checked) => updateSetting("schedulingEnabled", checked)}
        />

        <SettingsSelect
          label="Frequency"
          description="How often to generate reports"
          value={settings.scheduleFrequency}
          onValueChange={(value) => updateSetting("scheduleFrequency", value as typeof settings.scheduleFrequency)}
          options={[
            { value: "daily", label: "Daily" },
            { value: "weekly", label: "Weekly" },
            { value: "monthly", label: "Monthly" },
          ]}
          disabled={!settings.schedulingEnabled}
        />

        <SettingsSelect
          label="Schedule Day"
          description="Day of the week to generate reports"
          value={settings.scheduleDay}
          onValueChange={(value) => updateSetting("scheduleDay", value as typeof settings.scheduleDay)}
          options={[
            { value: "monday", label: "Monday" },
            { value: "tuesday", label: "Tuesday" },
            { value: "wednesday", label: "Wednesday" },
            { value: "thursday", label: "Thursday" },
            { value: "friday", label: "Friday" },
            { value: "saturday", label: "Saturday" },
            { value: "sunday", label: "Sunday" },
          ]}
          disabled={!settings.schedulingEnabled || settings.scheduleFrequency === "daily"}
        />
      </SettingsSection>

      <SettingsSection
        title="Delivery"
        description="How reports are delivered"
      >
        <SettingsToggle
          label="Send via Email"
          description="Email reports to recipients"
          checked={settings.sendEmail}
          onCheckedChange={(checked) => updateSetting("sendEmail", checked)}
          disabled={!settings.schedulingEnabled}
        />

        <SettingsSelect
          label="Recipients"
          description="Who receives scheduled reports"
          value={settings.recipients}
          onValueChange={(value) => updateSetting("recipients", value as typeof settings.recipients)}
          options={[
            { value: "owner", label: "Owner Only" },
            { value: "admins", label: "Admins" },
            { value: "all", label: "All Members" },
            { value: "custom", label: "Custom List" },
          ]}
          disabled={!settings.schedulingEnabled}
        />
      </SettingsSection>
    </div>
  )
}

/**
 * Reports Content Settings
 * What data to include in reports
 */
export function ReportsContentSettings() {
  const { settings, updateSetting, isLoading } = useReportsSettingsStorage()

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-muted rounded-lg" />
  }

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Data Content"
        description="Configure what data is included in reports"
      >
        <SettingsToggle
          label="Include Metrics"
          description="Include key metrics and KPIs"
          checked={settings.includeMetrics}
          onCheckedChange={(checked) => updateSetting("includeMetrics", checked)}
        />

        <SettingsToggle
          label="Include Trends"
          description="Show data trends over time"
          checked={settings.includeTrends}
          onCheckedChange={(checked) => updateSetting("includeTrends", checked)}
        />

        <SettingsToggle
          label="Include Comparison"
          description="Compare with previous periods"
          checked={settings.includeComparison}
          onCheckedChange={(checked) => updateSetting("includeComparison", checked)}
        />

        <SettingsSelect
          label="Comparison Period"
          description="What period to compare against"
          value={settings.comparisonPeriod}
          onValueChange={(value) => updateSetting("comparisonPeriod", value as typeof settings.comparisonPeriod)}
          options={[
            { value: "previous", label: "Previous Period" },
            { value: "year-ago", label: "Same Period Last Year" },
            { value: "custom", label: "Custom Range" },
          ]}
          disabled={!settings.includeComparison}
        />

        <SettingsToggle
          label="Show Empty Data"
          description="Include sections with no data"
          checked={settings.showEmptyData}
          onCheckedChange={(checked) => updateSetting("showEmptyData", checked)}
        />
      </SettingsSection>
    </div>
  )
}

/**
 * Reports Display Settings
 * Visual styling and layout
 */
export function ReportsDisplaySettings() {
  const { settings, updateSetting, isLoading } = useReportsSettingsStorage()

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-muted rounded-lg" />
  }

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Chart Style"
        description="Configure chart appearance"
      >
        <SettingsSelect
          label="Default Chart Style"
          description="Default chart type for visualizations"
          value={settings.chartStyle}
          onValueChange={(value) => updateSetting("chartStyle", value as typeof settings.chartStyle)}
          options={[
            { value: "line", label: "Line Chart" },
            { value: "bar", label: "Bar Chart" },
            { value: "pie", label: "Pie Chart" },
            { value: "area", label: "Area Chart" },
          ]}
        />

        <SettingsSelect
          label="Color Scheme"
          description="Color palette for charts"
          value={settings.colorScheme}
          onValueChange={(value) => updateSetting("colorScheme", value as typeof settings.colorScheme)}
          options={[
            { value: "default", label: "Default" },
            { value: "monochrome", label: "Monochrome" },
            { value: "vibrant", label: "Vibrant" },
            { value: "pastel", label: "Pastel" },
          ]}
        />
      </SettingsSection>

      <SettingsSection
        title="Page Layout"
        description="Report page settings"
      >
        <SettingsSelect
          label="Paper Size"
          description="Paper size for PDF exports"
          value={settings.paperSize}
          onValueChange={(value) => updateSetting("paperSize", value as typeof settings.paperSize)}
          options={[
            { value: "a4", label: "A4" },
            { value: "letter", label: "Letter" },
            { value: "legal", label: "Legal" },
          ]}
        />

        <SettingsSelect
          label="Orientation"
          description="Page orientation"
          value={settings.orientation}
          onValueChange={(value) => updateSetting("orientation", value as typeof settings.orientation)}
          options={[
            { value: "portrait", label: "Portrait" },
            { value: "landscape", label: "Landscape" },
          ]}
        />
      </SettingsSection>
    </div>
  )
}
