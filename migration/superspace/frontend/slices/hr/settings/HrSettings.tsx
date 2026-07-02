"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SettingsToggle, SettingsSelect } from "@/frontend/shared/settings/primitives"
import { useState } from "react"

export function HrSettings() {
  const [settings, setSettings] = useState({
    workWeekStart: "monday",
    defaultLeavePolicy: "standard",
    requireManagerApproval: true,
    showOrgChart: true,
    enableSelfService: true,
    probationPeriod: "90days",
  })

  const updateSetting = <K extends keyof typeof settings>(key: K, value: typeof settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Work Schedule</CardTitle>
          <CardDescription>Configure work week and time settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingsSelect
            label="Work Week Starts"
            description="First day of the work week"
            value={settings.workWeekStart}
            onValueChange={(v) => updateSetting("workWeekStart", v)}
            options={[
              { value: "sunday", label: "Sunday" },
              { value: "monday", label: "Monday" },
              { value: "saturday", label: "Saturday" },
            ]}
          />
          <SettingsSelect
            label="Probation Period"
            description="Default probation period for new hires"
            value={settings.probationPeriod}
            onValueChange={(v) => updateSetting("probationPeriod", v)}
            options={[
              { value: "30days", label: "30 Days" },
              { value: "60days", label: "60 Days" },
              { value: "90days", label: "90 Days" },
              { value: "180days", label: "180 Days" },
            ]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Leave Management</CardTitle>
          <CardDescription>Configure leave and time-off settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingsSelect
            label="Default Leave Policy"
            description="Applied to new employees"
            value={settings.defaultLeavePolicy}
            onValueChange={(v) => updateSetting("defaultLeavePolicy", v)}
            options={[
              { value: "standard", label: "Standard (20 days/year)" },
              { value: "generous", label: "Generous (25 days/year)" },
              { value: "unlimited", label: "Unlimited PTO" },
            ]}
          />
          <SettingsToggle
            label="Require Manager Approval"
            description="Leave requests need manager approval"
            checked={settings.requireManagerApproval}
            onCheckedChange={(v) => updateSetting("requireManagerApproval", v)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Employee Portal</CardTitle>
          <CardDescription>Employee self-service options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingsToggle
            label="Enable Self-Service"
            description="Allow employees to update their own info"
            checked={settings.enableSelfService}
            onCheckedChange={(v) => updateSetting("enableSelfService", v)}
          />
          <SettingsToggle
            label="Show Organization Chart"
            description="Display org chart to all employees"
            checked={settings.showOrgChart}
            onCheckedChange={(v) => updateSetting("showOrgChart", v)}
          />
        </CardContent>
      </Card>
    </div>
  )
}
